import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Instagram, Link2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
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

  const isConnected = !!profile.instagram_access_token
  const isExpired = profile.instagram_token_expires_at 
    ? new Date(profile.instagram_token_expires_at) < new Date()
    : false

  const handleConnect = async () => {
    // Check if backend has Facebook credentials configured
    try {
      const { data, error } = await supabase.functions.invoke('connect-instagram', {
        body: { checkConfig: true }
      })

      if (error) {
        toast.error(
          'Instagram integration not configured. Please contact the admin to set up Facebook App credentials in the backend.',
          { duration: 5000 }
        )
        return
      }

      // If configured, proceed with OAuth
      const redirectUri = `${window.location.origin}/settings`
      const scope = 'instagram_basic,instagram_content_publish,pages_read_engagement,business_management'
      
      // Note: This requires FACEBOOK_APP_ID in backend environment
      toast.info(
        'To connect Instagram, you need a Facebook App with Instagram Graph API. Contact admin for setup instructions.',
        { duration: 7000 }
      )
    } catch (error: any) {
      console.error('Connection check error:', error)
      toast.error('Unable to check Instagram configuration. Please try again later.')
    }
  }

  // Check for OAuth redirect with access token
  useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        
        if (accessToken) {
          handleOAuthCallback(accessToken)
        }
      }
    }
  })

  const handleOAuthCallback = async (accessToken: string) => {
    setConnecting(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('connect-instagram', {
        body: { accessToken }
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
      toast.success('Instagram account connected!')
      
      // Clear the hash from URL
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
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-2">Setup Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Instagram Business or Creator account</li>
              <li>Account connected to a Facebook Page</li>
              <li>Facebook App with Instagram permissions</li>
              <li>Backend environment variables configured</li>
            </ul>
            <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
              <strong>Admin Setup:</strong> Add <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">FACEBOOK_APP_ID</code> and <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">FACEBOOK_APP_SECRET</code> to backend secrets.
            </p>
          </div>
        </div>

        {!isConnected ? (
          <Button onClick={handleConnect} disabled={connecting} className="w-full">
            <Link2 className="mr-2 h-4 w-4" />
            {connecting ? 'Connecting...' : 'Connect Instagram Account'}
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
