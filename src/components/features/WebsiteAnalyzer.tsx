import { useState } from 'react'
import { toast } from 'sonner'
import { Globe, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

interface WebsiteAnalyzerProps {
  websiteUrl: string | null
  onAnalysisComplete?: () => void
}

export default function WebsiteAnalyzer({ websiteUrl, onAnalysisComplete }: WebsiteAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  const handleAnalyze = async () => {
    if (!websiteUrl) {
      toast.error('No website URL provided')
      return
    }

    setAnalyzing(true)

    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { websiteUrl }
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
      toast.success(data.message || 'Website analyzed successfully!')
      console.log('Website analysis:', data.analysis)
      onAnalysisComplete?.()
    } catch (error: any) {
      console.error('Website analysis error:', error)
      toast.error(error.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!websiteUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
        <Globe className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">Add website URL above to analyze</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <h3 className="font-semibold">Website Analysis</h3>
          <p className="text-xs text-muted-foreground truncate">{websiteUrl}</p>
        </div>
        {analyzed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      </div>
      <p className="text-sm text-muted-foreground">
        Extract brand colors, messaging, and key services from your website.
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
            <Globe className="mr-2 h-4 w-4" />
            Analyze Website
          </>
        )}
      </Button>
    </div>
  )
}
