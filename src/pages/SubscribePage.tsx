import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Check, Sparkles } from 'lucide-react'
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

  useEffect(() => {
    if (profile?.subscription_status === 'active') {
      navigate('/generator')
    }
  }, [profile, navigate])

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1234567890'
      const successUrl = `${window.location.origin}/dashboard`
      const cancelUrl = `${window.location.origin}/subscribe`

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, successUrl, cancelUrl }
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
      console.error('Checkout error:', error)
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Subscribe to PostPilot</CardTitle>
          <CardDescription>
            Start generating unlimited 30-day content calendars
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">$30</div>
            <div className="text-lg text-muted-foreground">per month</div>
          </div>

          <div className="space-y-4">
            {[
              'Unlimited 30-day calendar generations',
              'All post types & content pillars',
              'Captions, hashtags, CTAs, Canva prompts',
              'CSV & text file exports',
              'Regenerate individual days',
              'Cancel anytime',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
