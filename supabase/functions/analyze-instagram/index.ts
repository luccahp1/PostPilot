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

    const { instagramHandle } = await req.json()

    if (!instagramHandle) {
      throw new Error('Instagram handle is required')
    }

    console.log('Analyzing Instagram feed for:', instagramHandle)

    // Get business profile to understand context
    const { data: profile } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      throw new Error('Business profile not found')
    }

    // Use OnSpace AI to generate Instagram-specific recommendations
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
            content: 'You are an Instagram marketing expert who analyzes Instagram profiles and provides strategic recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this Instagram profile and provide strategic recommendations for content creation.

Instagram Handle: @${instagramHandle.replace('@', '')}
Business Type: ${profile.business_type}
Business Name: ${profile.business_name}
Location: ${profile.city}, ${profile.province}
Brand Vibe: ${profile.brand_vibe.join(', ')}
Primary Goals: ${profile.primary_goal.join(', ')}

Provide recommendations in the following areas:
1. Content Style & Themes (based on typical ${profile.business_type} Instagram accounts)
2. Hashtag Strategy (specific to ${profile.business_type} and ${profile.city})
3. Posting Tips (best practices for ${profile.business_type})
4. Visual Guidance (colors, layouts, composition that work for ${profile.business_type})
5. Engagement Tactics (how to interact with followers)

Return your response as JSON with this structure:
{
  "contentStyle": "description",
  "hashtagStrategy": "strategy description",
  "postingTips": ["tip1", "tip2", ...],
  "visualGuidance": ["guideline1", "guideline2", ...],
  "engagementTactics": ["tactic1", "tactic2", ...],
  "summary": "brief summary of key recommendations"
}`
          }
        ]
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`OnSpace AI: ${errorText}`)
    }

    const aiData = await aiResponse.json()
    let analysisText = aiData.choices?.[0]?.message?.content?.trim() ?? ''
    
    // Extract JSON from markdown code blocks if present
    if (analysisText.includes('```json')) {
      analysisText = analysisText.split('```json')[1].split('```')[0].trim()
    } else if (analysisText.includes('```')) {
      analysisText = analysisText.split('```')[1].split('```')[0].trim()
    }

    const recommendations = JSON.parse(analysisText)

    // Save Instagram analysis to permanent context
    const instagramContext = `\n\n=== INSTAGRAM FEED ANALYSIS ===\nHandle: @${instagramHandle.replace('@', '')}\nContent Style: ${recommendations.contentStyle}\nHashtag Strategy: ${recommendations.hashtagStrategy}\nSummary: ${recommendations.summary}\n`

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const currentContext = profile.permanent_context || ''
    const updatedContext = currentContext.includes('INSTAGRAM FEED ANALYSIS')
      ? currentContext.replace(/=== INSTAGRAM FEED ANALYSIS ===[\s\S]*?(?=\n===|$)/, instagramContext.trim())
      : currentContext + instagramContext

    const { error: updateError } = await supabaseAdmin
      .from('business_profiles')
      .update({ permanent_context: updatedContext })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error saving Instagram analysis:', updateError)
      throw updateError
    }

    console.log('Instagram analysis complete and saved to permanent context')

    return new Response(
      JSON.stringify({
        handle: instagramHandle,
        recommendations,
        message: 'Instagram feed analyzed! Recommendations will be used in all future content generation.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Instagram analysis error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
