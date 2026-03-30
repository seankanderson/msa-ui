import api from './api'

export interface SignUpRequest {
  email: string
  password: string
  phone: string
  firstName: string
  lastName: string
}

export interface SignUpResponse {
  success: boolean
  message: string
  userId: string
  requiresEmailVerification: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  sessionId: string
  userId: string
  email: string
  requiresMfa: boolean
}

export interface SendMfaRequest {
  sessionId: string
  userId: string
  via: 'sms' | 'email'
}

export interface SendMfaResponse {
  success: boolean
  message: string
  verificationSid: string
  sentVia: string
  maskedDestination: string
}

export interface VerifyMfaRequest {
  sessionId: string
  userId: string
  via: 'sms' | 'email'
  mfaCode: string
}

export interface VerifyMfaResponse {
  success: boolean
  message: string
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  mfaMethod: string
  user: Record<string, unknown>
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  userId: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface OperationResult {
  success: boolean
  message: string
}

const authService = {
  signUp(payload: SignUpRequest): Promise<{ data: SignUpResponse }> {
    return api.post('/api/users/auth/signup', payload)
  },

  login(payload: LoginRequest): Promise<{ data: LoginResponse }> {
    return api.post('/api/users/auth/login', payload)
  },

  sendMfa(payload: SendMfaRequest): Promise<{ data: SendMfaResponse }> {
    return api.post('/api/users/auth/send-mfa', payload)
  },

  verifyMfa(payload: VerifyMfaRequest): Promise<{ data: VerifyMfaResponse }> {
    return api.post('/api/users/auth/verify-mfa', payload)
  },

  verifyEmail(payload: VerifyEmailRequest): Promise<{ data: VerifyEmailResponse }> {
    return api.post('/api/users/auth/verify-email', payload)
  },

  forgotPassword(payload: ForgotPasswordRequest): Promise<{ data: OperationResult }> {
    return api.post('/api/users/auth/forgot-password', payload)
  },

  resetPassword(payload: ResetPasswordRequest): Promise<{ data: OperationResult }> {
    return api.post('/api/users/auth/reset-password', payload)
  },

  logout(): Promise<{ data: OperationResult }> {
    return api.post('/api/users/auth/logout')
  },
}

export default authService
