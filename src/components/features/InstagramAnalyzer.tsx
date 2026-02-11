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
      toast.success('Instagram feed analyzed! Recommendations saved to your profile.')
      onAnalysisComplete?.()
    } catch (error: any) {
      console.error('Instagram analysis error:', error)
      toast.error(error.message || 'Failed to analyze Instagram feed')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!instagramHandle) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
        <Instagram className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">Add Instagram handle above to analyze feed</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Instagram className="h-5 w-5 text-pink-600" />
        <div className="flex-1">
          <h3 className="font-semibold">Instagram Feed Analysis</h3>
          <p className="text-xs text-muted-foreground">{instagramHandle}</p>
        </div>
        {analyzed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      </div>
      <p className="text-sm text-muted-foreground">
        Analyze your feed to understand posting style, colors, and themes.
      </p>
      <Button 
        onClick={handleAnalyze} 
        disabled={analyzing || analyzed}
        variant={analyzed ? 'outline' : 'default'}
        className="w-full"
      >
        {analyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : analyzed ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Analyzed
          </>
        ) : (
          <>
            <Instagram className="mr-2 h-4 w-4" />
            Analyze Feed
          </>
        )}
      </Button>
    </div>
  )
}
