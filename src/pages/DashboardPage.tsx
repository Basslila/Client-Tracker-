import { useEffect, useState } from 'react'
import { Users, FolderOpen, IndianRupee, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { canSeeMoney, UserRole } from '../lib/permissions'
import { DashboardViews } from '../components/DashboardViews'

interface Project {
  id: string
  created_at: string
  budget: number
  amount_paid: number
  status: string
}

interface Client {
  id: string
  created_at: string
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetchData()

    // Set up real-time subscription for projects
    const projectsSubscription = supabase
      .channel('projects_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    // Set up real-time subscription for clients
    const clientsSubscription = supabase
      .channel('clients_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      projectsSubscription.unsubscribe()
      clientsSubscription.unsubscribe()
    }
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [roleData, clientsData, projectsData] = await Promise.all([
        supabase.from('user_roles').select('role').eq('id', user.id).single(),
        supabase.from('clients').select('id, created_at'),
        supabase.from('projects').select('id, created_at, budget, amount_paid, status'),
      ])

      setUserRole((roleData.data?.role as UserRole) || null)
      setClients(clientsData.data || [])
      setProjects(projectsData.data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading...</div>
  }

  const showMoney = canSeeMoney(userRole)
  const totalClients = clients.length
  const totalProjects = projects.length
  const totalRevenue = showMoney ? projects.reduce((sum, p) => sum + (p.amount_paid || 0), 0) : 0
  const totalBudget = showMoney ? projects.reduce((sum, p) => sum + (p.budget || 0), 0) : 0

  const projectsByStatus = {
    active: projects.filter(p => p.status === 'Active').length,
    onHold: projects.filter(p => p.status === 'On Hold').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    cancelled: projects.filter(p => p.status === 'Cancelled').length,
  }

  // Generate monthly data for charts (last 6 months)
  const now = new Date()
  const monthlyData = []

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

    const monthClients = clients.filter(c => {
      const createdAt = new Date(c.created_at)
      return createdAt >= monthDate && createdAt <= monthEnd
    }).length

    const monthProjects = projects.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt >= monthDate && createdAt <= monthEnd
    })

    const monthRevenue = showMoney ? monthProjects.reduce((sum, p) => sum + (p.amount_paid || 0), 0) : 0

    monthlyData.push({
      month: monthName,
      clients: monthClients,
      projects: monthProjects.length,
      revenue: monthRevenue
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your business metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalClients}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FolderOpen className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {showMoney && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue Earned</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalBudget.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700 mb-1">Active</p>
            <p className="text-2xl font-bold text-yellow-900">{projectsByStatus.active}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{projectsByStatus.completed}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-1">On Hold</p>
            <p className="text-2xl font-bold text-gray-900">{projectsByStatus.onHold}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-700 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-900">{projectsByStatus.cancelled}</p>
          </div>
        </div>
      </div>

      <DashboardViews monthlyData={monthlyData} showMoney={showMoney} />
    </div>
  )
}
