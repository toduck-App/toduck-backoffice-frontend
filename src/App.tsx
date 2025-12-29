import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DomainGuard } from '@/components/deeplink/DomainGuard'

// Pages (to be created)
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import UsersPage from '@/pages/users/UsersPage'
import SocialsPage from '@/pages/socials/SocialsPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import AppVersionsPage from '@/pages/appVersions/AppVersionsPage'
import DeepLinkPage from '@/pages/deeplink/DeepLinkPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 딥링크 라우트 - toduck.app 도메인 전용 */}
          <Route
            path="/_ul/*"
            element={
              <DomainGuard allowedDomain="toduck.app">
                <DeepLinkPage />
              </DomainGuard>
            }
          />

          {/* 백오피스 라우트 - 백오피스 도메인 전용 */}
          <Route
            path="/login"
            element={
              <DomainGuard allowedDomain="backoffice">
                <LoginPage />
              </DomainGuard>
            }
          />
          <Route
            path="/"
            element={
              <DomainGuard allowedDomain="backoffice">
                <ProtectedRoute />
              </DomainGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="socials" element={<SocialsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="app-versions" element={<AppVersionsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App