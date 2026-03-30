<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiError } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
})
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const result = await auth.login({ email: form.value.email, password: form.value.password })
    if (result.success && result.requiresMfa) {
      router.push('/mfa')
    } else if (result.success) {
      router.push('/')
    } else {
      error.value = result.message || 'Login failed. Please check your credentials.'
    }
  } catch (err) {
    error.value = getApiError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="msa-auth-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-sm-10 col-md-8 col-lg-5">
          <div class="msa-auth-card">
            <div class="msa-auth-card-header">
              <RouterLink to="/" class="msa-auth-brand">Main Street Advisors</RouterLink>
              <h1 class="msa-auth-title">Sign In</h1>
              <p class="msa-auth-sub">Welcome back. Please enter your credentials.</p>
            </div>

            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <form novalidate @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="password" class="form-label mb-0">Password</label>
                  <RouterLink to="/forgot-password" class="msa-link-small">
                    Forgot password?
                  </RouterLink>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary-msa w-100"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ loading ? 'Signing in…' : 'Sign In' }}
              </button>
            </form>

            <p class="msa-auth-footer-text mt-4 text-center">
              Don&rsquo;t have an account?
              <RouterLink to="/signup" class="msa-link">Create one here</RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msa-auth-page {
  min-height: calc(100vh - 130px);
  background-color: var(--msa-light-gray);
  display: flex;
  align-items: center;
  padding: 3rem 0;
}

.msa-auth-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  padding: 2.5rem;
}

.msa-auth-card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.msa-auth-brand {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--msa-gold);
  text-decoration: none;
  margin-bottom: 1rem;
}

.msa-auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.25rem;
}

.msa-auth-sub {
  color: #6b7a8d;
  font-size: 0.9rem;
  margin: 0;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-control {
  border-color: #d1d9e0;
  border-radius: 3px;
  padding: 0.6rem 0.75rem;
}

.form-control:focus {
  border-color: var(--msa-navy);
  box-shadow: 0 0 0 0.2rem rgba(27, 42, 74, 0.15);
}

.btn-primary-msa {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-weight: 600;
  padding: 0.625rem 1rem;
  border-radius: 3px;
}

.btn-primary-msa:hover:not(:disabled) {
  background-color: #142038;
  border-color: #142038;
  color: #fff;
}

.btn-primary-msa:disabled {
  opacity: 0.65;
}

.msa-link-small {
  font-size: 0.8rem;
  color: var(--msa-navy);
  text-decoration: none;
}

.msa-link-small:hover {
  text-decoration: underline;
}

.msa-link {
  color: var(--msa-navy);
  font-weight: 600;
  text-decoration: none;
}

.msa-link:hover {
  text-decoration: underline;
}

.msa-auth-footer-text {
  font-size: 0.875rem;
  color: #6b7a8d;
}
</style>
