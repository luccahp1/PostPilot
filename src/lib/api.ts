import { supabase } from '@/lib/supabase'

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
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price?: string
  category?: string
  order?: number
}

export interface ProductImage {
  id: string
  user_id: string
  menu_item_id: string
  image_url: string
  image_path: string
  product_name: string
  description?: string
  is_featured: boolean
  display_order: number
  created_at: string
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

export const api = {
  // Business Profile
  async getBusinessProfile(): Promise<BusinessProfile | null> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createBusinessProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('business_profiles')
      .insert({ ...profile, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateBusinessProfile(id: string, profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .update(profile)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Calendar
  async getCalendars(): Promise<Calendar[]> {
    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getCalendar(id: string): Promise<Calendar> {
    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createCalendar(calendar: Partial<Calendar>): Promise<Calendar> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('calendars')
      .insert({ ...calendar, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCalendar(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendars')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Calendar Items
  async getCalendarItems(calendarId: string): Promise<CalendarItem[]> {
    const { data, error } = await supabase
      .from('calendar_items')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('day_number', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createCalendarItems(items: Partial<CalendarItem>[]): Promise<CalendarItem[]> {
    const { data, error } = await supabase
      .from('calendar_items')
      .insert(items)
      .select()

    if (error) throw error
    return data
  },

  async updateCalendarItem(id: string, item: Partial<CalendarItem>): Promise<CalendarItem> {
    const { data, error } = await supabase
      .from('calendar_items')
      .update(item)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async regenerateCalendarItem(itemId: string, businessProfileId: string): Promise<CalendarItem> {
    const { data, error } = await supabase.functions.invoke('regenerate-day', {
      body: { itemId, businessProfileId }
    })

    if (error) throw error
    return data
  },

  // Product Images
  async getProductImages(menuItemId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('menu_item_id', menuItemId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getAllProductImages(userId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },
}
