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

    const { accessToken } = await req.json()

    if (!accessToken) {
      throw new Error('Access token is required')
    }

    console.log('Connecting Instagram account...')

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${Deno.env.get('FACEBOOK_APP_ID')}&client_secret=${Deno.env.get('FACEBOOK_APP_SECRET')}&fb_exchange_token=${accessToken}`
    )

    if (!longLivedResponse.ok) {
      throw new Error('Failed to exchange token for long-lived token')
    }

    const { access_token: longLivedToken, expires_in } = await longLivedResponse.json()

    // Get Instagram Business Account ID
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    )

    if (!accountsResponse.ok) {
      throw new Error('Failed to get Facebook pages')
    }

    const accountsData = await accountsResponse.json()
    
    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error('No Facebook pages found. Please connect your Instagram Business Account to a Facebook Page.')
    }

    // Get the first page's Instagram Business Account
    const pageId = accountsData.data[0].id
    const pageAccessToken = accountsData.data[0].access_token

    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )

    if (!igResponse.ok) {
      throw new Error('Failed to get Instagram Business Account')
    }

    const igData = await igResponse.json()

    if (!igData.instagram_business_account) {
      throw new Error('No Instagram Business Account connected to this Facebook Page')
    }

    const instagramUserId = igData.instagram_business_account.id

    // Calculate expiration date (long-lived tokens expire in 60 days)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in)

    // Update business profile with Instagram credentials
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin
      .from('business_profiles')
      .update({
        instagram_access_token: pageAccessToken,
        instagram_user_id: instagramUserId,
        instagram_token_expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error saving Instagram credentials:', updateError)
      throw updateError
    }

    console.log('Instagram account connected successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Instagram account connected successfully!',
        expiresAt: expiresAt.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Instagram connection error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
