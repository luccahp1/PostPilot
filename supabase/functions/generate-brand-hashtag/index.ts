import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY')
const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL')

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

    const { businessName, businessType, productsServices } = await req.json()

    console.log('Generating brand hashtag for:', businessName)

    // Use AI to generate a unique, memorable brand hashtag
    const aiResponse = await fetch(`${ONSPACE_AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ONSPACE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a social media branding expert who creates memorable, unique hashtags for businesses.'
          },
          {
            role: 'user',
            content: `Create ONE unique branded hashtag for this business. The hashtag should be:
- Memorable and easy to spell
- Related to the business name AND what they offer
- Not too long (max 20 characters)
- Unique enough that customers can use it to share their experiences
- Include the business essence

Business Name: ${businessName}
Business Type: ${businessType}
What They Offer: ${productsServices || 'Not specified'}

Return ONLY the hashtag (including the #) with no additional text or explanation. Example format: #LuccasCoffeeMoments`
          }
        ]
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`AI generation failed: ${errorText}`)
    }

    const aiData = await aiResponse.json()
    let brandHashtag = aiData.choices?.[0]?.message?.content?.trim() ?? ''
    
    console.log('AI generated hashtag:', brandHashtag)

    // Clean up the hashtag - ensure it starts with # and has no spaces
    brandHashtag = brandHashtag
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9#_]/g, '')
    
    if (!brandHashtag.startsWith('#')) {
      brandHashtag = '#' + brandHashtag
    }

    // Update the business profile with the brand hashtag
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin
      .from('business_profiles')
      .update({ brand_hashtag: brandHashtag })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating brand hashtag:', updateError)
      throw updateError
    }

    console.log('Brand hashtag generated and saved:', brandHashtag)

    return new Response(
      JSON.stringify({ brandHashtag }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Brand hashtag generation error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
