export interface GeneratorFormData {
  businessType: string
  businessName: string
  city: string
  neighborhood: string
  primaryOffer: string
  brandVibe: string[]
  postingFrequency: string
  primaryGoal: string
}

export interface GeneratedCalendar {
  items: GeneratedCalendarItem[]
}

export interface GeneratedCalendarItem {
  day: number
  date: string
  postType: string
  theme: string
  captionShort: string
  captionLong: string
  hashtags: string[]
  cta: string
  canvaPrompt: string
  imageIdeas?: string
}

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
}

export interface BusinessProfile {
  id: string
  user_id: string
  business_name: string
  business_type: string
  city: string | null
  neighborhood: string | null
  primary_offer: string | null
  brand_vibe: string[]
  posting_frequency: string
  primary_goal: string
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  business_description: string | null
  products_services: string | null
  permanent_context: string | null
  created_at: string
  updated_at: string
}
