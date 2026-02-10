import { Link } from 'react-router-dom'
import { ArrowLeft, Instagram, Facebook, Link2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
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
              <p className="text-muted-foreground">Follow this step-by-step guide to enable automatic posting</p>
            </div>
          </div>
        </div>

        {/* Prerequisites Section */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900 dark:text-amber-100">Before You Start</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-amber-900 dark:text-amber-100">
            <p className="font-medium">You will need:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Instagram Business or Creator Account</strong> (not a personal account)</li>
              <li><strong>Facebook Page</strong> connected to your Instagram account</li>
              <li><strong>Admin access</strong> to both your Instagram account and Facebook Page</li>
              <li><strong>Active subscription</strong> to Neighbourhood Social</li>
            </ul>
            <p className="text-sm mt-4 p-3 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700">
              <strong>⏱️ Estimated Time:</strong> 5-10 minutes
            </p>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Setup Process</h2>

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
                <CardTitle>Create or Connect a Facebook Page</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Instagram requires a Facebook Page to enable posting through third-party apps. Here's how:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 border rounded-lg">
                  <p className="font-medium mb-2">Option A: Create a New Facebook Page</p>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">1.</span>
                      <p>Go to <a href="https://www.facebook.com/pages/create" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">facebook.com/pages/create <ExternalLink className="h-3 w-3" /></a></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">2.</span>
                      <p>Click "Get Started" and choose your page type (Business or Community)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">3.</span>
                      <p>Enter your business name, category, and description</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-muted-foreground">4.</span>
                      <p>Click "Create Page"</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border rounded-lg">
                  <p className="font-medium mb-2">Option B: Use an Existing Facebook Page</p>
                  <p className="text-sm text-muted-foreground ml-4">
                    If you already have a Facebook Page for your business, you can use that one. Make sure you're an admin of the page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <CardTitle>Link Instagram to Facebook Page</CardTitle>
                <Badge variant="destructive">Critical Step</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This is the most important step. Without this connection, automatic posting won't work.
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
                    <p className="font-medium">Go to your profile → Menu (☰) → Settings and privacy</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tap "Account Center" or "Accounts Center"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tap "See all profiles" or "+ Add accounts"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Select "Add Facebook Page" or "Connect Facebook Page"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Log in to Facebook if prompted</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Select the Facebook Page you want to connect</p>
                    <p className="text-sm text-muted-foreground">This should be the page you created or selected in Step 2</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tap "Done" or "Confirm"</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg mt-4">
                <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">
                  ⚠️ Common Issue: "Can't Find the Option"
                </p>
                <p className="text-sm text-red-900 dark:text-red-100">
                  If you don't see the option to connect a Facebook Page, make sure:
                </p>
                <ul className="list-disc list-inside text-sm text-red-900 dark:text-red-100 ml-4 mt-2 space-y-1">
                  <li>Your Instagram account is a Business or Creator account (not Personal)</li>
                  <li>You're an admin of the Facebook Page</li>
                  <li>Your Instagram and Facebook apps are updated to the latest version</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  4
                </div>
                <CardTitle>Connect Instagram in Neighbourhood Social</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Now that your Instagram and Facebook are connected, you can authorize Neighbourhood Social:
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
                    <p className="font-medium">You'll be redirected to Facebook to log in</p>
                    <p className="text-sm text-muted-foreground">Make sure to log in with the same Facebook account that's connected to your Page</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Review the permissions Neighbourhood Social is requesting</p>
                    <p className="text-sm text-muted-foreground">We need access to post content and read basic analytics</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Click "Continue" or "Allow"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">You'll be redirected back to Neighbourhood Social</p>
                    <p className="text-sm text-muted-foreground">You should see a "Connected" badge appear</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  5
                </div>
                <CardTitle>Enable Auto-Posting</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Final step - turn on automatic posting:
              </p>
              
              <div className="space-y-3 ml-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">In the Instagram Auto-Posting section, find the toggle switch</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Turn on "Enable Auto-Posting"</p>
                    <p className="text-sm text-muted-foreground">This allows Neighbourhood Social to post on your behalf</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Generate your first calendar and test a post!</p>
                    <p className="text-sm text-muted-foreground">Go to the Calendar page and try posting to verify everything works</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      🎉 You're all set! Neighbourhood Social can now automatically post to your Instagram account.
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
            <CardTitle className="text-primary">Troubleshooting Common Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Instagram account not connected to Facebook Page"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Go back to Step 3 and ensure you've linked your Instagram Business Account to a Facebook Page in the Instagram app settings.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "No Facebook pages found"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Create a Facebook Page first (Step 2), then make sure you're logging in with the correct Facebook account that owns that page.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Access token expired"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Instagram tokens expire every 60 days for security. Simply click "Reconnect Account" in Settings and authorize again.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Post failed to publish"</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Check that:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Your account is still connected (check for "Connected" badge)</li>
                    <li>You haven't exceeded Instagram's posting limits (max ~25 posts per day)</li>
                    <li>Your image meets Instagram's requirements (aspect ratio between 4:5 and 1.91:1)</li>
                    <li>Auto-posting is enabled in Settings</li>
                  </ul>
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">❌ "Configuration Required" button is grayed out</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> This means the Facebook App credentials haven't been configured in the backend yet. Please contact support at support@neighbourhoodsocial.com
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
                <p className="font-medium mb-1">Q: Is this free?</p>
                <p className="text-sm text-muted-foreground">
                  A: Instagram integration is included with your Neighbourhood Social subscription. There are no additional fees.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Can I still post manually to Instagram?</p>
                <p className="text-sm text-muted-foreground">
                  A: Yes! Connecting your account doesn't prevent you from posting manually. You have full control.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: What permissions does Neighbourhood Social need?</p>
                <p className="text-sm text-muted-foreground">
                  A: We only request the minimum permissions needed: ability to publish content to your Instagram feed and read basic analytics (likes, comments, reach).
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Can I disconnect my account?</p>
                <p className="text-sm text-muted-foreground">
                  A: Yes, you can disconnect at any time from the Settings page. We'll immediately stop posting to your account.
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: Will this work with a personal Instagram account?</p>
                <p className="text-sm text-muted-foreground">
                  A: No, Instagram only allows posting through third-party apps for Business and Creator accounts. Don't worry - converting is free and takes just a few minutes (Step 1).
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">Q: How often does the token need to be refreshed?</p>
                <p className="text-sm text-muted-foreground">
                  A: Instagram access tokens expire every 60 days for security. We'll notify you when it's time to reconnect.
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
              Follow the steps above and start automating your Instagram presence today!
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
