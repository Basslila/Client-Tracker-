import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Folder, Users, Settings, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

type UserRole = 'admin' | 'editor' | 'viewer' | null

interface UserRoleData {
  role: UserRole
  email: string
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Viewer'
    default:
      return 'User'
  }
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/', icon: Users },
  { name: 'Projects', href: '/projects', icon: Folder },
]

export default function Sidebar({ user }: { user: User }) {
  const navigate = useNavigate()
  const [userRoleData, setUserRoleData] = useState<UserRoleData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function fetchUserRole() {
      const { data } = await supabase
        .from('user_roles')
        .select('role, email')
        .eq('id', user.id)
        .single()

      if (data) {
        const roleData = data as UserRoleData
        setUserRoleData(roleData)
        setIsAdmin(roleData.role === 'admin')
      }
    }

    fetchUserRole()
  }, [user.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <span className="font-bold text-xl">C</span>
        </div>
        <span className="font-bold text-xl text-gray-900">ClientTracker</span>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`
                }
              >
                <Settings size={20} />
                <span>User Management</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
        {userRoleData && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signed in as</p>
            <p className="text-sm text-gray-900 mt-1 truncate">{user.email}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
              ${userRoleData.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                userRoleData.role === 'editor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-green-50 text-green-700 border border-green-200'
              }`}>
              {getRoleLabel(userRoleData.role)}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
