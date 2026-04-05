<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiError } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
})
const error = ref('')
const phoneError = ref('')
const loading = ref(false)

// Normalise input to E.164 (+[country][number], 7–15 digits after +).
// Strips spaces, dashes, dots, parentheses then prepends +1 for bare 10-digit US numbers.
function normalizePhone(value: string): string {
  const digits = value.replace(/[\s().+-]/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (value.startsWith('+')) return `+${digits}`
  return `+${digits}`
}

function validatePhone(value: string): string | null {
  const e164 = /^\+[1-9]\d{6,14}$/
  if (!value) return 'Mobile phone number is required.'
  if (!e164.test(value)) return 'Enter a valid number in E.164 format, e.g. +12125551234'
  return null
}

function handlePhoneBlur() {
  const normalized = normalizePhone(form.value.phone)
  if (/^\+[1-9]\d{6,14}$/.test(normalized)) {
    form.value.phone = normalized
    phoneError.value = ''
  } else {
    phoneError.value = validatePhone(form.value.phone) ?? ''
  }
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 128) return 'Password must be no more than 128 characters.'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!/[!@#$%^&*()_+\-=\[\]{};':",./<>?\\|`~]/.test(password)) return 'Password must contain at least one special character.'
  return null
}

async function handleSubmit() {
  error.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }
  const normalized = normalizePhone(form.value.phone)
  const phErr = validatePhone(normalized)
  if (phErr) {
    phoneError.value = phErr
    return
  }
  form.value.phone = normalized
  phoneError.value = ''
  const pwErr = validatePassword(form.value.password)
  if (pwErr) {
    error.value = pwErr
    return
  }
  if (!form.value.agreeToTerms) {
    error.value = 'You must agree to the Terms of Use to continue.'
    return
  }

  loading.value = true
  try {
    const result = await auth.signUp({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
    })
    if (result.success) {
      router.push({
        name: 'signup-success',
        query: { email: form.value.email },
      })
    } else {
      error.value = result.message || 'Registration failed. Please try again.'
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
        <div class="col-sm-10 col-md-8 col-lg-6">
          <div class="msa-auth-card">
            <div class="msa-auth-card-header">
              <RouterLink to="/" class="msa-auth-brand">Main Street Advisors</RouterLink>
              <h1 class="msa-auth-title">Create Your Account</h1>
              <p class="msa-auth-sub">
                Start your journey toward retirement confidence. Free to join.
              </p>
            </div>

            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <form novalidate @submit.prevent="handleSubmit">
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    id="firstName"
                    v-model="form.firstName"
                    type="text"
                    class="form-control"
                    autocomplete="given-name"
                    required
                  />
                </div>
                <div class="col-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    id="lastName"
                    v-model="form.lastName"
                    type="text"
                    class="form-control"
                    autocomplete="family-name"
                    required
                  />
                </div>
              </div>

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

              <div class="mb-3">
                <label for="phoneNumber" class="form-label">
                  Mobile Phone
                  <span class="msa-label-hint">— for multi-factor authentication</span>
                </label>
                <input
                  id="phoneNumber"
                  v-model="form.phone"
                  type="tel"
                  :class="['form-control', phoneError ? 'is-invalid' : '']"
                  autocomplete="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  @blur="handlePhoneBlur"
                />
                <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
                <div v-else class="msa-field-hint mt-1">Include country code, e.g. +12125551234</div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                />
                <div class="msa-field-hint mt-1">
                  Minimum 8 characters, one uppercase letter, and one number.
                </div>
              </div>

              <div class="mb-4">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  required
                />
              </div>

              <div class="mb-4">
                <div class="form-check">
                  <input
                    id="agreeToTerms"
                    v-model="form.agreeToTerms"
                    class="form-check-input"
                    type="checkbox"
                    required
                  />
                  <label class="form-check-label msa-check-label" for="agreeToTerms">
                    I agree to the
                    <a href="#" class="msa-link">Terms of Use</a>,
                    <a href="#" class="msa-link">Privacy Policy</a>, and
                    <a href="#" class="msa-link">Form ADV Disclosure</a>.
                  </label>
                </div>
              </div>

              <button type="submit" class="btn btn-primary-msa w-100" :disabled="loading">
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ loading ? 'Creating account…' : 'Create Account' }}
              </button>
            </form>

            <p class="msa-auth-footer-text mt-4 text-center">
              Already have an account?
              <RouterLink to="/login" class="msa-link">Sign in here</RouterLink>
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

.msa-label-hint {
  font-weight: 400;
  color: #6b7a8d;
  font-size: 0.8rem;
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

.msa-field-hint {
  font-size: 0.78rem;
  color: #6b7a8d;
}

.form-check-input:checked {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
}

.msa-check-label {
  font-size: 0.83rem;
  color: #4a5568;
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
