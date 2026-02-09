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

function App() {
  const { user, loading } = useAuth()

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
    </Routes>
  )
}

export default App
