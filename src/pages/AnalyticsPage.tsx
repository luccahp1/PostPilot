import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, TrendingUp, Hash, FileText, Instagram, RefreshCw, ThumbsUp, MessageCircle, Bookmark, Eye, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const { data: calendars = [] } = useQuery({
    queryKey: ['calendars'],
    queryFn: api.getCalendars,
  })

  const { data: instagramAnalytics = [] } = useQuery({
    queryKey: ['instagram-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_post_analytics')
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    },
    enabled: profile?.instagram_posting_enabled || false
  })

  const { data: allItems = [] } = useQuery({
    queryKey: ['all-calendar-items'],
    queryFn: async () => {
      const items = await Promise.all(
        calendars.map(cal => api.getCalendarItems(cal.id))
      )
      return items.flat()
    },
    enabled: calendars.length > 0,
  })

  // Calculate statistics
  const postTypeCounts = allItems.reduce((acc, item) => {
    acc[item.post_type] = (acc[item.post_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const hashtagCounts = allItems.reduce((acc, item) => {
    item.hashtags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const themeCounts = allItems.reduce((acc, item) => {
    acc[item.theme] = (acc[item.theme] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  // Instagram Analytics Calculations
  const totalLikes = instagramAnalytics.reduce((sum, p) => sum + (p.likes || 0), 0)
  const totalComments = instagramAnalytics.reduce((sum, p) => sum + (p.comments || 0), 0)
  const totalSaves = instagramAnalytics.reduce((sum, p) => sum + (p.saves || 0), 0)
  const totalReach = instagramAnalytics.reduce((sum, p) => sum + (p.reach || 0), 0)
  const avgEngagementRate = instagramAnalytics.length > 0
    ? instagramAnalytics.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / instagramAnalytics.length
    : 0

  const topPerformingPosts = [...instagramAnalytics]
    .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    .slice(0, 5)

  const handleSyncInstagram = async () => {
    if (!profile?.instagram_posting_enabled) {
      toast.error('Instagram not connected. Please enable it in Settings.')
      return
    }

    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('fetch-instagram-analytics')

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

      queryClient.invalidateQueries({ queryKey: ['instagram-analytics'] })
      toast.success(`Synced ${data.postsAnalyzed} Instagram posts!`)
    } catch (error: any) {
      console.error('Sync error:', error)
      toast.error(error.message || 'Failed to sync Instagram analytics')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content Analytics</h1>
            <p className="text-muted-foreground">Track your content generation history and Instagram performance</p>
          </div>
          {profile?.instagram_posting_enabled && (
            <Button onClick={handleSyncInstagram} disabled={syncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync Instagram
            </Button>
          )}
        </div>

        <Tabs defaultValue="generation" className="mb-8">
          <TabsList>
            <TabsTrigger value="generation">Generation Stats</TabsTrigger>
            {profile?.instagram_posting_enabled && (
              <TabsTrigger value="instagram">
                <Instagram className="mr-2 h-4 w-4" />
                Instagram Performance
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="generation" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Calendars</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calendars.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allItems.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Themes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(themeCounts).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Hashtags</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(hashtagCounts).length}</div>
            </CardContent>
          </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
          {/* Post Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Post Types Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(postTypeCounts).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data yet. Generate your first calendar!</p>
              ) : (
                Object.entries(postTypeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{type}</span>
                        <span className="text-muted-foreground">{count} posts</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / allItems.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Top Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle>Top Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              {topHashtags.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hashtags yet. Generate your first calendar!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topHashtags.map(([tag, count]) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag} <span className="ml-1.5 text-xs text-muted-foreground">×{count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Themes */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Popular Content Themes</CardTitle>
            </CardHeader>
            <CardContent>
              {topThemes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No themes yet. Generate your first calendar!</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {topThemes.map(([theme, count]) => (
                    <div 
                      key={theme} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                    >
                      <span className="font-medium text-sm">{theme}</span>
                      <Badge variant="outline">{count}×</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
            </CardHeader>
            <CardContent>
              {calendars.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No calendars yet. Generate your first one!</p>
              ) : (
                <div className="space-y-2">
                  {calendars.slice(0, 5).map((calendar) => (
                    <div 
                      key={calendar.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/calendar/${calendar.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{calendar.month_year}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(calendar.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">30 days</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          {profile?.instagram_posting_enabled && (
            <TabsContent value="instagram" className="space-y-6">
              {/* Instagram Overview Stats */}
              <div className="grid md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{instagramAnalytics.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSaves.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgEngagementRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>

              {instagramAnalytics.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Instagram className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No Instagram analytics yet</p>
                    <Button onClick={handleSyncInstagram} disabled={syncing}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                      Sync Instagram Posts
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Top Performing Posts */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Top Performing Posts</CardTitle>
                      <CardDescription>Ranked by engagement rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topPerformingPosts.map((post, idx) => (
                          <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                              #{idx + 1}
                            </div>
                            {post.media_url && (
                              <img 
                                src={post.media_url} 
                                alt="Post" 
                                className="w-16 h-16 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm line-clamp-2 mb-2">
                                {post.caption || 'No caption'}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" /> {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" /> {post.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bookmark className="h-3 w-3" /> {post.saves}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> {post.reach?.toLocaleString() || 0}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {post.engagement_rate?.toFixed(1) || 0}%
                              </div>
                              <p className="text-xs text-muted-foreground">engagement</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Post Type Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const typeStats = instagramAnalytics.reduce((acc, post) => {
                          const type = post.post_type || 'unknown'
                          if (!acc[type]) {
                            acc[type] = { count: 0, totalEngagement: 0, totalReach: 0 }
                          }
                          acc[type].count++
                          acc[type].totalEngagement += post.engagement_rate || 0
                          acc[type].totalReach += post.reach || 0
                          return acc
                        }, {} as Record<string, any>)

                        return (
                          <div className="space-y-4">
                            {Object.entries(typeStats).map(([type, stats]) => {
                              const avgEngagement = stats.totalEngagement / stats.count
                              return (
                                <div key={type} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium capitalize">{type}</span>
                                    <div className="text-right">
                                      <div className="font-semibold">{avgEngagement.toFixed(1)}%</div>
                                      <div className="text-xs text-muted-foreground">{stats.count} posts</div>
                                    </div>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all"
                                      style={{ width: `${Math.min(avgEngagement * 10, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* Recent Posts Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {instagramAnalytics.slice(0, 5).map((post) => (
                          <div key={post.id} className="flex items-center justify-between text-sm pb-3 border-b last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {new Date(post.posted_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{post.post_type}</p>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <Badge variant="outline">
                                <ThumbsUp className="h-3 w-3 mr-1" /> {post.likes}
                              </Badge>
                              <Badge variant="outline" className="text-green-600">
                                {post.engagement_rate?.toFixed(1) || 0}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}