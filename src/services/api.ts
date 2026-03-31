import axios from 'axios'

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

api.interceptors.response.use(
  (response) => {
    response.data = transformKeys(response.data)
    return response
  },
  (error) => {
    const url: string = error.config?.url ?? ''
    const isAuthEndpoint = url.includes('/users/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('msa_access_token')
      localStorage.removeItem('msa_refresh_token')
      window.location.href = '/login'
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
