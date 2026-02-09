import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { calendarItemId, imageUrl } = await req.json()

    console.log('Posting to Instagram for item:', calendarItemId)

    // Get business profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) throw profileError

    if (!profile.instagram_posting_enabled) {
      throw new Error('Instagram posting is not enabled. Please enable it in Settings.')
    }

    if (!profile.instagram_access_token) {
      throw new Error('Instagram account not connected. Please connect in Settings.')
    }

    // Check if token is expired
    if (profile.instagram_token_expires_at) {
      const expiresAt = new Date(profile.instagram_token_expires_at)
      if (expiresAt < new Date()) {
        throw new Error('Instagram access token expired. Please reconnect your account in Settings.')
      }
    }

    // Get the calendar item
    const { data: item, error: itemError } = await supabaseClient
      .from('calendar_items')
      .select('*')
      .eq('id', calendarItemId)
      .single()

    if (itemError) throw itemError

    if (!imageUrl) {
      throw new Error('Image URL is required for Instagram posting')
    }

    // Prepare caption with brand hashtag
    let caption = item.caption_long
    
    // Add hashtags
    const hashtags = [...item.hashtags]
    
    // Add brand hashtag if it exists and isn't already included
    if (profile.brand_hashtag && !hashtags.includes(profile.brand_hashtag)) {
      hashtags.push(profile.brand_hashtag)
    }

    caption += '\n\n' + hashtags.join(' ')
    
    // Add CTA at the end
    if (item.cta) {
      caption += '\n\n' + item.cta
    }

    console.log('Prepared caption with', hashtags.length, 'hashtags including brand hashtag')

    // Step 1: Create media container
    const createMediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${profile.instagram_user_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: profile.instagram_access_token,
        }),
      }
    )

    if (!createMediaResponse.ok) {
      const errorData = await createMediaResponse.json()
      console.error('Instagram API error (create media):', errorData)
      throw new Error(`Instagram API error: ${errorData.error?.message || 'Failed to create media container'}`)
    }

    const { id: mediaId } = await createMediaResponse.json()
    console.log('Media container created:', mediaId)

    // Step 2: Publish the media container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${profile.instagram_user_id}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaId,
          access_token: profile.instagram_access_token,
        }),
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error('Instagram API error (publish):', errorData)
      throw new Error(`Instagram API error: ${errorData.error?.message || 'Failed to publish post'}`)
    }

    const { id: postId } = await publishResponse.json()
    console.log('Post published successfully:', postId)

    // Sync analytics if this post featured a product
    if (item.suggested_product) {
      try {
        // Wait a few seconds for Instagram to process the post, then fetch insights
        setTimeout(async () => {
          try {
            const insightsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${postId}/insights?metric=engagement,impressions,reach,saved&access_token=${profile.instagram_access_token}`
            )
            
            if (insightsResponse.ok) {
              const insightsData = await insightsResponse.json()
              const metrics = {
                likes: 0,
                comments: 0,
                saves: 0,
                reach: 0,
                impressions: 0,
              }
              
              // Parse Instagram insights
              insightsData.data?.forEach((insight: any) => {
                if (insight.name === 'engagement') metrics.likes = insight.values[0]?.value || 0
                if (insight.name === 'impressions') metrics.impressions = insight.values[0]?.value || 0
                if (insight.name === 'reach') metrics.reach = insight.values[0]?.value || 0
                if (insight.name === 'saved') metrics.saves = insight.values[0]?.value || 0
              })
              
              // Call sync analytics function
              await supabaseClient.functions.invoke('sync-instagram-analytics', {
                body: {
                  calendarItemId,
                  instagramPostId: postId,
                  metrics,
                }
              })
            }
          } catch (analyticsError) {
            console.error('Failed to sync analytics:', analyticsError)
          }
        }, 5000) // Wait 5 seconds
      } catch (error) {
        console.error('Analytics sync error:', error)
      }
    }

    // Mark the calendar item as posted (you could add a 'posted_to_instagram' column if needed)
    
    return new Response(
      JSON.stringify({
        success: true,
        postId,
        message: 'Post published to Instagram successfully!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Instagram posting error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
