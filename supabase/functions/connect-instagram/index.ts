import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    
    // Handle config check request
    if (body.checkConfig) {
      const appId = Deno.env.get('FACEBOOK_APP_ID')
      const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')
      
      if (!appId || !appSecret) {
        return new Response(
          JSON.stringify({ 
            configured: false,
            error: 'Facebook App credentials not configured in backend' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      return new Response(
        JSON.stringify({ configured: true, appId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle OAuth callback with authorization code
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

    const { code, redirectUri } = body

    if (!code) {
      throw new Error('Authorization code is required')
    }

    console.log('Exchanging authorization code for access token...')

    // Exchange authorization code for access token
    const appId = Deno.env.get('FACEBOOK_APP_ID')
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET')

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`Facebook: ${errorData.error?.message || 'Failed to get access token'}`)
    }

    const { access_token: shortLivedToken } = await tokenResponse.json()

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`
    )

    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.json()
      throw new Error(`Facebook: ${errorData.error?.message || 'Failed to exchange token'}`)
    }

    const { access_token: longLivedToken, expires_in } = await longLivedResponse.json()

    // Get Instagram Business Account ID
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    )

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json()
      throw new Error(`Facebook: ${errorData.error?.message || 'Failed to get pages'}`)
    }

    const accountsData = await accountsResponse.json()
    
    if (!accountsData.data || accountsData.data.length === 0) {
      throw new Error('No Facebook pages found. Connect your Instagram Business Account to a Facebook Page first.')
    }

    // Get the first page's Instagram Business Account
    const pageId = accountsData.data[0].id
    const pageAccessToken = accountsData.data[0].access_token

    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )

    if (!igResponse.ok) {
      const errorData = await igResponse.json()
      throw new Error(`Facebook: ${errorData.error?.message || 'Failed to get Instagram account'}`)
    }

    const igData = await igResponse.json()

    if (!igData.instagram_business_account) {
      throw new Error('No Instagram Business Account linked to this Facebook Page. Link them in your Instagram app settings.')
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
