import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Calendar as CalendarIcon, Clock, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

export default function SchedulePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          calendar_items (
            theme,
            caption_short,
            hashtags,
            post_type
          )
        `)
        .order('scheduled_time', { ascending: true })

      if (error) throw error
      return data || []
    }
  })

  const { data: calendars = [] } = useQuery({
    queryKey: ['calendars'],
    queryFn: api.getCalendars,
  })

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this scheduled post?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] })
      toast.success('Scheduled post deleted')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string, scheduledTime: string) => {
    if (status === 'published') {
      return <Badge className="bg-green-600">Published</Badge>
    }
    if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (new Date(scheduledTime) < new Date()) {
      return <Badge variant="secondary">Processing</Badge>
    }
    return <Badge variant="outline">Scheduled</Badge>
  }

  const upcomingPosts = scheduledPosts.filter(p => 
    p.status === 'pending' && new Date(p.scheduled_time) > new Date()
  )
  const pastPosts = scheduledPosts.filter(p => 
    p.status !== 'pending' || new Date(p.scheduled_time) <= new Date()
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate('/calendar/' + calendars[0]?.id)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule New Post
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scheduled Posts</h1>
          <p className="text-muted-foreground">
            Manage your upcoming Instagram posts
          </p>
        </div>

        <div className="space-y-8">
          {/* Upcoming Posts */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Upcoming ({upcomingPosts.length})</h2>
            {upcomingPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No upcoming scheduled posts. Schedule posts from your calendar!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingPosts.map((post: any) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {post.calendar_items?.theme || 'Untitled Post'}
                            </CardTitle>
                            {getStatusBadge(post.status, post.scheduled_time)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {new Date(post.scheduled_time).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZone: post.timezone
                              })}
                            </div>
                            <Badge variant="secondary">{post.timezone}</Badge>
                            <Badge variant="outline">{post.calendar_items?.post_type}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2 mb-2">
                        {post.calendar_items?.caption_short}
                      </p>
                      {post.calendar_items?.hashtags && (
                        <p className="text-xs text-primary">
                          {post.calendar_items.hashtags.slice(0, 5).join(' ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Posts */}
          {pastPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">History ({pastPosts.length})</h2>
              <div className="grid gap-4">
                {pastPosts.map((post: any) => (
                  <Card key={post.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="h-5 w-5" />
                            <CardTitle className="text-lg">
                              {post.calendar_items?.theme || 'Untitled Post'}
                            </CardTitle>
                            {getStatusBadge(post.status, post.scheduled_time)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {post.status === 'published' && post.published_at && (
                              <p>Published: {new Date(post.published_at).toLocaleString()}</p>
                            )}
                            {post.error_message && (
                              <p className="text-destructive">Error: {post.error_message}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
