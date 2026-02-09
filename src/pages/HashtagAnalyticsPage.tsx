import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, TrendingUp, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { api } from '@/lib/api'

export default function HashtagAnalyticsPage() {
  const navigate = useNavigate()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const { data: recentItems = [] } = useQuery({
    queryKey: ['recent-calendar-items'],
    queryFn: async () => {
      const { data: calendars } = await supabase
        .from('calendars')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!calendars || calendars.length === 0) return []

      const { data, error } = await supabase
        .from('calendar_items')
        .select('hashtags')
        .eq('calendar_id', calendars[0].id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    }
  })

  const allHashtags = Array.from(
    new Set(recentItems.flatMap((item: any) => item.hashtags || []))
  )

  const handleAnalyze = async () => {
    if (!profile || allHashtags.length === 0) {
      toast.error('No hashtags to analyze')
      return
    }

    setAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('analyze-hashtag-performance', {
        body: {
          businessType: profile.business_type,
          currentHashtags: allHashtags
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

      setAnalysis(data)
      toast.success('Hashtag analysis complete!')
    } catch (error: any) {
      console.error('Hashtag analysis error:', error)
      toast.error(error.message || 'Failed to analyze hashtags')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Hashtag Analytics</h1>
            <p className="text-muted-foreground">
              Optimize your hashtag strategy with AI-powered insights
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Current Hashtags
              </CardTitle>
              <CardDescription>
                {allHashtags.length} unique hashtags from recent posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allHashtags.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hashtags found. Generate some content first!
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {allHashtags.slice(0, 20).map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                    {allHashtags.length > 20 && (
                      <Badge variant="outline">+{allHashtags.length - 20} more</Badge>
                    )}
                  </div>
                  <Button onClick={handleAnalyze} disabled={analyzing}>
                    {analyzing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Performance
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {analysis && (
            <>
              {/* Underperforming Hashtags */}
              {analysis.underperforming && analysis.underperforming.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-destructive">⚠️ Underperforming Hashtags</CardTitle>
                    <CardDescription>
                      Consider replacing these hashtags for better reach
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.underperforming.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="destructive">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Hashtags */}
              {analysis.suggested && analysis.suggested.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-green-600">✨ Suggested Hashtags</CardTitle>
                    <CardDescription>
                      Trending and niche-specific hashtags for better engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {analysis.suggested.map((tag: string, idx: number) => (
                        <Badge 
                          key={idx} 
                          className="bg-green-600 hover:bg-green-700 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(tag)
                            toast.success(`Copied ${tag}`)
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(analysis.suggested.join(' '))
                        toast.success('All suggested hashtags copied!')
                      }}
                    >
                      Copy All
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reasoning */}
              {analysis.reasoning && (
                <Card>
                  <CardHeader>
                    <CardTitle>💡 Analysis Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
