import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { calendarItemId, instagramPostId, metrics } = await req.json()

    console.log('Syncing Instagram analytics for calendar item:', calendarItemId)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get calendar item to find suggested product
    const { data: calendarItem, error: itemError } = await supabaseClient
      .from('calendar_items')
      .select('suggested_product, calendar_id, calendars(user_id)')
      .eq('id', calendarItemId)
      .single()

    if (itemError) throw itemError

    // If this post featured a specific product, update menu item analytics
    if (calendarItem.suggested_product) {
      const userId = (calendarItem as any).calendars.user_id

      // Update or insert menu item analytics
      const { data: existingAnalytics } = await supabaseClient
        .from('menu_item_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('menu_item_id', calendarItem.suggested_product)
        .single()

      const newTotalPosts = (existingAnalytics?.total_posts || 0) + 1
      const newTotalLikes = (existingAnalytics?.total_likes || 0) + (metrics.likes || 0)
      const newTotalComments = (existingAnalytics?.total_comments || 0) + (metrics.comments || 0)
      const newTotalSaves = (existingAnalytics?.total_saves || 0) + (metrics.saves || 0)
      const newTotalReach = (existingAnalytics?.total_reach || 0) + (metrics.reach || 0)
      const newTotalImpressions = (existingAnalytics?.total_impressions || 0) + (metrics.impressions || 0)

      // Calculate engagement rate: (likes + comments + saves) / reach * 100
      const totalEngagement = newTotalLikes + newTotalComments + newTotalSaves
      const avgEngagementRate = newTotalReach > 0 ? (totalEngagement / newTotalReach) * 100 : 0

      // Calculate performance score (weighted combination of metrics)
      const performanceScore = (
        (newTotalLikes * 1) +
        (newTotalComments * 3) +
        (newTotalSaves * 5) +
        (avgEngagementRate * 10)
      ) / newTotalPosts

      const { error: analyticsError } = await supabaseClient
        .from('menu_item_analytics')
        .upsert({
          user_id: userId,
          menu_item_id: calendarItem.suggested_product,
          menu_item_name: calendarItem.suggested_product,
          total_posts: newTotalPosts,
          total_likes: newTotalLikes,
          total_comments: newTotalComments,
          total_saves: newTotalSaves,
          total_reach: newTotalReach,
          total_impressions: newTotalImpressions,
          avg_engagement_rate: avgEngagementRate,
          performance_score: performanceScore,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,menu_item_id'
        })

      if (analyticsError) throw analyticsError

      console.log('Updated menu item analytics for:', calendarItem.suggested_product)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Analytics synced successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing analytics:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
