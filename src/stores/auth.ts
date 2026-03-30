import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import type {
  LoginRequest,
  SignUpRequest,
  SendMfaRequest,
  VerifyMfaRequest,
} from '@/services/authService'

interface AuthUser {
  userId: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('msa_access_token'))

  const storedUserId = localStorage.getItem('msa_user_id')
  const storedEmail = localStorage.getItem('msa_user_email')
  const user = ref<AuthUser | null>(
    storedUserId && storedEmail ? { userId: storedUserId, email: storedEmail } : null,
  )

  // Pending MFA state
  const pendingSessionId = ref<string | null>(null)
  const pendingUserId = ref<string | null>(null)
  const pendingEmail = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

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
      user.value = {
        userId: pendingUserId.value ?? '',
        email: pendingEmail.value ?? '',
      }
      localStorage.setItem('msa_user_id', user.value.userId)
      localStorage.setItem('msa_user_email', user.value.email)
      pendingSessionId.value = null
      pendingUserId.value = null
      pendingEmail.value = null
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
    }
  }

  return {
    user,
    accessToken,
    pendingSessionId,
    pendingUserId,
    pendingEmail,
    isAuthenticated,
    signUp,
    login,
    sendMfa,
    verifyMfa,
    logout,
  }
})
