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

    const { businessType, currentHashtags } = await req.json()

    console.log('Analyzing hashtag performance for:', businessType)

    // Get business profile for context
    const { data: profile } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Use AI to suggest trending hashtags and identify underperformers
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
            content: 'You are a social media analytics expert specializing in Instagram hashtag strategy.'
          },
          {
            role: 'user',
            content: `Analyze these hashtags for a ${businessType} business and provide recommendations.

Business Type: ${businessType}
Location: ${profile?.city || 'Not specified'}, ${profile?.province || ''}
Current Hashtags: ${currentHashtags.join(', ')}

Please provide:
1. Which hashtags are likely underperforming (too broad, overused, or irrelevant)
2. Suggest 10-15 trending, niche-specific hashtags that would perform better
3. Include a mix of:
   - High-volume hashtags (100k-500k posts)
   - Medium-volume hashtags (10k-100k posts)  
   - Niche hashtags (1k-10k posts)
   - Location-based hashtags if applicable

Return your response as JSON with this structure:
{
  "underperforming": ["#hashtag1", "#hashtag2"],
  "suggested": ["#hashtag1", "#hashtag2", ...],
  "reasoning": "Brief explanation of recommendations"
}`
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
    let analysisText = aiData.choices?.[0]?.message?.content?.trim() ?? ''
    
    // Extract JSON from markdown code blocks if present
    if (analysisText.includes('```json')) {
      analysisText = analysisText.split('```json')[1].split('```')[0].trim()
    } else if (analysisText.includes('```')) {
      analysisText = analysisText.split('```')[1].split('```')[0].trim()
    }

    const analysis = JSON.parse(analysisText)

    console.log('Hashtag analysis complete, saving to database...')

    // Save analyzed hashtags to the database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // For each suggested hashtag, insert or update analytics
    for (const hashtag of analysis.suggested) {
      // Check if hashtag already exists
      const { data: existing } = await supabaseAdmin
        .from('hashtag_analytics')
        .select('id')
        .eq('user_id', user.id)
        .eq('hashtag', hashtag)
        .single()

      if (!existing) {
        // Insert new hashtag with initial performance score
        const { error: insertError } = await supabaseAdmin
          .from('hashtag_analytics')
          .insert({
            user_id: user.id,
            hashtag: hashtag,
            performance_score: 50, // Default middle score for new suggestions
            impressions: 0,
            reach: 0,
            engagement: 0
          })

        if (insertError) {
          console.error('Error inserting hashtag:', insertError)
        }
      }
    }

    // Mark underperforming hashtags with lower score
    for (const hashtag of analysis.underperforming) {
      const { error: updateError } = await supabaseAdmin
        .from('hashtag_analytics')
        .update({ performance_score: 20 }) // Low score for underperforming
        .eq('user_id', user.id)
        .eq('hashtag', hashtag)

      if (updateError) {
        console.error('Error updating underperforming hashtag:', updateError)
      }
    }

    console.log('Hashtags saved to database')

    return new Response(
      JSON.stringify({
        ...analysis,
        message: `Added ${analysis.suggested.length} trending hashtags to your analytics!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Hashtag analysis error:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        underperforming: [],
        suggested: [],
        reasoning: 'Analysis failed'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
