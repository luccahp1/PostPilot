import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Hash, TrendingUp, TrendingDown, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function HashtagAnalyticsPage() {
  const navigate = useNavigate()
  const [analyzingHashtag, setAnalyzingHashtag] = useState<string | null>(null)
  const [newHashtag, setNewHashtag] = useState('')

  const { data: hashtags = [] } = useQuery({
    queryKey: ['hashtag-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hashtag_analytics')
        .select('*')
        .order('performance_score', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  })

  const handleAnalyzeHashtag = async (hashtag: string) => {
    if (!profile) {
      toast.error('Please complete your business profile first')
      return
    }

    setAnalyzingHashtag(hashtag)

    try {
      // Get all currently tracked hashtags
      const currentHashtags = hashtags.map((h: any) => h.hashtag)
      
      const { data, error } = await supabase.functions.invoke('analyze-hashtag-performance', {
        body: { 
          businessType: profile.business_type,
          currentHashtags: [...currentHashtags, hashtag]
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

      toast.success(data.message || 'Hashtag analyzed successfully!')
    } catch (error: any) {
      console.error('Hashtag analysis error:', error)
      toast.error(error.message || 'Failed to analyze hashtag')
    } finally {
      setAnalyzingHashtag(null)
    }
  }

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) {
      toast.error('Please enter a hashtag')
      return
    }

    const formatted = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`
    handleAnalyzeHashtag(formatted)
    setNewHashtag('')
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
              Track performance and discover trending alternatives
            </p>
          </div>

          {/* Add Hashtag */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Analyze New Hashtag
              </CardTitle>
              <CardDescription>
                Add a hashtag to track its performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="#yourbusinesshashtag"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
                />
                <Button onClick={handleAddHashtag} disabled={!!analyzingHashtag}>
                  {analyzingHashtag ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hashtags List */}
          {hashtags.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No hashtags tracked yet. Add your first hashtag to start monitoring performance!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {hashtags.map((tag: any) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-1">{tag.hashtag}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last used: {tag.last_used ? new Date(tag.last_used).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {tag.performance_score > 0 ? (
                          <Badge className="bg-green-600">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            {tag.performance_score.toFixed(1)} score
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <TrendingDown className="mr-1 h-3 w-3" />
                            No data
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-2xl font-bold">{tag.impressions?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">Impressions</div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-2xl font-bold">{tag.reach?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">Reach</div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-2xl font-bold">{tag.engagement?.toLocaleString() || 0}</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg">
                        <div className="text-2xl font-bold">
                          {tag.performance_score ? tag.performance_score.toFixed(1) : '0'}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyzeHashtag(tag.hashtag)}
                        disabled={analyzingHashtag === tag.hashtag}
                      >
                        {analyzingHashtag === tag.hashtag ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Refresh Data'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
