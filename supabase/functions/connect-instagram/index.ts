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
            error: 'Meta App credentials not configured in backend' 
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
      `https://graph.instagram.com/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: appId!,
          client_secret: appSecret!,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code
        })
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`Instagram: ${errorData.error?.message || errorData.error_message || 'Failed to get access token'}`)
    }

    const tokenData = await tokenResponse.json()
    const shortLivedToken = tokenData.access_token
    const instagramUserId = tokenData.user_id

    console.log('Got short-lived token, exchanging for long-lived token...')

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&` +
      `client_secret=${appSecret}&` +
      `access_token=${shortLivedToken}`
    )

    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.json()
      throw new Error(`Instagram: ${errorData.error?.message || errorData.error_message || 'Failed to exchange token'}`)
    }

    const longLivedData = await longLivedResponse.json()
    const longLivedToken = longLivedData.access_token
    const expires_in = longLivedData.expires_in || 5184000 // 60 days default

    console.log('Successfully obtained long-lived token')

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
        instagram_access_token: longLivedToken,
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
