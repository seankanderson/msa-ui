import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import userService from '@/services/userService'
import type {
  LoginRequest,
  SignUpRequest,
  SendMfaRequest,
  VerifyMfaRequest,
} from '@/services/authService'

type UserRole = 'client' | 'advisor' | 'associate' | 'supervisor'

interface AuthUser {
  userId: string
  email: string
  role: UserRole | null
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('msa_access_token'))

  const storedUserId = localStorage.getItem('msa_user_id')
  const storedEmail = localStorage.getItem('msa_user_email')
  const storedRole = localStorage.getItem('msa_user_role') as UserRole | null
  const user = ref<AuthUser | null>(
    storedUserId && storedEmail
      ? { userId: storedUserId, email: storedEmail, role: storedRole }
      : null,
  )

  // Pending MFA state
  const pendingSessionId = ref<string | null>(null)
  const pendingUserId = ref<string | null>(null)
  const pendingEmail = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isSupervisor = computed(() => user.value?.role === 'supervisor')
  const isAdminRole = computed(() => user.value?.role === 'supervisor' || user.value?.role === 'advisor')

  async function signUp(payload: SignUpRequest) {
    const { data } = await authService.signUp(payload)
    if (data.success) {
      pendingUserId.value = data.userId
    }
    return data
  }

  async function login(payload: LoginRequest) {
    const { data } = await authService.login(payload)
    if (data.success) {
      pendingSessionId.value = data.sessionId
      pendingUserId.value = data.userId
      pendingEmail.value = data.email
    }
    return data
  }

  async function sendMfa(payload: SendMfaRequest) {
    const { data } = await authService.sendMfa(payload)
    return data
  }

  async function verifyMfa(payload: VerifyMfaRequest) {
    const { data } = await authService.verifyMfa(payload)
    if (data.success && data.accessToken) {
      accessToken.value = data.accessToken
      localStorage.setItem('msa_access_token', data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem('msa_refresh_token', data.refreshToken)
      }
      const userId = pendingUserId.value ?? ''
      const email = pendingEmail.value ?? ''
      user.value = { userId, email, role: null }
      localStorage.setItem('msa_user_id', userId)
      localStorage.setItem('msa_user_email', email)
      pendingSessionId.value = null
      pendingUserId.value = null
      pendingEmail.value = null
      // Fetch role immediately so route guards work from first navigation
      try {
        const { data: profile } = await userService.getProfile(userId)
        setUserRole(profile.role)
      } catch {
        // non-fatal — role will be populated when profile page loads
      }
    }
    return data
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      accessToken.value = null
      user.value = null
      localStorage.removeItem('msa_access_token')
      localStorage.removeItem('msa_refresh_token')
      localStorage.removeItem('msa_user_id')
      localStorage.removeItem('msa_user_email')
      localStorage.removeItem('msa_user_role')
    }
  }

  function setUserRole(role: UserRole | null) {
    if (user.value) {
      user.value = { ...user.value, role }
    }
    if (role) {
      localStorage.setItem('msa_user_role', role)
    } else {
      localStorage.removeItem('msa_user_role')
    }
  }

  function updateDisplayName(_firstName: string, _lastName: string) {
    // Display name derived from email; placeholder for future firstName display if added to AuthUser
  }

  return {
    user,
    accessToken,
    pendingSessionId,
    pendingUserId,
    pendingEmail,
    isAuthenticated,
    isSupervisor,
    isAdminRole,
    signUp,
    login,
    sendMfa,
    verifyMfa,
    logout,
    setUserRole,
    updateDisplayName,
  }
})
