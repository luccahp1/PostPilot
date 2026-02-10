import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import SubscribePage from '@/pages/SubscribePage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import GeneratorPage from '@/pages/GeneratorPage'
import CalendarPage from '@/pages/CalendarPage'
import BillingPage from '@/pages/BillingPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import SettingsPage from '@/pages/SettingsPage'
import SchedulePage from '@/pages/SchedulePage'
import HashtagAnalyticsPage from '@/pages/HashtagAnalyticsPage'
import StoriesPage from '@/pages/StoriesPage'
import ProductGalleryPage from '@/pages/ProductGalleryPage'
import MenuManagementPage from '@/pages/MenuManagementPage'
import CSVDocumentationPage from '@/pages/CSVDocumentationPage'
import MenuAnalyticsPage from '@/pages/MenuAnalyticsPage'
import InstagramSetupGuidePage from '@/pages/InstagramSetupGuidePage'

function App() {
  const { user, loading } = useAuth()

  // Check if environment variables are configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 space-y-3">
            <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
            <p className="text-sm text-muted-foreground">
              Supabase environment variables are not configured. The application cannot connect to the backend.
            </p>
            <div className="text-left bg-background rounded p-3 text-xs font-mono">
              <p className="text-muted-foreground mb-2">Missing variables:</p>
              {!supabaseUrl && <p className="text-destructive">• VITE_SUPABASE_URL</p>}
              {!supabaseAnonKey && <p className="text-destructive">• VITE_SUPABASE_ANON_KEY</p>}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              These should be automatically configured by OnSpace Cloud.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />
      <Route path="/subscribe" element={user ? <SubscribePage /> : <Navigate to="/login" />} />
      <Route path="/onboarding" element={user ? <OnboardingPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/generator" element={user ? <GeneratorPage /> : <Navigate to="/login" />} />
      <Route path="/calendar/:calendarId" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
      <Route path="/billing" element={user ? <BillingPage /> : <Navigate to="/login" />} />
      <Route path="/analytics" element={user ? <AnalyticsPage /> : <Navigate to="/login" />} />
      <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
      <Route path="/schedule" element={user ? <SchedulePage /> : <Navigate to="/login" />} />
      <Route path="/hashtag-analytics" element={user ? <HashtagAnalyticsPage /> : <Navigate to="/login" />} />
      <Route path="/stories" element={user ? <StoriesPage /> : <Navigate to="/login" />} />
      <Route path="/products" element={user ? <ProductGalleryPage /> : <Navigate to="/login" />} />
      <Route path="/menu-management" element={user ? <MenuManagementPage /> : <Navigate to="/login" />} />
      <Route path="/csv-docs" element={user ? <CSVDocumentationPage /> : <Navigate to="/login" />} />
      <Route path="/menu-analytics" element={user ? <MenuAnalyticsPage /> : <Navigate to="/login" />} />
      <Route path="/instagram-setup-guide" element={user ? <InstagramSetupGuidePage /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App
