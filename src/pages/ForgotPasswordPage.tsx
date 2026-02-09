import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { authService } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.sendPasswordResetOtp(email)
      toast.success('Reset code sent to your email')
      setStep('otp')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await authService.verifyOtpAndResetPassword(email, otp, password)
      toast.success('Password reset successfully!')
      setStep('success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Link to="/login" className="absolute top-4 left-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">PostPilot</span>
            </div>
          </div>
          <CardTitle>
            {step === 'success' ? 'Password Reset!' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && 'Enter the code sent to your email'}
            {step === 'success' && 'Redirecting you to login...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Reset Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Code sent to: {email}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                Change Email
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Password reset successful!</p>
              <p className="text-sm text-muted-foreground">
                You can now login with your new password
              </p>
            </div>
          )}

          {step === 'email' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
