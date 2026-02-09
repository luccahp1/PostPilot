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

    const { calendarItemId, scheduledTime, timezone, imageUrl } = await req.json()

    if (!calendarItemId || !scheduledTime || !timezone) {
      throw new Error('Missing required fields')
    }

    console.log('Scheduling post for:', scheduledTime, timezone)

    // Create scheduled post
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        calendar_item_id: calendarItemId,
        scheduled_time: scheduledTime,
        timezone: timezone,
        image_url: imageUrl,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating scheduled post:', error)
      throw error
    }

    console.log('Post scheduled successfully:', data.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        scheduledPost: data,
        message: `Post scheduled for ${new Date(scheduledTime).toLocaleString()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Schedule post error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
