import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { DollarSign, TrendingUp, Percent } from 'lucide-react'

interface Project {
  id: string
  name: string
  budget: number | null
  commission_enabled: boolean
  commission_percentage: number
  status: string
  clients?: {
    name: string
  }
}

export default function SalesCommissionPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'enabled'>('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const filteredProjects = filter === 'enabled' 
    ? projects.filter(p => p.commission_enabled)
    : projects

  const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const totalCommission = filteredProjects.reduce((sum, p) => {
    if (p.commission_enabled && p.budget) {
      return sum + (p.budget * (p.commission_percentage / 100))
    }
    return sum
  }, 0)

  const enabledCount = projects.filter(p => p.commission_enabled).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Commission</h1>
        <p className="text-gray-600 mt-1">Track and manage project commissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Percent className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Enabled Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {enabledCount} <span className="text-sm text-gray-500">/ {projects.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          onClick={() => setFilter('enabled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'enabled' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Commission Enabled ({enabledCount})
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission %
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const commissionAmount = project.commission_enabled && project.budget
                    ? project.budget * (project.commission_percentage / 100)
                    : 0

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{project.name}</span>
                          {project.commission_enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Enabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {project.clients?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'Active' ? 'bg-yellow-100 text-yellow-800' :
                          project.status === 'On Hold' ? 'bg-gray-100 text-gray-800' :
                          project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {project.budget 
                          ? `₹${project.budget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {project.commission_enabled 
                          ? `${project.commission_percentage}%`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                        {commissionAmount > 0
                          ? `₹${commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'
                        }
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
