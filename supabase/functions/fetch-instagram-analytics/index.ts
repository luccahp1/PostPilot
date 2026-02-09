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

    // Get business profile with Instagram access token
    const { data: profile } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      throw new Error('Business profile not found')
    }

    if (!profile.instagram_posting_enabled || !profile.instagram_access_token || !profile.instagram_user_id) {
      throw new Error('Instagram not connected. Please connect your Instagram account in Settings.')
    }

    console.log('Fetching Instagram analytics for user:', profile.instagram_user_id)

    // Fetch recent posts from Instagram Graph API
    const postsResponse = await fetch(
      `https://graph.instagram.com/${profile.instagram_user_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${profile.instagram_access_token}&limit=25`
    )

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text()
      console.error('Instagram API error:', errorText)
      throw new Error(`Failed to fetch Instagram posts: ${errorText}`)
    }

    const postsData = await postsResponse.json()
    const posts = postsData.data || []

    console.log(`Fetched ${posts.length} Instagram posts`)

    // Fetch insights for each post
    const analyticsData = []
    
    for (const post of posts) {
      try {
        // Fetch post insights (reach, impressions, saved, engagement)
        const insightsResponse = await fetch(
          `https://graph.instagram.com/${post.id}/insights?metric=reach,impressions,saved,engagement&access_token=${profile.instagram_access_token}`
        )

        let reach = 0
        let impressions = 0
        let saves = 0

        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          const insights = insightsData.data || []

          insights.forEach((insight: any) => {
            if (insight.name === 'reach') reach = insight.values[0]?.value || 0
            if (insight.name === 'impressions') impressions = insight.values[0]?.value || 0
            if (insight.name === 'saved') saves = insight.values[0]?.value || 0
          })
        }

        const likes = post.like_count || 0
        const comments = post.comments_count || 0
        const totalEngagement = likes + comments + saves
        const engagementRate = reach > 0 ? ((totalEngagement / reach) * 100) : 0

        analyticsData.push({
          user_id: user.id,
          instagram_post_id: post.id,
          post_type: post.media_type?.toLowerCase() || 'image',
          caption: post.caption || '',
          posted_at: post.timestamp,
          likes,
          comments,
          saves,
          reach,
          impressions,
          engagement_rate: parseFloat(engagementRate.toFixed(2)),
          media_url: post.media_url,
          permalink: post.permalink,
          last_synced_at: new Date().toISOString()
        })
      } catch (error) {
        console.error(`Error fetching insights for post ${post.id}:`, error)
        // Continue with basic data even if insights fail
        analyticsData.push({
          user_id: user.id,
          instagram_post_id: post.id,
          post_type: post.media_type?.toLowerCase() || 'image',
          caption: post.caption || '',
          posted_at: post.timestamp,
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
          saves: 0,
          reach: 0,
          impressions: 0,
          engagement_rate: 0,
          media_url: post.media_url,
          permalink: post.permalink,
          last_synced_at: new Date().toISOString()
        })
      }
    }

    // Save analytics to database (upsert to avoid duplicates)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const analytics of analyticsData) {
      // Check if record exists
      const { data: existing } = await supabaseAdmin
        .from('instagram_post_analytics')
        .select('id')
        .eq('instagram_post_id', analytics.instagram_post_id)
        .single()

      if (existing) {
        // Update existing record
        await supabaseAdmin
          .from('instagram_post_analytics')
          .update(analytics)
          .eq('instagram_post_id', analytics.instagram_post_id)
      } else {
        // Insert new record
        await supabaseAdmin
          .from('instagram_post_analytics')
          .insert(analytics)
      }
    }

    console.log(`Saved ${analyticsData.length} analytics records`)

    // Calculate summary statistics
    const totalLikes = analyticsData.reduce((sum, p) => sum + p.likes, 0)
    const totalComments = analyticsData.reduce((sum, p) => sum + p.comments, 0)
    const totalSaves = analyticsData.reduce((sum, p) => sum + p.saves, 0)
    const avgEngagementRate = analyticsData.length > 0 
      ? analyticsData.reduce((sum, p) => sum + p.engagement_rate, 0) / analyticsData.length 
      : 0

    return new Response(
      JSON.stringify({
        success: true,
        postsAnalyzed: analyticsData.length,
        summary: {
          totalLikes,
          totalComments,
          totalSaves,
          avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2))
        },
        posts: analyticsData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Instagram analytics fetch error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
