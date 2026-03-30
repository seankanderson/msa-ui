<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { getApiError } from '@/services/api'
import type { UserProfile, UpdateUserProfileRequest } from '@/services/userService'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const phoneError = ref('')

const profile = ref<UserProfile | null>(null)

const form = ref<UpdateUserProfileRequest & { phone: string }>({
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  governmentId: '',
  smsOptIn: false,
})

function normalizePhone(value: string): string {
  const digits = value.replace(/[\s().+-]/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (value.startsWith('+')) return `+${digits.replace(/\D/g, '')}`
  return `+${digits}`
}

function validatePhone(value: string): string | null {
  if (!value) return null // phone is optional on update
  const e164 = /^\+[1-9]\d{6,14}$/
  if (!e164.test(value)) return 'Enter a valid number in E.164 format, e.g. +12125551234'
  return null
}

function handlePhoneBlur() {
  if (!form.value.phone) { phoneError.value = ''; return }
  const normalized = normalizePhone(form.value.phone)
  if (/^\+[1-9]\d{6,14}$/.test(normalized)) {
    form.value.phone = normalized
    phoneError.value = ''
  } else {
    phoneError.value = validatePhone(form.value.phone) ?? ''
  }
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

onMounted(async () => {
  const userId = auth.user?.userId
  if (!userId) return
  try {
    const { data } = await userService.getProfile(userId)
    profile.value = data
    form.value = {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      phone: data.phone ?? '',
      dateOfBirth: toDateInputValue(data.dateOfBirth),
      governmentId: data.governmentId ?? '',
      smsOptIn: data.smsOptIn ?? false,
    }
  } catch (err) {
    loadError.value = getApiError(err, 'Failed to load profile.')
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  saveError.value = ''
  saveSuccess.value = ''
  phoneError.value = ''

  if (form.value.phone) {
    const normalized = normalizePhone(form.value.phone)
    const phErr = validatePhone(normalized)
    if (phErr) { phoneError.value = phErr; return }
    form.value.phone = normalized
  }

  const userId = auth.user?.userId
  if (!userId) return

  saving.value = true
  try {
    const payload: UpdateUserProfileRequest = {
      firstName: form.value.firstName || undefined,
      lastName: form.value.lastName || undefined,
      phone: form.value.phone || undefined,
      dateOfBirth: form.value.dateOfBirth ? `${form.value.dateOfBirth}T00:00:00Z` : null,
      governmentId: form.value.governmentId || undefined,
      smsOptIn: form.value.smsOptIn,
    }
    const { data } = await userService.updateProfile(userId, payload)
    if (data.success) {
      saveSuccess.value = 'Profile updated successfully.'
      // keep local user email display in sync if name changed in store
      if (form.value.firstName || form.value.lastName) {
        auth.updateDisplayName(form.value.firstName ?? '', form.value.lastName ?? '')
      }
    } else {
      saveError.value = data.message || 'Update failed. Please try again.'
    }
  } catch (err) {
    saveError.value = getApiError(err, 'An unexpected error occurred. Please try again.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="msa-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">

          <h1 class="msa-page-title mb-1">My Profile</h1>
          <p class="msa-page-sub mb-4">Update your personal information below. Email changes require a separate verification process.</p>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-navy" role="status">
              <span class="visually-hidden">Loading…</span>
            </div>
          </div>

          <!-- Load error -->
          <div v-else-if="loadError" class="alert alert-danger" role="alert">{{ loadError }}</div>

          <!-- Form -->
          <div v-else class="msa-card">

            <div v-if="saveSuccess" class="alert alert-success" role="alert">{{ saveSuccess }}</div>
            <div v-if="saveError" class="alert alert-danger" role="alert">{{ saveError }}</div>

            <!-- Read-only info -->
            <div class="msa-section-label">Account Information</div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" :value="profile?.email" disabled />
                <div class="msa-field-hint mt-1">Email changes require identity verification.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label">Role</label>
                <input type="text" class="form-control text-capitalize" :value="profile?.role" disabled />
              </div>
              <div class="col-md-3">
                <label class="form-label">Member Since</label>
                <input type="text" class="form-control" :value="profile?.signupDate ? new Date(profile.signupDate).toLocaleDateString() : '—'" disabled />
              </div>
            </div>

            <hr class="msa-divider" />

            <!-- Editable fields -->
            <form novalidate @submit.prevent="handleSubmit">
              <div class="msa-section-label">Personal Details</div>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input id="firstName" v-model="form.firstName" type="text" class="form-control" autocomplete="given-name" />
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input id="lastName" v-model="form.lastName" type="text" class="form-control" autocomplete="family-name" />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="phone" class="form-label">Mobile Phone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    :class="['form-control', phoneError ? 'is-invalid' : '']"
                    autocomplete="tel"
                    placeholder="+1 (555) 000-0000"
                    @blur="handlePhoneBlur"
                  />
                  <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
                  <div v-else class="msa-field-hint mt-1">E.164 format, e.g. +12125551234</div>
                </div>
                <div class="col-md-6">
                  <label for="dateOfBirth" class="form-label">Date of Birth</label>
                  <input id="dateOfBirth" v-model="form.dateOfBirth" type="date" class="form-control" />
                </div>
              </div>

              <div class="mb-4">
                <label for="governmentId" class="form-label">
                  Government ID
                  <span class="msa-label-hint">— stored masked, e.g. SSN</span>
                </label>
                <input id="governmentId" v-model="form.governmentId" type="text" class="form-control" autocomplete="off" placeholder="e.g. 123-45-6789" />
              </div>

              <div class="mb-4">
                <div class="form-check">
                  <input id="smsOptIn" v-model="form.smsOptIn" class="form-check-input" type="checkbox" />
                  <label class="form-check-label msa-check-label" for="smsOptIn">
                    Receive SMS notifications when there are messages or updates for you in the portal
                  </label>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary-msa" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ saving ? 'Saving…' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msa-page {
  background-color: var(--msa-light-gray);
  min-height: calc(100vh - 130px);
}

.msa-page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.msa-page-sub {
  color: #6b7a8d;
  font-size: 0.9rem;
}

.msa-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  padding: 2rem;
}

.msa-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--msa-gold);
  margin-bottom: 1rem;
}

.msa-divider {
  border-color: #dde3ec;
  margin: 1.5rem 0;
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
  font-size: 0.9rem;
}

.form-control:focus {
  border-color: var(--msa-navy);
  box-shadow: 0 0 0 0.2rem rgba(27, 42, 74, 0.15);
}

.form-control:disabled {
  background-color: #f8f9fb;
  color: #6b7a8d;
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
  font-size: 0.875rem;
  color: #4a5568;
}

.btn-primary-msa {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
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
</style>
