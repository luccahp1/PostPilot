import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, TrendingUp, Hash, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

export default function AnalyticsPage() {
  const navigate = useNavigate()

  const { data: calendars = [] } = useQuery({
    queryKey: ['calendars'],
    queryFn: api.getCalendars,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Analytics</h1>
          <p className="text-muted-foreground">Track your content generation history and trends</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
      </div>
    </div>
  )
}