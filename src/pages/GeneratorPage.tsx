import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function GeneratorPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const handleGenerate = async () => {
    if (!profile) {
      toast.error('Please complete your business profile first')
      return
    }

    setLoading(true)

    try {
      const now = new Date()
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: {
          businessName: profile.business_name,
          businessType: profile.business_type,
          city: profile.city,
          neighborhood: profile.neighborhood,
          primaryOffer: profile.primary_offer,
          brandVibe: profile.brand_vibe,
          postingFrequency: profile.posting_frequency,
          primaryGoal: profile.primary_goal,
          monthYear,
          businessDescription: profile.business_description,
          productsServices: profile.products_services,
          permanentContext: profile.permanent_context,
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

      const calendar = await api.createCalendar({
        business_profile_id: profile.id,
        month_year: monthYear,
      })

      const calendarItems = data.items.map((item: any, index: number) => ({
        calendar_id: calendar.id,
        day_number: index + 1,
        post_date: item.date,
        post_type: item.postType,
        theme: item.theme,
        caption_short: item.captionShort,
        caption_long: item.captionLong,
        hashtags: item.hashtags,
        cta: item.cta,
        canva_prompt: item.canvaPrompt,
        image_ideas: item.imageIdeas || null,
      }))

      await api.createCalendarItems(calendarItems)

      toast.success('Calendar generated successfully!')
      navigate(`/calendar/${calendar.id}`)
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate calendar')
    } finally {
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Generate Your Calendar</h1>
            <p className="text-lg text-muted-foreground">
              Creating 30 days of content for {profile.business_name}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Business</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {profile.business_type}
                </div>
                {profile.city && (
                  <div>
                    <span className="font-medium">Location:</span> {profile.city}
                    {profile.neighborhood && `, ${profile.neighborhood}`}
                  </div>
                )}
                {profile.primary_offer && (
                  <div>
                    <span className="font-medium">Current Offer:</span> {profile.primary_offer}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Brand Vibe:</span> {profile.brand_vibe.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Posting:</span>{' '}
                  {profile.posting_frequency === 'daily' ? 'Daily (7x/week)' :
                   profile.posting_frequency === '5x-week' ? '5x per week' : '3x per week'}
                </div>
                <div>
                  <span className="font-medium">Goal:</span> {profile.primary_goal}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Generate?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                We'll create a complete 30-day content calendar with captions, hashtags, CTAs, and Canva prompts tailored to your business.
              </p>
              <Button size="lg" onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating... (this takes ~30 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate 30-Day Calendar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
