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

    const { storyType, topic } = await req.json()

    console.log('Generating Instagram Story:', storyType, topic)

    // Get business profile
    const { data: profile } = await supabaseClient
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      throw new Error('Business profile not found')
    }

    // Build context from profile
    const context = `
Business: ${profile.business_name}
Type: ${profile.business_type}
Description: ${profile.business_description || 'Not provided'}
Products/Services: ${profile.products_services || 'Not provided'}
Brand Vibe: ${profile.brand_vibe.join(', ')}
${profile.permanent_context ? `\nPermanent Instructions:\n${profile.permanent_context}` : ''}
`

    // Generate story content based on type
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
            content: `You are a social media content creator specializing in Instagram Stories. Create engaging, story-format content that feels native to Instagram Stories (vertical format, casual tone, interactive elements).`
          },
          {
            role: 'user',
            content: `${context}

Create an Instagram Story about: ${topic}
Story Type: ${storyType}

Return JSON with:
{
  "text": "Main text overlay (2-3 short lines, max 50 chars per line)",
  "caption": "Optional caption text (1-2 sentences)",
  "callToAction": "Interactive CTA (e.g., 'Swipe up', 'Tap to see more', 'DM us')",
  "suggestedStickers": ["emoji or sticker suggestion 1", "emoji or sticker suggestion 2"],
  "visualGuidance": "What the background image/video should show",
  "interactivePoll": ${storyType === 'poll' ? '{"question": "Poll question?", "option1": "Option 1", "option2": "Option 2"}' : 'null'},
  "backgroundColor": "Suggested background color (hex code)",
  "textColor": "Suggested text color (hex code)"
}`
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
    let storyContent = aiData.choices?.[0]?.message?.content?.trim() ?? ''
    
    // Extract JSON
    if (storyContent.includes('```json')) {
      storyContent = storyContent.split('```json')[1].split('```')[0].trim()
    } else if (storyContent.includes('```')) {
      storyContent = storyContent.split('```')[1].split('```')[0].trim()
    }

    const story = JSON.parse(storyContent)

    // Save to database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: savedStory, error: saveError } = await supabaseAdmin
      .from('instagram_stories')
      .insert({
        user_id: user.id,
        content: JSON.stringify(story),
        story_type: storyType,
        stickers: story.suggestedStickers || []
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving story:', saveError)
    }

    console.log('Story generated successfully')

    return new Response(
      JSON.stringify({ story, storyId: savedStory?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Story generation error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
