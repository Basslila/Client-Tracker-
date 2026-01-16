import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, FolderOpen, IndianRupee, TrendingUp } from 'lucide-react'
import { DashboardViews } from '@/components/DashboardViews'
import { canSeeMoney } from '@/utils/permissions'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch user role and stats in parallel
  const [
    { data: userRole },
    { data: clients },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('clients')
      .select('id, created_at'),
    supabase
      .from('projects')
      .select('id, created_at, budget, amount_paid, status'),
  ])

  const showMoney = canSeeMoney((userRole?.role as any) || null)

  // Calculate stats
  const totalClients = clients?.length || 0
  const totalProjects = projects?.length || 0
  const totalRevenue = showMoney ? (projects?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0) : 0
  const totalBudget = showMoney ? (projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0) : 0

  // Calculate projects by status
  const projectsByStatus = {
    inProgress: projects?.filter(p => p.status === 'In Progress').length || 0,
    onHold: projects?.filter(p => p.status === 'On Hold').length || 0,
    completed: projects?.filter(p => p.status === 'Completed').length || 0,
    cancelled: projects?.filter(p => p.status === 'Cancelled').length || 0,
  }

  // Generate monthly data for charts (last 6 months)
  const now = new Date()
  const monthlyData = []
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    
    const monthClients = clients?.filter(c => {
      const createdAt = new Date(c.created_at)
      return createdAt >= monthDate && createdAt <= monthEnd
    }).length || 0
    
    const monthProjects = projects?.filter(p => {
      const createdAt = new Date(p.created_at)
      return createdAt >= monthDate && createdAt <= monthEnd
    }) || []
    
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

      {/* Stats Cards */}
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

      {/* Projects by Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-900">{projectsByStatus.inProgress}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-900">{projectsByStatus.completed}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm font-medium text-orange-700 mb-1">On Hold</p>
            <p className="text-2xl font-bold text-orange-900">{projectsByStatus.onHold}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-700 mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-900">{projectsByStatus.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Views with Toggle */}
      <DashboardViews monthlyData={monthlyData} showMoney={showMoney} />
    </div>
  )
}
