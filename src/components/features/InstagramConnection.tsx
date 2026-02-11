import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Instagram, Link2, CheckCircle2, AlertCircle, Info, BookOpen, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'
import type { BusinessProfile } from '@/types'

interface InstagramConnectionProps {
  profile: BusinessProfile
  onTogglePosting: (enabled: boolean) => void
}

export default function InstagramConnection({ profile, onTogglePosting }: InstagramConnectionProps) {
  const queryClient = useQueryClient()
  const [connecting, setConnecting] = useState(false)
  const [appId, setAppId] = useState<string | null>(null)

  const isConnected = !!profile.instagram_access_token
  const isExpired = profile.instagram_token_expires_at 
    ? new Date(profile.instagram_token_expires_at) < new Date()
    : false

  // Check if backend has Meta App credentials configured on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data } = await supabase.functions.invoke('connect-instagram', {
          body: { checkConfig: true }
        })
        if (data?.configured && data?.appId) {
          setAppId(data.appId)
        }
      } catch (error) {
        console.error('Config check failed:', error)
      }
    }
    checkConfig()
  }, [])

  const handleConnect = async () => {
    if (!appId) {
      toast.error(
        'Instagram integration not configured. Meta App credentials are missing.',
        { duration: 5000 }
      )
      return
    }

    // Redirect to Instagram OAuth (NEW: Direct Instagram Login!)
    const redirectUri = `${window.location.origin}/settings`
    const scope = 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments'
    
    const authUrl = `https://www.instagram.com/oauth/authorize?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `state=${Date.now()}`

    window.location.href = authUrl
  }

  // Check for OAuth redirect with authorization code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      handleOAuthCallback(code)
    }
  }, [])

  const handleOAuthCallback = async (code: string) => {
    setConnecting(true)
    
    try {
      const redirectUri = `${window.location.origin}/settings`

      const { data, error } = await supabase.functions.invoke('connect-instagram', {
        body: { code, redirectUri }
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

      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Instagram account connected successfully!')
      
      // Clear the code from URL
      window.history.replaceState(null, '', window.location.pathname)
    } catch (error: any) {
      console.error('Instagram connection error:', error)
      toast.error(error.message || 'Failed to connect Instagram account')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="h-6 w-6 text-pink-600" />
            <div>
              <CardTitle>Instagram Auto-Posting</CardTitle>
              <CardDescription>Post directly to your Instagram Business Account</CardDescription>
            </div>
          </div>
          {isConnected && !isExpired && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          )}
          {isConnected && isExpired && (
            <Badge variant="destructive">
              <AlertCircle className="mr-1 h-3 w-3" />
              Token Expired
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-900 dark:text-green-100 flex-1">
            <p className="font-medium mb-2">✨ Simplified Setup (New in 2024!):</p>
            <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200">
              <li><strong className="line-through">No Facebook Page required</strong> ✓</li>
              <li><strong className="line-through">No account linking needed</strong> ✓</li>
              <li>Just need an Instagram Business/Creator account</li>
            </ul>
            {!appId && (
              <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900 p-2 rounded">
                <strong>⚠️ Configuration Required:</strong> Meta App credentials are not configured. Please contact support.
              </p>
            )}
            <Link to="/instagram-setup-guide" className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:underline text-sm font-medium mt-3">
              <BookOpen className="h-4 w-4" />
              View Quick Setup Guide (2 mins)
            </Link>
          </div>
        </div>

        {!isConnected ? (
          <Button onClick={handleConnect} disabled={connecting || !appId} className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            {connecting ? 'Connecting...' : !appId ? 'Configuration Required' : 'Connect Instagram Account'}
          </Button>
        ) : (
          <div className="space-y-3">
            {isExpired && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  Your access token has expired. Please reconnect your account.
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Enable Auto-Posting</Label>
                <p className="text-sm text-muted-foreground">Allow PostPilot to post to Instagram</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.instagram_posting_enabled}
                  onChange={(e) => onTogglePosting(e.target.checked)}
                  className="sr-only peer"
                  disabled={isExpired}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {profile.brand_hashtag && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Your Brand Hashtag</p>
                <p className="text-lg font-bold text-primary">{profile.brand_hashtag}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will be automatically added to all Instagram posts
                </p>
              </div>
            )}

            <Button onClick={handleConnect} variant="outline" className="w-full">
              <Link2 className="mr-2 h-4 w-4" />
              Reconnect Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
