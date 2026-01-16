export type UserRole = 'admin' | 'music_producer' | 'sales_team' | 'editor' | 'viewer' | null

export function canEdit(role: UserRole): boolean {
  return role === 'admin' || role === 'music_producer' || role === 'editor'
}

export function canDelete(role: UserRole): boolean {
  return role === 'admin'
}

export function canSeeMoney(role: UserRole): boolean {
  return role === 'admin' || role === 'sales_team'
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === 'admin'
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'music_producer':
      return 'Music Producer'
    case 'sales_team':
      return 'Sales Team'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Viewer'
    default:
      return 'User'
  }
}
