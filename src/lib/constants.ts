export const BUSINESS_TYPES = [
  'Coffee Shop',
  'Barber Shop',
  'Hair Salon',
  'Nail Salon',
  'Gym / Fitness Studio',
  'Yoga Studio',
  'Restaurant',
  'Cafe',
  'Bakery',
  'Dentist',
  'Chiropractor',
  'Massage Therapy',
  'Real Estate Agent',
  'Interior Designer',
  'Photographer',
  'Florist',
  'Pet Grooming',
  'Auto Repair',
  'Boutique / Retail',
  'Tattoo Studio',
  'Beauty Spa',
  'Personal Trainer',
  'Other',
]

export const BRAND_VIBES = [
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
  { value: 'playful', label: 'Playful', emoji: '🎉' },
  { value: 'minimalist', label: 'Minimalist', emoji: '⚡' },
  { value: 'student-encouraged', label: 'Student Encouraged', emoji: '📚' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'modern', label: 'Modern', emoji: '🎨' },
]

export const PRIMARY_GOALS = [
  { value: 'bookings', label: 'Increase Bookings', emoji: '📅' },
  { value: 'foot-traffic', label: 'Drive Foot Traffic', emoji: '🚶' },
  { value: 'calls', label: 'Get More Calls', emoji: '📞' },
  { value: 'online-orders', label: 'Boost Online Orders', emoji: '🛒' },
  { value: 'followers', label: 'Grow Followers', emoji: '📈' },
  { value: 'brand-awareness', label: 'Build Brand Awareness', emoji: '🎯' },
  { value: 'engagement', label: 'Increase Engagement', emoji: '💬' },
  { value: 'website-traffic', label: 'Drive Website Traffic', emoji: '🌐' },
  { value: 'leads', label: 'Generate Leads', emoji: '🎁' },
  { value: 'reviews', label: 'Get More Reviews', emoji: '⭐' },
]

// Dynamic goals based on business type
export const BUSINESS_TYPE_GOALS: Record<string, string[]> = {
  'Coffee Shop': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Cafe': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Bakery': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Restaurant': ['bookings', 'foot-traffic', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Boutique / Retail': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'website-traffic'],
  'Barber Shop': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Hair Salon': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Nail Salon': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Beauty Spa': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Massage Therapy': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Gym / Fitness Studio': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'leads'],
  'Yoga Studio': ['bookings', 'followers', 'brand-awareness', 'engagement', 'leads'],
  'Personal Trainer': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'leads'],
  'Dentist': ['bookings', 'calls', 'brand-awareness', 'reviews', 'leads'],
  'Chiropractor': ['bookings', 'calls', 'brand-awareness', 'reviews', 'leads'],
  'Real Estate Agent': ['calls', 'followers', 'brand-awareness', 'website-traffic', 'leads'],
  'Interior Designer': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'website-traffic'],
  'Photographer': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'website-traffic'],
  'Florist': ['calls', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Pet Grooming': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'reviews'],
  'Auto Repair': ['bookings', 'calls', 'brand-awareness', 'reviews', 'leads'],
  'Tattoo Studio': ['bookings', 'calls', 'followers', 'brand-awareness', 'engagement', 'website-traffic'],
  'Other': ['bookings', 'foot-traffic', 'calls', 'online-orders', 'followers', 'brand-awareness', 'engagement', 'website-traffic', 'leads', 'reviews'],
}

// Helper function to get goals for a business type
export function getGoalsForBusinessType(businessType: string): typeof PRIMARY_GOALS {
  const allowedGoalValues = BUSINESS_TYPE_GOALS[businessType] || BUSINESS_TYPE_GOALS['Other']
  return PRIMARY_GOALS.filter(goal => allowedGoalValues.includes(goal.value))
}

export const POSTING_FREQUENCIES = [
  { value: '3x-week', label: '3x per week' },
  { value: '5x-week', label: '5x per week' },
  { value: 'daily', label: 'Daily (7x)' },
]

export const POST_TYPES = [
  { value: 'reel', label: 'Reel', icon: '🎥' },
  { value: 'photo', label: 'Photo', icon: '📷' },
  { value: 'carousel', label: 'Carousel', icon: '🖼️' },
  { value: 'story', label: 'Story', icon: '⚡' },
]
