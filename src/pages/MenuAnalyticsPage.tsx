import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Star, Calendar, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

interface MenuItemAnalytics {
  id: string
  menu_item_id: string
  menu_item_name: string
  times_featured: number
  last_featured_date: string | null
  calendar_items_count: number
  total_posts: number
  total_likes: number
  total_comments: number
  total_saves: number
  total_reach: number
  total_impressions: number
  avg_engagement_rate: number
  performance_score: number
  underutilized_score: number
  created_at: string
  updated_at: string
}

export default function MenuAnalyticsPage() {
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['menu-item-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_item_analytics')
        .select('*')
        .order('performance_score', { ascending: false })

      if (error) throw error
      return data as MenuItemAnalytics[]
    },
    enabled: !!profile
  })

  // Calculate insights
  const totalMenuItems = profile?.menu_items?.length || 0
  const trackedItems = analytics.length
  const untrackedItems = totalMenuItems - trackedItems
  
  const topPerformers = [...analytics]
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5)
  
  const underutilized = [...analytics]
    .sort((a, b) => b.underutilized_score - a.underutilized_score)
    .slice(0, 5)
  
  const mostFeatured = [...analytics]
    .sort((a, b) => b.times_featured - a.times_featured)
    .slice(0, 5)

  // Find items never featured
  const neverFeatured = profile?.menu_items?.filter((item: any) => 
    !analytics.find(a => a.menu_item_id === item.id)
  ) || []

  const getDaysSinceLastFeatured = (date: string | null) => {
    if (!date) return 999
    const lastFeatured = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastFeatured.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
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

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Menu Item Analytics</h1>
            <p className="text-muted-foreground">
              Track which products drive engagement and discover opportunities for promotion
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalMenuItems}</div>
                <p className="text-xs text-muted-foreground">Total Menu Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{trackedItems}</div>
                <p className="text-xs text-muted-foreground">Featured in Content</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-500">{untrackedItems}</div>
                <p className="text-xs text-muted-foreground">Never Featured</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {analytics.reduce((sum, a) => sum + a.total_posts, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Instagram Posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Underutilized Items Alert */}
          {(underutilized.length > 0 || neverFeatured.length > 0) && (
            <Card className="mb-8 border-orange-500/50 bg-orange-500/5">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-orange-500">Promotion Opportunities</CardTitle>
                    <CardDescription>
                      These items could benefit from more exposure in your content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {neverFeatured.length > 0 && (
                  <div>
                    <p className="font-semibold text-sm mb-2">Never Featured ({neverFeatured.length} items):</p>
                    <div className="flex flex-wrap gap-2">
                      {neverFeatured.map((item: any) => (
                        <Badge key={item.id} variant="outline" className="border-orange-500 text-orange-500">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {underutilized.length > 0 && (
                  <div>
                    <p className="font-semibold text-sm mb-2">Underutilized Items:</p>
                    <div className="space-y-2">
                      {underutilized.slice(0, 3).map((item) => {
                        const daysSince = getDaysSinceLastFeatured(item.last_featured_date)
                        return (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <div>
                              <p className="font-medium">{item.menu_item_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Last featured {daysSince === 999 ? 'never' : `${daysSince} days ago`}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-orange-500">
                              {item.times_featured} features
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => navigate('/generator')}
                >
                  Generate Content for These Items
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Analytics Tabs */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="frequency">Frequency</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            {/* Top Performers */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <CardTitle>Top Performing Items</CardTitle>
                  </div>
                  <CardDescription>
                    Items with the best overall performance based on engagement and reach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topPerformers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No performance data yet. Start posting to Instagram to track engagement!
                    </p>
                  ) : (
                    topPerformers.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.menu_item_name}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>❤️ {item.total_likes} likes</span>
                            <span>💬 {item.total_comments} comments</span>
                            <span>📊 {item.avg_engagement_rate.toFixed(1)}% engagement</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {item.performance_score.toFixed(0)}
                          </div>
                          <p className="text-xs text-muted-foreground">score</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Most Featured */}
            <TabsContent value="frequency" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Most Featured Items</CardTitle>
                  </div>
                  <CardDescription>
                    Items that appear most frequently in your generated content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mostFeatured.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Generate content calendars to start tracking item frequency
                    </p>
                  ) : (
                    mostFeatured.map((item) => {
                      const daysSince = getDaysSinceLastFeatured(item.last_featured_date)
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">{item.menu_item_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last featured {daysSince === 999 ? 'never' : `${daysSince} days ago`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold">{item.calendar_items_count}</div>
                              <p className="text-xs text-muted-foreground">calendar posts</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">{item.times_featured}</div>
                              <p className="text-xs text-muted-foreground">total features</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Details */}
            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <CardTitle>Instagram Engagement by Item</CardTitle>
                  </div>
                  <CardDescription>
                    Detailed performance metrics from Instagram posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics
                      .filter(item => item.total_posts > 0)
                      .sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)
                      .map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{item.menu_item_name}</h3>
                            <Badge>{item.total_posts} posts</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center p-3 bg-accent/30 rounded">
                              <div className="text-xl font-bold">{item.total_likes}</div>
                              <p className="text-xs text-muted-foreground">Likes</p>
                            </div>
                            <div className="text-center p-3 bg-accent/30 rounded">
                              <div className="text-xl font-bold">{item.total_comments}</div>
                              <p className="text-xs text-muted-foreground">Comments</p>
                            </div>
                            <div className="text-center p-3 bg-accent/30 rounded">
                              <div className="text-xl font-bold">{item.total_saves}</div>
                              <p className="text-xs text-muted-foreground">Saves</p>
                            </div>
                            <div className="text-center p-3 bg-accent/30 rounded">
                              <div className="text-xl font-bold text-primary">
                                {item.avg_engagement_rate.toFixed(1)}%
                              </div>
                              <p className="text-xs text-muted-foreground">Engagement</p>
                            </div>
                          </div>

                          {item.total_reach > 0 && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>👥 Reach: {item.total_reach.toLocaleString()}</span>
                              <span>👀 Impressions: {item.total_impressions.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      ))}

                    {analytics.filter(item => item.total_posts > 0).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No Instagram engagement data yet. Post items to Instagram to see performance metrics!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* All Items Table */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>All Menu Items Overview</CardTitle>
              <CardDescription>
                Complete list of menu items with their performance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile?.menu_items?.map((item: any) => {
                  const itemAnalytics = analytics.find(a => a.menu_item_id === item.id)
                  const daysSince = itemAnalytics 
                    ? getDaysSinceLastFeatured(itemAnalytics.last_featured_date)
                    : 999

                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        {item.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        {itemAnalytics ? (
                          <>
                            <div className="text-center">
                              <div className="font-semibold">{itemAnalytics.times_featured}</div>
                              <p className="text-xs text-muted-foreground">features</p>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold">{itemAnalytics.total_posts}</div>
                              <p className="text-xs text-muted-foreground">posts</p>
                            </div>
                            <div className="text-center min-w-[80px]">
                              {daysSince === 999 ? (
                                <Badge variant="outline" className="border-orange-500 text-orange-500">
                                  Never
                                </Badge>
                              ) : daysSince > 30 ? (
                                <Badge variant="outline" className="border-orange-500 text-orange-500">
                                  {daysSince}d ago
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-500 text-green-500">
                                  {daysSince}d ago
                                </Badge>
                              )}
                            </div>
                          </>
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-500">
                            Never Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
