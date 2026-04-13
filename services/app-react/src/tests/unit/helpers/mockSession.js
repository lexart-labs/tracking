import sessionStore from '@/stores/session'

export const adminUser = { id: 1, name: 'Admin User', userRole: 'admin' }
export const pmUser = { id: 2, name: 'PM User', userRole: 'pm' }
export const developerUser = { id: 3, name: 'Dev User', userRole: 'developer' }
export const employeeUser = { id: 4, name: 'Emp User', userRole: 'employee' }
export const clientUser = { id: 5, name: 'Client User', userRole: 'client' }
export const architectUser = { id: 6, name: 'Arch User', userRole: 'architect' }

export function setSession(user = adminUser, token = 'test-token') {
  sessionStore.setState({ user, token })
}

export function clearSession() {
  sessionStore.setState({ user: null, token: null })
}
