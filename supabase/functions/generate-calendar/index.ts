import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface GenerateCalendarRequest {
  businessName: string
  businessType: string
  city?: string
  neighborhood?: string
  primaryOffer?: string
  brandVibe: string[]
  postingFrequency: string
  primaryGoal: string
  monthYear: string
  businessDescription?: string
  productsServices?: string
  permanentContext?: string
  menuItems?: any[]
  categoryFocus?: string[] | null
  userId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      businessName,
      businessType,
      city,
      neighborhood,
      primaryOffer,
      brandVibe,
      postingFrequency,
      primaryGoal,
      monthYear,
      businessDescription,
      productsServices,
      permanentContext,
      menuItems,
      categoryFocus,
      userId,
    }: GenerateCalendarRequest = await req.json()

    console.log('Generating calendar for:', businessName)

    // Fetch product images for AI reference
    let productImages: any[] = []
    if (userId) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data: images } = await supabaseClient
        .from('product_images')
        .select('*')
        .eq('user_id', userId)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })

      if (images) {
        productImages = images
        console.log(`Found ${productImages.length} product images`)
      }
    }

    const location = [city, neighborhood].filter(Boolean).join(', ')
    
    const frequencyMap: Record<string, number> = {
      'daily': 30,
      '5x-week': 22,
      '3x-week': 13,
    }
    const totalDays = frequencyMap[postingFrequency] || 30

    const weeklyStructure = `
Weekly content structure (repeat this pattern):
- Monday: Educational tip or how-to
- Tuesday: Product/service spotlight
- Wednesday: Customer testimonial or social proof
- Thursday: Behind-the-scenes
- Friday: Promotional offer or special
- Saturday: Community/local focus
- Sunday: Light engagement or fun content
`

    const permanentInstructions = permanentContext ? `

PERMANENT INSTRUCTIONS (MUST FOLLOW IN ALL CONTENT):
${permanentContext}
` : ''

    // Category-specific focus
    const categoryInstructions = categoryFocus && categoryFocus.length > 0 ? `

CATEGORY FOCUS FOR THIS CALENDAR:
This calendar should primarily feature and promote items from these categories: ${categoryFocus.join(', ')}

Menu items to highlight:
${menuItems?.filter((item: any) => categoryFocus.includes(item.category)).map((item: any) => 
  `- ${item.name}${item.price ? ` (${item.price})` : ''}${item.description ? ` - ${item.description}` : ''}`
).join('\n') || 'No specific items'}

Content Strategy:
- At least 60% of posts should directly reference or feature these categories
- Use specific product names and details from the menu items listed above
- Create themed posts around these categories (e.g., "Dessert Week", "Drink Specials")
- Include product highlights, recipes, pairings, and customer favorites from these categories
` : (menuItems && menuItems.length > 0 ? `

AVAILABLE MENU ITEMS (reference these in content when relevant):
${menuItems.map((item: any) => {
  const itemImages = productImages.filter((img: any) => img.menu_item_id === item.id)
  const featuredImage = itemImages.find((img: any) => img.is_featured)
  const imageNote = featuredImage ? ` [HAS PRODUCT IMAGE: ${featuredImage.image_url}]` : itemImages.length > 0 ? ` [HAS ${itemImages.length} IMAGES]` : ''
  return `- ${item.name}${item.category ? ` [${item.category}]` : ''}${item.price ? ` (${item.price})` : ''}${item.description ? ` - ${item.description}` : ''}${imageNote}`
}).join('\n')}
` : '')

    const systemPrompt = `You are an expert social media strategist for local businesses. Generate a ${totalDays}-day Instagram content calendar for ${monthYear}.

Business Details:
- Name: ${businessName}
- Type: ${businessType}
${businessDescription ? `- What we do: ${businessDescription}` : ''}
${productsServices ? `- What we offer: ${productsServices}` : ''}
- Location: ${location || 'Not specified'}
- Brand Vibe: ${brandVibe.join(', ')}
- Primary Goal: ${primaryGoal}
${primaryOffer ? `- Current Offer: ${primaryOffer}` : ''}
${permanentInstructions}
${categoryInstructions}

${productImages.length > 0 ? `
PRODUCT IMAGE REFERENCES:
The business has uploaded ${productImages.length} product images. When creating posts about specific menu items that have product images (marked with [HAS PRODUCT IMAGE] or [HAS X IMAGES]), indicate which product the post should feature so we can automatically select the best matching image.

For product-specific posts, include a "suggestedProduct" field with the exact product name from the menu items list.
` : ''}

${weeklyStructure}

Content Rules:
1. Mix post types: Reels (video-worthy), Photos (single image), Carousels (multi-image), Stories (quick/timely)
2. Vary themes across these pillars: promo, education, social proof, behind-the-scenes, community, engagement
3. Keep captions authentic and conversational
4. Use ${location ? 'local references when relevant' : 'general themes'}
5. Include clear CTAs (book now, visit us, DM us, tag a friend, etc.)
6. Hashtags: 8-12 relevant tags, mix popular and niche
7. Canva prompts should be specific and actionable for non-designers

${primaryOffer ? `Feature the current offer "${primaryOffer}" in 3-4 posts throughout the month.` : ''}

Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "day": 1,
      "date": "2026-02-01",
      "postType": "photo",
      "theme": "Welcome February",
      "captionShort": "Short engaging caption under 100 chars",
      "captionLong": "Longer caption with story/detail 150-250 chars",
      "hashtags": ["#localbusiness", "#${businessType.toLowerCase().replace(/\s/g, '')}", ...],
      "cta": "Visit us this weekend!",
      "canvaPrompt": "Create a vibrant photo collage with...",
      "imageIdeas": "Behind counter shot, product close-up",
      "suggestedProduct": "Product name from menu (ONLY if this post features a specific product)"
    }
  ]
}

Generate exactly ${totalDays} days starting from the 1st of the month. Use realistic dates for ${monthYear}.`

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY')
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL')

    if (!apiKey || !baseUrl) {
      throw new Error('OnSpace AI credentials not configured')
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
          { role: 'user', content: `Generate the ${totalDays}-day content calendar for ${businessName} in ${monthYear}.` }
        ],
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OnSpace AI error:', errorText)
      throw new Error(`OnSpace AI: ${errorText}`)
    }

    const aiData = await response.json()
    const content = aiData.choices?.[0]?.message?.content ?? ''

    if (!content) {
      throw new Error('No content generated from AI')
    }

    console.log('AI Response:', content.substring(0, 200))

    let calendarData
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        calendarData = JSON.parse(jsonMatch[0])
      } else {
        calendarData = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Failed to parse AI response as JSON')
    }

    if (!calendarData.items || !Array.isArray(calendarData.items)) {
      throw new Error('Invalid calendar data structure')
    }

    // Match suggested products with actual product images
    const enhancedItems = calendarData.items.map((item: any) => {
      if (item.suggestedProduct && productImages.length > 0) {
        // Find matching menu item
        const menuItem = menuItems?.find((m: any) => 
          m.name.toLowerCase() === item.suggestedProduct.toLowerCase()
        )

        if (menuItem) {
          // Find featured image for this menu item
          const featuredImage = productImages.find((img: any) => 
            img.menu_item_id === menuItem.id && img.is_featured
          )

          // Or just get the first image for this menu item
          const anyImage = productImages.find((img: any) => 
            img.menu_item_id === menuItem.id
          )

          const selectedImage = featuredImage || anyImage

          if (selectedImage) {
            return {
              ...item,
              productImageUrl: selectedImage.image_url,
              productImageId: selectedImage.id,
            }
          }
        }
      }
      return item
    })

    return new Response(JSON.stringify({ items: enhancedItems }), {
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
