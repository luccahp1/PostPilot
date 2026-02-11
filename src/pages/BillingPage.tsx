import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CreditCard, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function BillingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const handleManageSubscription = async () => {
    setLoading(true)

    try {
      const returnUrl = `${window.location.origin}/billing`

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl }
      })

      if (error) {
        let errorMessage = error.message
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500
            const textContent = await error.context?.text()
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`
          }
        }
        throw new Error(errorMessage)
      }

      if (data?.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL returned')
      }
    } catch (error: any) {
      console.error('Portal error:', error)
      toast.error(error.message)
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Neighborhood Social Pro</CardDescription>
                  </div>
                  <Badge variant={profile.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {profile.subscription_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Monthly Subscription</p>
                      <p className="text-sm text-muted-foreground">Billed monthly</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">$30</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">What's Included:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-accent" />
                      Unlimited 30-day calendar generations
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-accent" />
                      All post types & content pillars
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-accent" />
                      Captions, hashtags, CTAs, Canva prompts
                    </li>
                    <li className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-accent" />
                      CSV & text file exports
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleManageSubscription} 
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Manage Subscription via Stripe'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Update payment method, view invoices, or cancel subscription
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>The business you're creating content for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                  <p>{profile.business_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                  <p>{profile.business_type}</p>
                </div>
                {profile.city && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{profile.city}{profile.neighborhood && `, ${profile.neighborhood}`}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand Vibe</p>
                  <p>{profile.brand_vibe.join(', ')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
