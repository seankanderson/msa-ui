<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/authService'

const route = useRoute()
const router = useRouter()

const verifying = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const userId = route.query.userId as string
  const token = route.query.token as string

  if (!userId || !token) {
    verifying.value = false
    error.value = 'Invalid or missing verification link. Please request a new one.'
    return
  }

  try {
    const { data } = await authService.verifyEmail({ userId, token })
    success.value = data.success
    if (!data.success) {
      error.value = data.message || 'Verification failed. The link may have expired.'
    }
  } catch {
    error.value = 'An unexpected error occurred. Please try again or contact support.'
  } finally {
    verifying.value = false
  }
})
</script>

<template>
  <div class="msa-auth-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-sm-10 col-md-8 col-lg-5">
          <div class="msa-auth-card text-center">
            <RouterLink to="/" class="msa-auth-brand">Main Street Advisors</RouterLink>

            <!-- Loading -->
            <template v-if="verifying">
              <div class="my-4">
                <div class="spinner-border text-navy" role="status" style="width: 2.5rem; height: 2.5rem;">
                  <span class="visually-hidden">Verifying…</span>
                </div>
                <p class="msa-status-text mt-3">Verifying your email address…</p>
              </div>
            </template>

            <!-- Success -->
            <template v-else-if="success">
              <div class="msa-status-icon msa-status-success my-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                </svg>
              </div>
              <h1 class="msa-auth-title">Email Verified</h1>
              <p class="msa-auth-sub mt-2">
                Your email address has been confirmed. You can now sign in to your account.
              </p>
              <RouterLink class="btn btn-primary-msa mt-4 px-4" to="/login">
                Sign In
              </RouterLink>
            </template>

            <!-- Error -->
            <template v-else>
              <div class="msa-status-icon msa-status-error my-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>
              </div>
              <h1 class="msa-auth-title">Verification Failed</h1>
              <p class="msa-auth-sub mt-2">{{ error }}</p>
              <RouterLink class="btn btn-outline-navy mt-4 px-4" to="/signup">
                Back to Sign Up
              </RouterLink>
            </template>
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

.msa-status-text {
  color: #6b7a8d;
  font-size: 0.95rem;
}

.msa-status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
}

.msa-status-success {
  background-color: #ecfdf5;
  color: #16a34a;
}

.msa-status-error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.text-navy {
  color: var(--msa-navy) !important;
}

.btn-primary-msa {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-weight: 600;
  border-radius: 3px;
  display: inline-block;
}

.btn-primary-msa:hover {
  background-color: #142038;
  border-color: #142038;
  color: #fff;
}

.btn-outline-navy {
  background-color: transparent;
  border: 1px solid var(--msa-navy);
  color: var(--msa-navy);
  font-weight: 600;
  border-radius: 3px;
  display: inline-block;
  text-decoration: none;
}

.btn-outline-navy:hover {
  background-color: var(--msa-navy);
  color: #fff;
}
</style>
