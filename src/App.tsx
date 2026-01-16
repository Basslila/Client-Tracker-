import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import EditProjectPage from './pages/EditProjectPage'
import NewProjectPage from './pages/NewProjectPage'
import ClientDetailPage from './pages/ClientDetailPage'
import EditClientPage from './pages/EditClientPage'
import NewClientPage from './pages/NewClientPage'
import NewTaskPage from './pages/NewTaskPage'
import AdminUsersPage from './pages/AdminUsersPage'
import NewUserPage from './pages/NewUserPage'
import SalesCommissionPage from './pages/SalesCommissionPage'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('Auth session check timed out')
      setLoading(false)
    }, 5000)

    // Check active session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((error) => {
        clearTimeout(timeout)
        console.error('Error fetching session:', error)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar user={user} />
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/new" element={<NewProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              <Route path="/clients/new" element={<NewClientPage />} />
              <Route path="/clients/:id" element={<ClientDetailPage />} />
              <Route path="/clients/:id/edit" element={<EditClientPage />} />
              <Route path="/tasks/new" element={<NewTaskPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/users/new" element={<NewUserPage />} />
              <Route path="/admin/sales-commission" element={<SalesCommissionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App
