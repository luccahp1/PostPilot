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

    const { websiteUrl } = await req.json()

    if (!websiteUrl) {
      throw new Error('Website URL is required')
    }

    console.log('Analyzing website:', websiteUrl)

    // Fetch the website HTML
    const websiteResponse = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Neighborhood Social/1.0; +https://neighborhoodsocial.app)'
      }
    })

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.statusText}`)
    }

    const html = await websiteResponse.text()

    // Use AI to analyze the website content
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
            content: 'You are a brand analysis assistant. Analyze website HTML and extract brand information.'
          },
          {
            role: 'user',
            content: `Analyze this website HTML and extract: 1) Brand colors (hex codes), 2) Key messaging/taglines, 3) Main products/services offered, 4) Brand tone (formal/casual/playful etc), 5) Target audience. Return ONLY valid JSON: {"colors": ["#hex"], "messaging": ["tagline"], "services": ["service"], "tone": "description", "audience": "description"}

HTML (first 5000 chars):
${html.substring(0, 5000)}`
          }
        ]
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`AI analysis failed: ${errorText}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices?.[0]?.message?.content ?? ''
    
    console.log('AI response:', content)

    // Parse the JSON from AI response
    let analysis
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
      analysis = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // Return default analysis if parsing fails
      analysis = {
        colors: [],
        messaging: [],
        services: [],
        tone: 'professional',
        audience: 'general public'
      }
    }

    console.log('Website analysis complete')

    return new Response(
      JSON.stringify({
        url: websiteUrl,
        analysis,
        message: 'Website analysis complete. Brand insights will be used to personalize your content.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Website analysis error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
