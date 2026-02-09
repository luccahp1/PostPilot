export interface AuthUser {
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
  province: string | null
  instagram_handle: string | null
  website_url: string | null
  brand_vibe: string[]
  posting_frequency: string
  primary_goal: string[]
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  business_description: string | null
  products_services: string | null
  permanent_context: string | null
  menu_items: MenuItem[]
  instagram_posting_enabled: boolean
  instagram_access_token: string | null
  instagram_user_id: string | null
  instagram_token_expires_at: string | null
  brand_hashtag: string | null
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price?: string
  category?: string
}

export interface Calendar {
  id: string
  user_id: string
  business_profile_id: string
  month_year: string
  created_at: string
}

export interface CalendarItem {
  id: string
  calendar_id: string
  day_number: number
  post_date: string
  post_type: string
  theme: string
  caption_short: string
  caption_long: string
  hashtags: string[]
  cta: string
  canva_prompt: string
  image_ideas: string | null
  created_at: string
}
