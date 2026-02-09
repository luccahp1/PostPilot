import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/api'
import { BUSINESS_TYPES, BRAND_VIBES, PRIMARY_GOALS, POSTING_FREQUENCIES } from '@/lib/constants'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    city: '',
    neighborhood: '',
    primaryOffer: '',
    brandVibe: [] as string[],
    postingFrequency: 'daily',
    primaryGoal: '',
  })

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.brandVibe.length === 0) {
      toast.error('Please select at least one brand vibe')
      return
    }

    setLoading(true)

    try {
      if (profile) {
        await api.updateBusinessProfile(profile.id, formData)
      } else {
        await api.createBusinessProfile(formData)
      }
      
      navigate('/subscribe')
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const toggleBrandVibe = (vibe: string) => {
    setFormData(prev => ({
      ...prev,
      brandVibe: prev.brandVibe.includes(vibe)
        ? prev.brandVibe.filter(v => v !== vibe)
        : [...prev.brandVibe, vibe].slice(0, 3)
    }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Tell us about your business</CardTitle>
          <CardDescription>This takes 60 seconds. We'll use this to generate perfect content for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Coffee & Co"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                  required
                >
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood (Optional)</Label>
                <Input
                  id="neighborhood"
                  placeholder="Mission District"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryOffer">Primary Offer This Month (Optional)</Label>
              <Input
                id="primaryOffer"
                placeholder="New spring menu, 20% off haircuts, Free consultation, etc."
                value={formData.primaryOffer}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryOffer: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand Vibe (Choose 1-3)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BRAND_VIBES.map((vibe) => (
                  <label
                    key={vibe.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.brandVibe.includes(vibe.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={formData.brandVibe.includes(vibe.value)}
                      onCheckedChange={() => toggleBrandVibe(vibe.value)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{vibe.emoji}</span>
                      <span className="font-medium">{vibe.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="postingFrequency">Posting Frequency</Label>
                <Select
                  value={formData.postingFrequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, postingFrequency: value }))}
                  required
                >
                  <SelectTrigger id="postingFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSTING_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryGoal">Primary Goal</Label>
                <Select
                  value={formData.primaryGoal}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, primaryGoal: value }))}
                  required
                >
                  <SelectTrigger id="primaryGoal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Continue to Subscription'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
