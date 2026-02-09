import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RegenerateDayRequest {
  itemId: string
  businessProfileId: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { itemId, businessProfileId }: RegenerateDayRequest = await req.json()

    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: item, error: itemError } = await supabase
      .from('calendar_items')
      .select('*, calendars!inner(user_id)')
      .eq('id', itemId)
      .single()

    if (itemError) throw new Error('Item not found')
    if (item.calendars.user_id !== user.id) throw new Error('Unauthorized')

    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('id', businessProfileId)
      .single()

    if (profileError) throw new Error('Business profile not found')

    const location = [profile.city, profile.neighborhood].filter(Boolean).join(', ')
    const permanentInstructions = profile.permanent_context ? `\n\nPERMANENT INSTRUCTIONS (MUST FOLLOW):\n${profile.permanent_context}\n` : ''

    const systemPrompt = `You are a social media expert. Regenerate a fresh, different Instagram post for this business.

Business: ${profile.business_name} (${profile.business_type})
${profile.business_description ? `What we do: ${profile.business_description}` : ''}
${profile.products_services ? `What we offer: ${profile.products_services}` : ''}
Location: ${location || 'Not specified'}
Brand Vibe: ${profile.brand_vibe.join(', ')}
Goal: ${profile.primary_goal}
${permanentInstructions}

Previous post theme was: ${item.theme}
Generate something DIFFERENT but equally engaging.

Return ONLY valid JSON:
{
  "postType": "photo|reel|carousel|story",
  "theme": "New theme/angle",
  "captionShort": "Under 100 chars",
  "captionLong": "150-250 chars with story",
  "hashtags": ["8-12 relevant tags"],
  "cta": "Clear call-to-action",
  "canvaPrompt": "Specific design instructions",
  "imageIdeas": "Visual suggestions"
}`

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY')
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL')

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI not configured')
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a new post idea.' }
        ],
        temperature: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OnSpace AI: ${errorText}`)
    }

    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content ?? ''

    let newPost
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      newPost = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
    } catch {
      throw new Error('Failed to parse AI response')
    }

    const { data: updated, error: updateError } = await supabase
      .from('calendar_items')
      .update({
        post_type: newPost.postType,
        theme: newPost.theme,
        caption_short: newPost.captionShort,
        caption_long: newPost.captionLong,
        hashtags: newPost.hashtags,
        cta: newPost.cta,
        canva_prompt: newPost.canvaPrompt,
        image_ideas: newPost.imageIdeas || null,
      })
      .eq('id', itemId)
      .select()
      .single()

    if (updateError) throw updateError

    return new Response(JSON.stringify(updated), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
