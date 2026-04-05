import api from './api'

export interface UserAddress {
  street?: string
  street2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface AssignedAdvisorInfo {
  advisorId: string
  firstName?: string
  lastName?: string
  crdNumber?: string
}

export interface UserProfile {
  userId: string
  email: string
  firstName: string
  lastName: string
  phone: string
  dateOfBirth: string | null
  governmentId: string
  authProvider: string
  role: 'client' | 'advisor' | 'associate' | 'supervisor'
  smsOptIn: boolean
  isEnabled: boolean
  emailVerified: boolean
  signupDate: string | null
  crdNumber?: string
  assignedAdvisor?: AssignedAdvisorInfo
  address?: UserAddress
  createdAt: string | null
  updatedAt: string | null
}

export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  dateOfBirth?: string | null
  phone?: string
  governmentId?: string
  smsOptIn?: boolean
  address?: UserAddress
  isEnabled?: boolean
  role?: 'client' | 'advisor' | 'associate' | 'supervisor'
}

export interface UpdateUserProfileResponse {
  success: boolean
  message: string
  updatedFields: string[]
}

export interface UserListItem {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role: 'client' | 'advisor' | 'associate' | 'supervisor'
  isEnabled: boolean
  emailVerified: boolean
  signupDate: string | null
  crdNumber?: string
  assignedAdvisorId?: string
}

export interface UserListResponse {
  users: UserListItem[]
  pageInfo: {
    skip: number
    take: number
    total: number
  }
}

export interface UpdateUserStatusResponse {
  success: boolean
  message: string
  isEnabled: boolean
}

export interface AuditLogFieldChange {
  before: unknown
  after: unknown
}

export interface AuditLogEntry {
  id: string
  eventType: string
  userId: string
  targetUserId: string | null
  action: string
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  statusCode: number | null
  errorMessage: string | null
  timestamp: string
}

export interface AuditLogResponse {
  items: AuditLogEntry[]
  total: number
  skip: number
  take: number
}

const userService = {
  getProfile(userId: string): Promise<{ data: UserProfile }> {
    return api.get(`/api/users/${userId}/profile`)
  },

  updateProfile(userId: string, payload: UpdateUserProfileRequest): Promise<{ data: UpdateUserProfileResponse }> {
    return api.put(`/api/users/${userId}/profile`, payload)
  },

  listUsers(params?: { role?: string; skip?: number; take?: number }): Promise<{ data: UserListResponse }> {
    return api.get('/api/users', { params })
  },

  updateUserStatus(userId: string, isEnabled: boolean): Promise<{ data: UpdateUserStatusResponse }> {
    return api.post(`/api/users/${userId}/status`, { isEnabled })
  },

  changePassword(userId: string, newPassword: string): Promise<{ data: { success: boolean; message: string } }> {
    return api.post(`/api/users/${userId}/change-password`, { newPassword })
  },

  getUserAuditLogs(
    userId: string,
    params?: { eventType?: string; skip?: number; take?: number; sort?: 'asc' | 'desc' },
  ): Promise<{ data: AuditLogResponse }> {
    return api.get(`/api/users/${userId}/audit`, { params })
  },
}

export default userService
