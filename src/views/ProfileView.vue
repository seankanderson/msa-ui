<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { getApiError } from '@/services/api'
import type { UserProfile, UserAddress, AssignedAdvisorInfo, UpdateUserProfileRequest } from '@/services/userService'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const saveError = ref('')
const saveSuccess = ref('')
const profile = ref<UserProfile | null>(null)

const E164 = /^\+[1-9]\d{6,14}$/

function normalizePhone(value: string): string {
  const digits = value.replace(/[\s().+-]/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (value.startsWith('+')) return `+${digits.replace(/\D/g, '')}`
  return `+${digits}`
}

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

function maskGovernmentId(value: string): string {
  const digits = value.replace(/[^a-zA-Z0-9]/g, '')
  const visibleCount = Math.min(4, digits.length)
  const masked = '•'.repeat(digits.length - visibleCount) + digits.slice(-visibleCount)
  let result = ''
  let maskedIdx = 0
  for (const char of value) {
    if (/[a-zA-Z0-9]/.test(char)) {
      result += masked[maskedIdx++]
    } else {
      result += char
    }
  }
  return result
}

const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z
        .string()
        .refine((v) => !v || E164.test(v), 'Enter a valid E.164 number, e.g. +12125551234'),
      dateOfBirth: z.string(),
      governmentId: z.string(),
      smsOptIn: z.boolean(),
      address: z.object({
        street: z.string(),
        street2: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
      }),
    }),
  ),
  initialValues: {
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    governmentId: '',
    smsOptIn: false,
    address: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  },
})

const { value: firstName } = useField<string>('firstName')
const { value: lastName } = useField<string>('lastName')
const { value: phone, errorMessage: phoneError, handleChange: setPhone } = useField<string>('phone')
const { value: dateOfBirth } = useField<string>('dateOfBirth')
const { value: governmentId } = useField<string>('governmentId')
const { value: smsOptIn } = useField<boolean>('smsOptIn')

const { value: addressStreet } = useField<string>('address.street')
const { value: addressStreet2 } = useField<string>('address.street2')
const { value: addressCity } = useField<string>('address.city')
const { value: addressState } = useField<string>('address.state')
const { value: addressPostalCode } = useField<string>('address.postalCode')
const { value: addressCountry } = useField<string>('address.country')

function handlePhoneBlur() {
  if (!phone.value) return
  const normalized = normalizePhone(phone.value)
  if (E164.test(normalized)) {
    setPhone(normalized)
  }
}

async function loadProfile(userId: string) {
  try {
    const { data } = await userService.getProfile(userId)
    profile.value = data
    auth.setUserRole(data.role)
    resetForm({
      values: {
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        dateOfBirth: toDateInputValue(data.dateOfBirth),
        governmentId: '', // not pre-filled — masked client-side in placeholder
        smsOptIn: data.smsOptIn ?? false,
        address: {
          street: data.address?.street ?? '',
          street2: data.address?.street2 ?? '',
          city: data.address?.city ?? '',
          state: data.address?.state ?? '',
          postalCode: data.address?.postalCode ?? '',
          country: data.address?.country ?? '',
        },
      },
    })
  } catch (err) {
    loadError.value = getApiError(err, 'Failed to load profile.')
  }
}

onMounted(async () => {
  const userId = auth.user?.userId
  if (!userId) return
  try {
    await loadProfile(userId)
  } finally {
    loading.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  saveError.value = ''
  saveSuccess.value = ''

  const userId = auth.user?.userId
  if (!userId) return

  saving.value = true
  try {
    const payload: UpdateUserProfileRequest = {
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      phone: values.phone || undefined,
      dateOfBirth: values.dateOfBirth ? `${values.dateOfBirth}T00:00:00Z` : null,
      governmentId: values.governmentId || undefined,
      smsOptIn: values.smsOptIn,
      address: {
        street: values.address.street || undefined,
        street2: values.address.street2 || undefined,
        city: values.address.city || undefined,
        state: values.address.state || undefined,
        postalCode: values.address.postalCode || undefined,
        country: values.address.country || undefined,
      } as UserAddress,
    }
    const { data } = await userService.updateProfile(userId, payload)
    if (data.success) {
      await loadProfile(userId)
      saveSuccess.value = 'Profile updated successfully.'
      if (values.firstName || values.lastName) {
        auth.updateDisplayName(values.firstName ?? '', values.lastName ?? '')
      }
    } else {
      saveError.value = data.message || 'Update failed. Please try again.'
    }
  } catch (err) {
    saveError.value = getApiError(err, 'An unexpected error occurred. Please try again.')
  } finally {
    saving.value = false
  }
})
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
              <div v-if="profile?.role === 'advisor' || profile?.role === 'supervisor'" class="col-md-4">
                <label class="form-label">CRD Number</label>
                <input type="text" class="form-control" :value="profile?.crdNumber ?? '—'" disabled />
                <div class="msa-field-hint mt-1">FINRA CRD number. Contact a supervisor to update.</div>
              </div>
            </div>

            <!-- Assigned Advisor (read-only, client/associate only) -->
            <template v-if="profile?.assignedAdvisor">
              <hr class="msa-divider" />
              <div class="msa-section-label">Assigned Advisor</div>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label">Advisor Name</label>
                  <input type="text" class="form-control" :value="[profile.assignedAdvisor.firstName, profile.assignedAdvisor.lastName].filter(Boolean).join(' ') || '—'" disabled />
                </div>
                <div class="col-md-3">
                  <label class="form-label">CRD Number</label>
                  <input type="text" class="form-control" :value="profile.assignedAdvisor.crdNumber ?? '—'" disabled />
                </div>
              </div>
            </template>

            <hr class="msa-divider" />

            <!-- Editable fields -->
            <form @submit="onSubmit">
              <div class="msa-section-label">Personal Details</div>
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="firstName" class="form-label">First Name</label>
                  <input id="firstName" v-model="firstName" type="text" class="form-control" autocomplete="given-name" />
                </div>
                <div class="col-md-6">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input id="lastName" v-model="lastName" type="text" class="form-control" autocomplete="family-name" />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="phone" class="form-label">Mobile Phone</label>
                  <input
                    id="phone"
                    v-model="phone"
                    type="tel"
                    :class="['form-control', phoneError ? 'is-invalid' : '']"
                    autocomplete="tel"
                    placeholder="+1 (555) 000-0000"
                    @blur="handlePhoneBlur"
                  />
                  <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
                  <div v-else class="msa-field-hint mt-1">E.164 format, e.g. +12125551234</div>
                  <div class="form-check mt-2">
                    <input id="smsOptIn" v-model="smsOptIn" class="form-check-input" type="checkbox" />
                    <label class="form-check-label msa-check-label" for="smsOptIn">
                      Receive SMS notifications when there are messages or updates for you in the portal
                    </label>
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="dateOfBirth" class="form-label">Date of Birth</label>
                  <input id="dateOfBirth" v-model="dateOfBirth" type="date" class="form-control" />
                </div>
              </div>

              <div class="mb-4">
                <label for="governmentId" class="form-label">Government ID</label>
                <input id="governmentId" v-model="governmentId" type="text" class="form-control" autocomplete="off" :placeholder="profile?.governmentId ? `Current: ${maskGovernmentId(profile.governmentId)} — enter new value to replace` : 'e.g. 123-45-6789'" />
                <div class="msa-field-hint mt-1">Leave blank to keep your existing Government ID on file.</div>
              </div>

              <hr class="msa-divider" />

              <div class="msa-section-label">Address</div>
              <div class="mb-3">
                <label for="addressStreet" class="form-label">Street Address</label>
                <input id="addressStreet" v-model="addressStreet" type="text" class="form-control" autocomplete="address-line1" placeholder="123 Main St" />
              </div>

              <div class="mb-3">
                <label for="addressStreet2" class="form-label">Apt, Suite, Unit <span class="text-muted">(optional)</span></label>
                <input id="addressStreet2" v-model="addressStreet2" type="text" class="form-control msa-placeholder-light" autocomplete="address-line2" placeholder="Apt 4B" />
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-5">
                  <label for="addressCity" class="form-label">City</label>
                  <input id="addressCity" v-model="addressCity" type="text" class="form-control" autocomplete="address-level2" />
                </div>
                <div class="col-md-3">
                  <label for="addressState" class="form-label">State</label>
                  <input id="addressState" v-model="addressState" type="text" class="form-control" autocomplete="address-level1" placeholder="IL" maxlength="2" />
                </div>
                <div class="col-md-4">
                  <label for="addressPostalCode" class="form-label">Postal Code</label>
                  <input id="addressPostalCode" v-model="addressPostalCode" type="text" class="form-control" autocomplete="postal-code" placeholder="62701" />
                </div>
              </div>

              <div class="mb-4">
                <label for="addressCountry" class="form-label">Country</label>
                <input id="addressCountry" v-model="addressCountry" type="text" class="form-control" autocomplete="country" placeholder="US" maxlength="2" />
                <div class="msa-field-hint mt-1">2-letter country code, e.g. US, CA, GB</div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary-msa" :disabled="!meta.dirty || saving">
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

.msa-placeholder-light::placeholder {
  color: #b0bac6;
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
