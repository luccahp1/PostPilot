import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Calendar, Plus, Settings, LogOut, BarChart3, CreditCard, Clock, Hash, Instagram, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const { data: calendars = [] } = useQuery({
    queryKey: ['calendars'],
    queryFn: api.getCalendars,
  })

  useEffect(() => {
    if (!profile) {
      navigate('/onboarding')
    } else if (profile.subscription_status !== 'active') {
      navigate('/subscribe')
    }
  }, [profile, navigate])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">PostPilot</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/analytics">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Link to="/billing">
              <Button variant="ghost" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-muted-foreground">Managing content for {profile.business_name}</p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle>Ready to generate?</CardTitle>
              <CardDescription>Create your next 30-day content calendar in 60 seconds</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/generator">
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Generate New Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/schedule')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Schedule Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Auto-publish timeline</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/stories')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Instagram className="h-5 w-5" />
                Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate IG Stories</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-5 w-5" />
                Product Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upload product photos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/hashtag-analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-5 w-5" />
                Hashtag Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Optimize hashtags</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Calendars</h2>
          {calendars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No calendars yet. Generate your first one!</p>
                <Link to="/generator">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendars.map((calendar) => (
                <Link key={calendar.id} to={`/calendar/${calendar.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Calendar className="h-8 w-8 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(calendar.created_at)}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{calendar.month_year}</CardTitle>
                      <CardDescription>30 days of content</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
