import { useState } from 'react'
import { toast } from 'sonner'
import { Instagram, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

interface InstagramAnalyzerProps {
  instagramHandle: string | null
  onAnalysisComplete?: () => void
}

export default function InstagramAnalyzer({ instagramHandle, onAnalysisComplete }: InstagramAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  const handleAnalyze = async () => {
    if (!instagramHandle) {
      toast.error('No Instagram handle provided')
      return
    }

    setAnalyzing(true)

    try {
      const { data, error } = await supabase.functions.invoke('analyze-instagram', {
        body: { instagramHandle }
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

      setAnalyzed(true)
      toast.success(data.message || 'Instagram feed analyzed successfully!')
      onAnalysisComplete?.()
    } catch (error: any) {
      console.error('Instagram analysis error:', error)
      toast.error(error.message || 'Failed to analyze Instagram feed')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!instagramHandle) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 text-pink-600" />
            <div>
              <CardTitle className="text-lg">Instagram Feed Analysis</CardTitle>
              <CardDescription>{instagramHandle}</CardDescription>
            </div>
          </div>
          {analyzed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Analyze your Instagram feed to understand your posting style, colors, and content themes for better AI-generated content.
        </p>
        <Button 
          onClick={handleAnalyze} 
          disabled={analyzing || analyzed}
          variant={analyzed ? 'outline' : 'default'}
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Feed...
            </>
          ) : analyzed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Feed Analyzed
            </>
          ) : (
            <>
              <Instagram className="mr-2 h-4 w-4" />
              Analyze Instagram Feed
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
