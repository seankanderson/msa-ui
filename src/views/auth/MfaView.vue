<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getApiError } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const selectedMethod = ref<'sms' | 'email'>('sms')
const otpCode = ref('')
const maskedDestination = ref('')
const codeSent = ref(false)
const sending = ref(false)
const verifying = ref(false)
const error = ref('')
const resendCountdown = ref(0)

let countdownTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (!auth.pendingSessionId) {
    router.replace('/login')
  }
})

async function sendCode() {
  if (!auth.pendingSessionId) return
  error.value = ''
  sending.value = true
  try {
    const result = await auth.sendMfa({
      sessionId: auth.pendingSessionId,
      userId: auth.pendingUserId ?? '',
      via: selectedMethod.value,
    })
    if (result.success) {
      maskedDestination.value = result.maskedDestination
      codeSent.value = true
      startResendCountdown()
    } else {
      error.value = result.message || 'Failed to send code. Please try again.'
    }
  } catch (err) {
    error.value = getApiError(err)
  } finally {
    sending.value = false
  }
}

async function handleVerify() {
  if (!auth.pendingSessionId) return
  error.value = ''
  verifying.value = true
  try {
    const result = await auth.verifyMfa({
      sessionId: auth.pendingSessionId,
      userId: auth.pendingUserId ?? '',
      via: selectedMethod.value,
      mfaCode: otpCode.value.trim(),
    })
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.message || 'Invalid code. Please try again.'
    }
  } catch (err) {
    error.value = getApiError(err)
  } finally {
    verifying.value = false
  }
}

function startResendCountdown() {
  resendCountdown.value = 30
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    resendCountdown.value -= 1
    if (resendCountdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
    }
  }, 1000)
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
              <h1 class="msa-auth-title">Two-Factor Authentication</h1>
              <p class="msa-auth-sub">
                Verify your identity to complete sign-in.
              </p>
            </div>

            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>

            <!-- Step 1: Choose method and send code -->
            <template v-if="!codeSent">
              <p class="msa-step-label">How would you like to receive your verification code?</p>

              <div class="msa-method-group mb-4">
                <label
                  class="msa-method-option"
                  :class="{ active: selectedMethod === 'sms' }"
                >
                  <input v-model="selectedMethod" type="radio" value="sms" class="visually-hidden" />
                  <span class="msa-method-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                      <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                  </span>
                  <span class="msa-method-text">
                    <span class="msa-method-name">Text Message (SMS)</span>
                    <span class="msa-method-desc">Sent to your registered mobile number</span>
                  </span>
                </label>

                <label
                  class="msa-method-option"
                  :class="{ active: selectedMethod === 'email' }"
                >
                  <input v-model="selectedMethod" type="radio" value="email" class="visually-hidden" />
                  <span class="msa-method-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                    </svg>
                  </span>
                  <span class="msa-method-text">
                    <span class="msa-method-name">Email</span>
                    <span class="msa-method-desc">Sent to {{ auth.pendingEmail ?? 'your registered email' }}</span>
                  </span>
                </label>
              </div>

              <button
                class="btn btn-primary-msa w-100"
                :disabled="sending"
                @click="sendCode"
              >
                <span
                  v-if="sending"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ sending ? 'Sending…' : 'Send Verification Code' }}
              </button>
            </template>

            <!-- Step 2: Enter code -->
            <template v-else>
              <p class="msa-step-label">
                A 6-digit code was sent to
                <strong>{{ maskedDestination }}</strong>.
                Enter it below.
              </p>

              <form novalidate @submit.prevent="handleVerify">
                <div class="mb-4">
                  <label for="otpCode" class="form-label">Verification Code</label>
                  <input
                    id="otpCode"
                    v-model="otpCode"
                    type="text"
                    inputmode="numeric"
                    class="form-control form-control-lg msa-otp-input"
                    autocomplete="one-time-code"
                    maxlength="6"
                    placeholder="— — — — — —"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary-msa w-100"
                  :disabled="verifying || otpCode.length < 6"
                >
                  <span
                    v-if="verifying"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {{ verifying ? 'Verifying…' : 'Verify & Sign In' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <button
                  class="btn btn-link msa-resend-btn"
                  :disabled="resendCountdown > 0 || sending"
                  @click="sendCode"
                >
                  {{
                    resendCountdown > 0
                      ? `Resend code in ${resendCountdown}s`
                      : 'Resend code'
                  }}
                </button>
              </div>
            </template>

            <div class="text-center mt-4">
              <RouterLink to="/login" class="msa-back-link">
                &larr; Back to sign in
              </RouterLink>
            </div>
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

.msa-step-label {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 1.25rem;
}

/* Method selector */
.msa-method-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.msa-method-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #d1d9e0;
  border-radius: 4px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.msa-method-option.active {
  border-color: var(--msa-navy);
  background-color: rgba(27, 42, 74, 0.04);
}

.msa-method-icon {
  color: var(--msa-navy);
  flex-shrink: 0;
}

.msa-method-text {
  display: flex;
  flex-direction: column;
}

.msa-method-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.msa-method-desc {
  font-size: 0.8rem;
  color: #6b7a8d;
}

/* OTP input */
.msa-otp-input {
  font-size: 1.5rem;
  letter-spacing: 0.35em;
  text-align: center;
  font-variant-numeric: tabular-nums;
  border-color: #d1d9e0;
}

.msa-otp-input:focus {
  border-color: var(--msa-navy);
  box-shadow: 0 0 0 0.2rem rgba(27, 42, 74, 0.15);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
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

.msa-resend-btn {
  font-size: 0.85rem;
  color: var(--msa-navy);
  text-decoration: none;
  padding: 0;
}

.msa-resend-btn:disabled {
  color: #9aa5b4;
  pointer-events: none;
}

.msa-back-link {
  font-size: 0.85rem;
  color: #6b7a8d;
  text-decoration: none;
}

.msa-back-link:hover {
  color: var(--msa-navy);
}
</style>
