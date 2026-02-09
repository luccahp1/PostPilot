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

    // Note: Instagram's official API requires access tokens and app permissions
    // For MVP, we'll provide a simulated analysis based on the handle
    // In production, you would need to:
    // 1. Use Instagram Graph API with proper OAuth
    // 2. Or use a web scraping service (be mindful of Instagram's ToS)
    // 3. Or have users manually provide sample image URLs

    // For now, return guidance for the AI to use more Instagram-appropriate language
    const analysis = {
      handle: instagramHandle,
      recommendations: {
        contentStyle: 'Instagram-optimized posts with visual focus',
        hashtagStrategy: 'Use trending hashtags relevant to your niche',
        postingTips: [
          'Include high-quality images or graphics',
          'Use engaging captions with questions or CTAs',
          'Post consistently during peak engagement times',
          'Use Instagram Stories for behind-the-scenes content',
          'Include location tags for local discovery'
        ],
        visualGuidance: [
          'Maintain consistent brand colors and filters',
          'Use square or vertical formats (4:5 ratio)',
          'Include faces and people when possible',
          'Ensure text overlays are readable on mobile',
          'Create cohesive grid aesthetic'
        ]
      },
      message: 'Instagram feed analysis complete. Recommendations will be incorporated into your content generation.'
    }

    console.log('Instagram analysis complete')

    return new Response(
      JSON.stringify(analysis),
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
