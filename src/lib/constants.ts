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
]

export const PRIMARY_GOALS = [
  { value: 'bookings', label: 'Increase Bookings', emoji: '📅' },
  { value: 'foot-traffic', label: 'Drive Foot Traffic', emoji: '🚶' },
  { value: 'calls', label: 'Get More Calls', emoji: '📞' },
  { value: 'online-orders', label: 'Boost Online Orders', emoji: '🛒' },
  { value: 'followers', label: 'Grow Followers', emoji: '📈' },
  { value: 'brand-awareness', label: 'Build Brand Awareness', emoji: '🎯' },
]

// Dynamic goals based on business type
export const BUSINESS_TYPE_GOALS: Record<string, string[]> = {
  'Coffee Shop': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness'],
  'Cafe': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness'],
  'Bakery': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness'],
  'Restaurant': ['bookings', 'foot-traffic', 'online-orders', 'followers', 'brand-awareness'],
  'Boutique / Retail': ['foot-traffic', 'online-orders', 'followers', 'brand-awareness'],
  'Barber Shop': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Hair Salon': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Nail Salon': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Beauty Spa': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Massage Therapy': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Gym / Fitness Studio': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Yoga Studio': ['bookings', 'followers', 'brand-awareness'],
  'Personal Trainer': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Dentist': ['bookings', 'calls', 'brand-awareness'],
  'Chiropractor': ['bookings', 'calls', 'brand-awareness'],
  'Real Estate Agent': ['calls', 'followers', 'brand-awareness'],
  'Interior Designer': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Photographer': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Florist': ['calls', 'online-orders', 'followers', 'brand-awareness'],
  'Pet Grooming': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Auto Repair': ['bookings', 'calls', 'brand-awareness'],
  'Tattoo Studio': ['bookings', 'calls', 'followers', 'brand-awareness'],
  'Other': ['bookings', 'foot-traffic', 'calls', 'online-orders', 'followers', 'brand-awareness'], // Show all for Other
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
