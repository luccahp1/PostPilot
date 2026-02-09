import { useState } from 'react'
import { toast } from 'sonner'
import { Globe, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Website Analysis</CardTitle>
              <CardDescription className="break-all">{websiteUrl}</CardDescription>
            </div>
          </div>
          {analyzed && <CheckCircle2 className="h-5 w-5 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Analyze your website to extract brand colors, messaging, and key services for more personalized content.
        </p>
        <Button 
          onClick={handleAnalyze} 
          disabled={analyzing || analyzed}
          variant={analyzed ? 'outline' : 'default'}
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Website...
            </>
          ) : analyzed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Website Analyzed
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Analyze Website
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
