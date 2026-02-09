import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Image as ImageIcon, Video, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

const STORY_TYPES = [
  { value: 'image', label: 'Photo Story', icon: ImageIcon },
  { value: 'video', label: 'Video Story', icon: Video },
  { value: 'poll', label: 'Poll Story', icon: BarChart3 },
]

export default function StoriesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [generating, setGenerating] = useState(false)
  const [storyType, setStoryType] = useState('image')
  const [topic, setTopic] = useState('')
  const [generatedStory, setGeneratedStory] = useState<any>(null)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      toast.error('Please enter a topic for your story')
      return
    }

    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-story-content', {
        body: { storyType, topic }
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

      setGeneratedStory(data.story)
      toast.success('Story generated!')
    } catch (error: any) {
      console.error('Story generation error:', error)
      toast.error(error.message || 'Failed to generate story')
    } finally {
      setGenerating(false)
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
            <h1 className="text-3xl font-bold mb-2">Instagram Stories</h1>
            <p className="text-muted-foreground">
              Create engaging story content with AI-powered suggestions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Story</CardTitle>
                <CardDescription>Create story-optimized content in seconds</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storyType">Story Type</Label>
                    <Select value={storyType} onValueChange={setStoryType}>
                      <SelectTrigger id="storyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STORY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">What's this story about?</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., New menu item, Behind the scenes, Customer testimonial"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Story
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Story Preview */}
            {generatedStory && (
              <Card>
                <CardHeader>
                  <CardTitle>Story Preview</CardTitle>
                  <CardDescription>How your story will look</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Instagram Story Mock */}
                  <div 
                    className="aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl relative"
                    style={{ 
                      backgroundColor: generatedStory.backgroundColor || '#1a1a1a',
                      maxWidth: '300px',
                      margin: '0 auto'
                    }}
                  >
                    {/* Story Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <p 
                        className="text-2xl font-bold mb-4 leading-tight"
                        style={{ color: generatedStory.textColor || '#ffffff' }}
                      >
                        {generatedStory.text}
                      </p>
                      
                      {generatedStory.suggestedStickers && (
                        <div className="flex gap-3 mb-4">
                          {generatedStory.suggestedStickers.slice(0, 2).map((sticker: string, idx: number) => (
                            <span key={idx} className="text-4xl">{sticker}</span>
                          ))}
                        </div>
                      )}

                      {generatedStory.interactivePoll && (
                        <div className="w-full max-w-[250px] space-y-2 mt-4">
                          <p className="text-sm font-semibold text-white mb-2">
                            {generatedStory.interactivePoll.question}
                          </p>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                            {generatedStory.interactivePoll.option1}
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                            {generatedStory.interactivePoll.option2}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA at bottom */}
                    {generatedStory.callToAction && (
                      <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-white text-sm font-medium">
                          {generatedStory.callToAction}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-6 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Visual Guidance</p>
                      <p className="text-sm">{generatedStory.visualGuidance}</p>
                    </div>
                    {generatedStory.caption && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Caption</p>
                        <p className="text-sm">{generatedStory.caption}</p>
                      </div>
                    )}
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    Post to Instagram Stories
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
