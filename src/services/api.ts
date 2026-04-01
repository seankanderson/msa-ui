import axios from 'axios'
import { isRefreshingToken } from './refreshState'

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [toCamelCase(k), transformKeys(v)]),
    )
  }
  return obj
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:7071',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('msa_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// State for serialising concurrent refresh attempts
let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(err: unknown, token?: string) {
  refreshQueue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)))
  refreshQueue = []
}

function clearAuthAndRedirect() {
  localStorage.removeItem('msa_access_token')
  localStorage.removeItem('msa_refresh_token')
  localStorage.removeItem('msa_user_id')
  localStorage.removeItem('msa_user_email')
  localStorage.removeItem('msa_user_role')
  window.location.href = '/login'
}

api.interceptors.response.use(
  (response) => {
    response.data = transformKeys(response.data)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const url: string = originalRequest?.url ?? ''
    // Never attempt refresh for auth endpoints (avoids infinite loops)
    const isAuthEndpoint = url.includes('/users/auth/')

    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      const storedRefreshToken = localStorage.getItem('msa_refresh_token')
      if (!storedRefreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      // If a refresh is already in flight, queue this request to retry once it completes
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      const refreshStart = Date.now()
      const MIN_DISPLAY_MS = 1000
      isRefreshingToken.value = true

      try {
        // Use a raw axios call so this request bypasses our interceptors entirely
        const baseURL = (api.defaults.baseURL ?? '').replace(/\/$/, '')
        const { data } = await axios.post(
          `${baseURL}/api/users/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )
        // Handle both camelCase and PascalCase server responses
        const newAccessToken: string = data.accessToken ?? data.AccessToken
        const newRefreshToken: string = data.refreshToken ?? data.RefreshToken
        localStorage.setItem('msa_access_token', newAccessToken)
        if (newRefreshToken) localStorage.setItem('msa_refresh_token', newRefreshToken)

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        const elapsed = Date.now() - refreshStart
        if (elapsed < MIN_DISPLAY_MS) await new Promise(r => setTimeout(r, MIN_DISPLAY_MS - elapsed))

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        const elapsed = Date.now() - refreshStart
        if (elapsed < MIN_DISPLAY_MS) await new Promise(r => setTimeout(r, MIN_DISPLAY_MS - elapsed))
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
        isRefreshingToken.value = false
      }
    }

    return Promise.reject(error)
  },
)

/** Extracts the `message` field from an API error response body, falling back to a provided default. */
export function getApiError(err: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  const body = (err as { response?: { data?: { message?: string } } })?.response?.data
  return body?.message || fallback
}

export default api
