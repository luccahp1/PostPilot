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

    const { imageUrl } = await req.json()

    if (!imageUrl) {
      throw new Error('Image URL is required')
    }

    console.log('Analyzing menu image:', imageUrl)

    // Call OnSpace AI vision model to analyze menu
    const response = await fetch(`${ONSPACE_AI_BASE_URL}/chat/completions`, {
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
            content: 'You are a menu extraction assistant. Extract menu items from images and return them in a structured JSON format.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all menu items from this image. For each item, identify: name, description (if visible), price, and category. Return ONLY valid JSON in this exact format: {"items": [{"name": "Item Name", "description": "Description", "price": "$9.99", "category": "Category"}]}. If a field is not visible, use empty string. Be precise with prices and names.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`AI analysis failed: ${errorText}`)
    }

    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content ?? ''
    
    console.log('AI response:', content)

    // Parse the JSON from AI response
    let parsedItems
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content
      parsedItems = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Failed to parse menu items from AI response')
    }

    const items = parsedItems.items || []
    
    // Add unique IDs to each item
    const itemsWithIds = items.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
    }))

    console.log(`Extracted ${itemsWithIds.length} menu items`)

    return new Response(
      JSON.stringify({ items: itemsWithIds }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Menu analysis error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
