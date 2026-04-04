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
}

export interface UpdateUserProfileResponse {
  success: boolean
  message: string
  updatedFields: string[]
}

const userService = {
  getProfile(userId: string): Promise<{ data: UserProfile }> {
    return api.get(`/api/users/${userId}/profile`)
  },

  updateProfile(userId: string, payload: UpdateUserProfileRequest): Promise<{ data: UpdateUserProfileResponse }> {
    return api.put(`/api/users/${userId}/profile`, payload)
  },
}

export default userService
