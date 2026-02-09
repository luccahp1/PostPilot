import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Download, Trash2, Calendar, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import { downloadCSV, downloadText } from '@/lib/utils'
import { POST_TYPES } from '@/lib/constants'

export default function CalendarPage() {
  const { calendarId } = useParams<{ calendarId: string }>()
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const { data: calendar } = useQuery({
    queryKey: ['calendar', calendarId],
    queryFn: () => api.getCalendar(calendarId!),
    enabled: !!calendarId,
  })

  const { data: items = [], refetch } = useQuery({
    queryKey: ['calendar-items', calendarId],
    queryFn: () => api.getCalendarItems(calendarId!),
    enabled: !!calendarId,
  })

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const handleDownloadCSV = () => {
    const csvData = items.map(item => ({
      Date: item.post_date,
      'Post Type': item.post_type,
      Theme: item.theme,
      'Caption (Short)': item.caption_short,
      'Caption (Long)': item.caption_long,
      Hashtags: item.hashtags.join(' '),
      CTA: item.cta,
      'Canva Prompt': item.canva_prompt,
    }))

    downloadCSV(csvData, `${calendar?.month_year}-content-calendar.csv`)
    toast.success('CSV downloaded!')
  }

  const handleDownloadCanvaPrompts = () => {
    const content = items.map((item, idx) => {
      return `DAY ${idx + 1} - ${item.theme}\n` +
        `Post Type: ${item.post_type}\n` +
        `Canva Prompt: ${item.canva_prompt}\n` +
        (item.image_ideas ? `Image Ideas: ${item.image_ideas}\n` : '') +
        `\n---\n\n`
    }).join('')

    const header = `${calendar?.month_year} - Canva Prompt Pack\n` +
      `Business: ${profile?.business_name}\n` +
      `Brand Vibe: ${profile?.brand_vibe.join(', ')}\n\n` +
      `===================================\n\n`

    downloadText(header + content, `${calendar?.month_year}-canva-prompts.txt`)
    toast.success('Canva prompts downloaded!')
  }

  const handleDeleteCalendar = async () => {
    if (!window.confirm('Delete this entire calendar? This cannot be undone.')) return

    setDeletingId(calendarId!)
    try {
      await api.deleteCalendar(calendarId!)
      toast.success('Calendar deleted')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
      setDeletingId(null)
    }
  }

  const handleRegenerateDay = async (itemId: string) => {
    if (!profile) return

    setRegeneratingId(itemId)
    try {
      await api.regenerateCalendarItem(itemId, profile.id)
      await refetch()
      toast.success('Day regenerated!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setRegeneratingId(null)
    }
  }

  if (!calendar || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getPostTypeIcon = (type: string) => {
    const postType = POST_TYPES.find(pt => pt.value === type.toLowerCase())
    return postType?.icon || '📱'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadCanvaPrompts}>
              <Download className="mr-2 h-4 w-4" />
              Canva Prompts
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCalendar}
              disabled={!!deletingId}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{calendar.month_year}</h1>
          </div>
          <p className="text-muted-foreground">{profile.business_name} - {items.length} days of content</p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary text-xl">
                      {item.day_number}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{getPostTypeIcon(item.post_type)}</span>
                        {item.theme}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.post_date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                        <Badge variant="secondary" className="ml-2">{item.post_type}</Badge>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerateDay(item.id)}
                    disabled={regeneratingId === item.id}
                  >
                    <RefreshCw className={`h-4 w-4 ${regeneratingId === item.id ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="short">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="short">Short Caption</TabsTrigger>
                    <TabsTrigger value="long">Long Caption</TabsTrigger>
                  </TabsList>
                  <TabsContent value="short" className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="flex-1 text-sm whitespace-pre-wrap">{item.caption_short}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item.caption_short, 'Short caption')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="long" className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="flex-1 text-sm whitespace-pre-wrap">{item.caption_long}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item.caption_long, 'Long caption')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Hashtags</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.hashtags.join(' '), 'Hashtags')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-primary">{item.hashtags.join(' ')}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Call-to-Action</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(item.cta, 'CTA')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm">{item.cta}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Canva Design Prompt</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(item.canva_prompt, 'Canva prompt')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic">{item.canva_prompt}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
