import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function SubscribePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const handleSubscribe = async () => {
    if (!profile) {
      toast.error('Please complete onboarding first')
      navigate('/onboarding')
      return
    }

    setLoading(true)
    try {
      const successUrl = `${window.location.origin}/dashboard`
      const cancelUrl = `${window.location.origin}/subscribe`

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID || 'price_default',
          successUrl,
          cancelUrl,
        }
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
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to start subscription')
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Start Your Subscription</h1>
          <p className="text-muted-foreground">
            Get unlimited 30-day calendars for {profile.business_name}
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="inline-block mx-auto px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
              Simple Pricing
            </div>
            <div className="mb-4">
              <span className="text-5xl font-bold">$30</span>
              <span className="text-xl text-muted-foreground">/month</span>
            </div>
            <CardTitle>Neighborhood Social Pro</CardTitle>
            <CardDescription>Everything you need to succeed on Instagram</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                'Unlimited 30-day calendar generations',
                'All post types: Reels, Photos, Carousels, Stories',
                'AI-powered captions, hashtags, and CTAs',
                'Canva design prompts for every post',
                'CSV & text file exports',
                'Regenerate individual days anytime',
                'Instagram auto-posting (optional)',
                'Menu/product image integration',
                'Analytics & performance tracking',
                'Cancel anytime, no contracts',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleSubscribe} 
              size="lg" 
              className="w-full"
              disabled={loading}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {loading ? 'Loading...' : 'Subscribe Now'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment processing by Stripe • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
