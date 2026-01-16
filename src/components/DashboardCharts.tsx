import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

type TimeFilter = 'month' | '3months' | '6months'

interface DashboardChartsProps {
  monthlyData: {
    month: string
    projects: number
    revenue: number
    clients: number
  }[]
  showMoney: boolean
}

export function DashboardCharts({ monthlyData, showMoney }: DashboardChartsProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('3months')

  const getFilteredData = () => {
    const limits = {
      'month': 1,
      '3months': 3,
      '6months': 6
    }
    return monthlyData.slice(0, limits[timeFilter]).reverse()
  }

  const filteredData = getFilteredData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('3months')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === '3months'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimeFilter('6months')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timeFilter === '6months'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            6 Months
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        {showMoney && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Projects Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects Started</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="projects" fill="#10b981" name="Projects" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Clients Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Clients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clients" fill="#8b5cf6" name="New Clients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Combined Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} name="Projects" />
              <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#8b5cf6" strokeWidth={2} name="Clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
