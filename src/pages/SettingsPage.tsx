import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/api'
import { BUSINESS_TYPES, BRAND_VIBES, PRIMARY_GOALS, POSTING_FREQUENCIES } from '@/lib/constants'

export default function SettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const [formData, setFormData] = useState({
    businessName: profile?.business_name || '',
    businessType: profile?.business_type || '',
    city: profile?.city || '',
    neighborhood: profile?.neighborhood || '',
    primaryOffer: profile?.primary_offer || '',
    brandVibe: profile?.brand_vibe || [],
    postingFrequency: profile?.posting_frequency || 'daily',
    primaryGoal: profile?.primary_goal || '',
    businessDescription: profile?.business_description || '',
    productsServices: profile?.products_services || '',
    permanentContext: profile?.permanent_context || '',
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.business_name,
        businessType: profile.business_type,
        city: profile.city || '',
        neighborhood: profile.neighborhood || '',
        primaryOffer: profile.primary_offer || '',
        brandVibe: profile.brand_vibe,
        postingFrequency: profile.posting_frequency,
        primaryGoal: profile.primary_goal,
        businessDescription: profile.business_description || '',
        productsServices: profile.products_services || '',
        permanentContext: profile.permanent_context || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.brandVibe.length === 0) {
      toast.error('Please select at least one brand vibe')
      return
    }

    if (!profile) return

    setLoading(true)

    try {
      await api.updateBusinessProfile(profile.id, formData)
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Business Settings</h1>
            <p className="text-muted-foreground">
              Update your business information and AI generation preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Mission District"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription">What is your business?</Label>
                  <Input
                    id="businessDescription"
                    placeholder="e.g., A cozy neighborhood coffee shop specializing in artisan roasts"
                    value={formData.businessDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description of what your business does
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productsServices">What do you sell/offer?</Label>
                  <Input
                    id="productsServices"
                    placeholder="e.g., Coffee, pastries, sandwiches, free WiFi workspace"
                    value={formData.productsServices}
                    onChange={(e) => setFormData(prev => ({ ...prev, productsServices: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Main products or services you offer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryOffer">Current Promotion/Offer</Label>
                  <Input
                    id="primaryOffer"
                    placeholder="New spring menu, 20% off, Free consultation, etc."
                    value={formData.primaryOffer}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryOffer: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Strategy */}
            <Card>
              <CardHeader>
                <CardTitle>Content Strategy</CardTitle>
                <CardDescription>How you want your content to feel and perform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid md:grid-cols-2 gap-4">
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
              </CardContent>
            </Card>

            {/* AI Context */}
            <Card>
              <CardHeader>
                <CardTitle>Permanent AI Instructions</CardTitle>
                <CardDescription>
                  Custom instructions that will ALWAYS be included when generating content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="permanentContext">Permanent Context</Label>
                  <Textarea
                    id="permanentContext"
                    placeholder="Example: Always mention we're family-owned since 1998. Never use slang. Always emphasize sustainability. Include our tagline 'Where neighbors become friends' in every post."
                    value={formData.permanentContext}
                    onChange={(e) => setFormData(prev => ({ ...prev, permanentContext: e.target.value }))}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add any specific instructions, brand voice guidelines, or must-include details that should appear in every piece of generated content. This will be prepended to all AI generation prompts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" size="lg" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}