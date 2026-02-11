import { Link } from 'react-router-dom'
import { ArrowLeft, Instagram, CheckCircle2, AlertTriangle, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function InstagramSetupGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <Instagram className="h-10 w-10 text-pink-600" />
            <div>
              <h1 className="text-3xl font-bold">Connect Your Instagram Account</h1>
              <p className="text-muted-foreground">New simplified process - No Facebook Page required!</p>
              <Badge className="mt-2 bg-green-600">Updated for 2024 API</Badge>
            </div>
          </div>
        </div>

        {/* What's New Banner */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-100">✨ What's New in 2024</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-green-900 dark:text-green-100">
            <p className="font-medium">Instagram simplified the connection process!</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="line-through">No Facebook Page required</strong> ✓</li>
              <li><strong className="line-through">No linking accounts in settings</strong> ✓</li>
              <li><strong className="line-through">No complex multi-step setup</strong> ✓</li>
            </ul>
            <p className="text-sm mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg border border-green-300 dark:border-green-700">
              <strong>⏱️ New Setup Time:</strong> Just 2-3 minutes!
            </p>
          </CardContent>
        </Card>

        {/* Prerequisites Section */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900 dark:text-blue-100">What You Need</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-900 dark:text-blue-100">
            <p className="font-medium">Requirements (much simpler now!):</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Instagram Business or Creator Account</strong> (converted from personal)</li>
              <li><strong>Active subscription</strong> to Neighbourhood Social</li>
              <li><strong>That's it!</strong> 🎉</li>
            </ul>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Simple 2-Step Process</h2>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <CardTitle>Convert to Instagram Business Account</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you don't already have a Business or Creator account, here's how to convert:
              </p>
              
              <div className="space-y-3 ml-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Open the Instagram app on your phone</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Go to your profile → Tap the menu (☰) → Settings and privacy</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tap "Account type and tools"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Select "Switch to Professional Account"</p>
                    <p className="text-sm text-muted-foreground">Choose "Business" if you're a local business, or "Creator" if you're an influencer/content creator</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Follow the on-screen prompts to complete setup</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>💡 Tip:</strong> This is completely free and gives you access to analytics, contact buttons, and the ability to run ads.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <CardTitle>Connect to Neighbourhood Social</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Once your Instagram account is Business/Creator, connecting is super simple:
              </p>
              
              <div className="space-y-3 ml-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Go to <Link to="/settings" className="text-primary hover:underline">Settings</Link> in Neighbourhood Social</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Find the "Instagram Auto-Posting" section</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Click the "Connect Instagram Account" button</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">You'll be redirected to Instagram to log in</p>
                    <p className="text-sm text-muted-foreground">Use your Instagram credentials (not Facebook!)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Review the permissions and click "Allow"</p>
                    <p className="text-sm text-muted-foreground">We need access to post content and read basic analytics</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Done! You'll be redirected back with a "Connected" badge</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      🎉 That's it! You can now auto-post to Instagram with just one click!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Section */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Account not eligible"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Make sure you've converted to a Business or Creator account (Step 1). Personal accounts can't connect.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Access token expired"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Instagram tokens expire every 60 days for security. Simply click "Reconnect Account" in Settings.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Post failed to publish"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Check that:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Your account is still connected (check for "Connected" badge)</li>
                    <li>You haven't exceeded Instagram's posting limits (~25 posts per day)</li>
                    <li>Your image meets Instagram's requirements (aspect ratio between 4:5 and 1.91:1)</li>
                    <li>Auto-posting is enabled in Settings</li>
                  </ul>
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Configuration Required" button is grayed out</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Meta App credentials haven't been configured in the backend yet. Please contact support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Q: Do I still need a Facebook Page?</p>
                <p className="text-sm text-muted-foreground">
                  A: No! As of September 2024, Instagram allows direct connection without requiring a Facebook Page. Much simpler!
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Is this free?</p>
                <p className="text-sm text-muted-foreground">
                  A: Instagram integration is included with your Neighbourhood Social subscription. No additional fees.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Can I still post manually to Instagram?</p>
                <p className="text-sm text-muted-foreground">
                  A: Yes! Connecting your account doesn't prevent manual posting. You have full control.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: What permissions does Neighbourhood Social need?</p>
                <p className="text-sm text-muted-foreground">
                  A: We only request: ability to publish content to your Instagram feed and read basic analytics (likes, comments, reach).
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Can I disconnect my account?</p>
                <p className="text-sm text-muted-foreground">
                  A: Yes, disconnect anytime from Settings. We'll immediately stop posting to your account.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Will this work with a personal Instagram account?</p>
                <p className="text-sm text-muted-foreground">
                  A: No, Instagram only allows API access for Business and Creator accounts. Don't worry - converting is free and takes just a few minutes (Step 1).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
            <p className="text-primary-foreground/90">
              Just 2 steps and you're posting automatically!
            </p>
            <Link to="/settings">
              <Button variant="secondary" size="lg" className="mt-4">
                <Link2 className="mr-2 h-5 w-5" />
                Go to Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground pb-8">
          <p>Still need help? Contact us at <a href="mailto:support@neighbourhoodsocial.com" className="text-primary hover:underline">support@neighbourhoodsocial.com</a></p>
        </div>
      </div>
    </div>
  )
}
