<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import userService from '@/services/userService'
import { getApiError } from '@/services/api'
import type { UserProfile, UserListItem, UpdateUserProfileRequest, UserAddress } from '@/services/userService'

const auth = useAuthStore()
const router = useRouter()

// --- List state ---
const listLoading = ref(true)
const listError = ref('')
const users = ref<UserListItem[]>([])
const searchQuery = ref('')
const roleFilter = ref('all')

// --- Selected user state ---
const selectedUserId = ref<string | null>(null)
const profileLoading = ref(false)
const profileError = ref('')
const profile = ref<UserProfile | null>(null)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')
const statusSaving = ref(false)

// --- Change password state ---
const showPasswordForm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordSaving = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 128) return 'Password must be no more than 128 characters.'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!/[!@#$%^&*()_+\-=\[\]{};':",./<>?\\|`~]/.test(password)) return 'Password must contain at least one special character.'
  return null
}

async function submitPasswordChange() {
  passwordError.value = ''
  passwordSuccess.value = ''
  const pwErr = validatePassword(newPassword.value)
  if (pwErr) {
    passwordError.value = pwErr
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  passwordSaving.value = true
  try {
    const { data } = await userService.changePassword(selectedUserId.value!, newPassword.value)
    if (data.success) {
      passwordSuccess.value = 'Password changed successfully.'
      newPassword.value = ''
      confirmPassword.value = ''
      showPasswordForm.value = false
    } else {
      passwordError.value = data.message || 'Password change failed.'
    }
  } catch (err) {
    passwordError.value = getApiError(err, 'An unexpected error occurred.')
  } finally {
    passwordSaving.value = false
  }
}

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

// --- Form ---
const { handleSubmit, resetForm, meta } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string().refine((v) => !v || E164.test(v), 'Enter a valid E.164 number, e.g. +12125551234'),
      dateOfBirth: z.string(),
      governmentId: z.string(),
      smsOptIn: z.boolean(),
      role: z.string(),
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
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
    governmentId: '', smsOptIn: false, role: '',
    address: { street: '', street2: '', city: '', state: '', postalCode: '', country: '' },
  },
})

const { value: firstName } = useField<string>('firstName')
const { value: lastName } = useField<string>('lastName')
const { value: phone, errorMessage: phoneError, handleChange: setPhone } = useField<string>('phone')
const { value: dateOfBirth } = useField<string>('dateOfBirth')
const { value: governmentId } = useField<string>('governmentId')
const { value: smsOptIn } = useField<boolean>('smsOptIn')
const { value: role } = useField<string>('role')
const { value: addressStreet } = useField<string>('address.street')
const { value: addressStreet2 } = useField<string>('address.street2')
const { value: addressCity } = useField<string>('address.city')
const { value: addressState } = useField<string>('address.state')
const { value: addressPostalCode } = useField<string>('address.postalCode')
const { value: addressCountry } = useField<string>('address.country')

function handlePhoneBlur() {
  if (!phone.value) return
  const normalized = normalizePhone(phone.value)
  if (E164.test(normalized)) setPhone(normalized)
}

// --- Load list ---
async function loadUsers() {
  listLoading.value = true
  listError.value = ''
  try {
    const { data } = await userService.listUsers({ take: 100 })
    users.value = data.users
  } catch (err) {
    listError.value = getApiError(err, 'Failed to load users.')
  } finally {
    listLoading.value = false
  }
}

// --- Select user ---
async function selectUser(userId: string) {
  if (selectedUserId.value === userId) return
  selectedUserId.value = userId
  profile.value = null
  profileError.value = ''
  saveError.value = ''
  saveSuccess.value = ''
  showPasswordForm.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  passwordSuccess.value = ''
  profileLoading.value = true
  try {
    const { data } = await userService.getProfile(userId)
    profile.value = data
    resetForm({
      values: {
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        dateOfBirth: toDateInputValue(data.dateOfBirth),
        governmentId: data.governmentId ?? '',
        smsOptIn: data.smsOptIn ?? false,
        role: data.role ?? '',
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
    profileError.value = getApiError(err, 'Failed to load user profile.')
  } finally {
    profileLoading.value = false
  }
}

// --- Save profile ---
const onSubmit = handleSubmit(async (values) => {
  if (!selectedUserId.value) return
  saveError.value = ''
  saveSuccess.value = ''
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
    if (auth.isSupervisor && values.role) {
      payload.role = values.role as UserProfile['role']
    }
    const { data } = await userService.updateProfile(selectedUserId.value, payload)
    if (data.success) {
      const uid = selectedUserId.value
      await selectUser(uid)
      const idx = users.value.findIndex((u) => u.userId === uid)
      if (idx >= 0) {
        const cur = users.value[idx]!
        users.value[idx] = {
          ...cur,
          firstName: values.firstName || cur.firstName,
          lastName: values.lastName || cur.lastName,
          role: (auth.isSupervisor ? values.role : cur.role) as UserListItem['role'],
        }
      }
      saveSuccess.value = 'Profile updated successfully.'
    } else {
      saveError.value = data.message || 'Update failed.'
    }
  } catch (err) {
    saveError.value = getApiError(err, 'An unexpected error occurred.')
  } finally {
    saving.value = false
  }
})

// --- Toggle status ---
async function toggleStatus() {
  if (!selectedUserId.value || !profile.value) return
  statusSaving.value = true
  saveError.value = ''
  saveSuccess.value = ''
  try {
    const newStatus = !profile.value.isEnabled
    const { data } = await userService.updateUserStatus(selectedUserId.value, newStatus)
    if (data.success) {
      profile.value = { ...profile.value, isEnabled: data.isEnabled }
      const idx = users.value.findIndex((u) => u.userId === selectedUserId.value)
      if (idx >= 0) users.value[idx] = { ...users.value[idx]!, isEnabled: data.isEnabled }
    } else {
      saveError.value = data.message || 'Status update failed.'
    }
  } catch (err) {
    saveError.value = getApiError(err, 'Failed to update user status.')
  } finally {
    statusSaving.value = false
  }
}

// --- Filtering ---
const filteredUsers = computed(() =>
  users.value.filter((u) => {
    if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
    if (!searchQuery.value) return true
    const q = searchQuery.value.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.firstName ?? '').toLowerCase().includes(q) ||
      (u.lastName ?? '').toLowerCase().includes(q)
    )
  }),
)

function displayName(user: UserListItem): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'client', label: 'Clients' },
  { value: 'advisor', label: 'Advisors' },
  { value: 'associate', label: 'Associates' },
  { value: 'supervisor', label: 'Supervisors' },
]

onMounted(loadUsers)
</script>

<template>
  <div class="msa-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-9">

          <div class="d-flex align-items-center gap-3 mb-1">
            <RouterLink to="/admin" class="msa-back-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Admin
            </RouterLink>
          </div>

          <h1 class="msa-page-title mb-1">Manage Users</h1>
          <p class="msa-page-sub mb-4">View and manage user accounts, roles, and advisor assignments.</p>

          <!-- List load error -->
          <div v-if="listError" class="alert alert-danger" role="alert">{{ listError }}</div>

          <div class="row g-4">

            <!-- ── User list panel ── -->
            <div class="col-lg-5">
              <div class="msa-card p-0 h-100">

                <!-- Search + filter -->
                <div class="list-header px-3 pt-3 pb-2">
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control form-control-sm mb-2"
                    placeholder="Search by name or email…"
                  />
                  <div class="d-flex flex-wrap gap-1">
                    <button
                      v-for="f in ROLE_FILTERS"
                      :key="f.value"
                      type="button"
                      :class="['btn btn-xs role-chip', roleFilter === f.value ? 'active' : '']"
                      @click="roleFilter = f.value"
                    >{{ f.label }}</button>
                  </div>
                </div>

                <div class="list-body">
                  <div v-if="listLoading" class="text-center py-5">
                    <div class="spinner-border spinner-border-sm text-navy" role="status">
                      <span class="visually-hidden">Loading…</span>
                    </div>
                  </div>

                  <div v-else-if="filteredUsers.length === 0" class="empty-list">
                    No users found.
                  </div>

                  <button
                    v-else
                    v-for="u in filteredUsers"
                    :key="u.userId"
                    type="button"
                    :class="['user-row', selectedUserId === u.userId ? 'selected' : '']"
                    @click="selectUser(u.userId)"
                  >
                    <!-- Role icon -->
                    <span :class="['role-icon', `role-icon--${u.role}`]">
                      <!-- supervisor: star -->
                      <svg v-if="u.role === 'supervisor'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                      </svg>
                      <!-- advisor: briefcase -->
                      <svg v-else-if="u.role === 'advisor'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
                      </svg>
                      <!-- associate: person-lines -->
                      <svg v-else-if="u.role === 'associate'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
                      </svg>
                      <!-- client: person -->
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                      </svg>
                    </span>

                    <span class="user-info">
                      <span class="user-name">{{ displayName(u) }}</span>
                      <span class="user-email">{{ u.email }}</span>
                    </span>

                    <span class="ms-auto d-flex flex-column align-items-end gap-1">
                      <span :class="['status-dot', u.isEnabled ? 'status-dot--on' : 'status-dot--off']" :title="u.isEnabled ? 'Enabled' : 'Disabled'"></span>
                    </span>
                  </button>
                </div>

              </div>
            </div>

            <!-- ── Edit panel ── -->
            <div class="col-lg-7">

              <!-- No user selected -->
              <div v-if="!selectedUserId" class="msa-card text-center py-5 h-100 d-flex flex-column justify-content-center align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="mb-3" style="color: #b0bac6" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
                <p class="mb-0" style="color: #6b7a8d; font-size: 0.9rem;">Select a user from the list to view and edit their profile.</p>
              </div>

              <!-- Profile loading -->
              <div v-else-if="profileLoading" class="msa-card text-center py-5">
                <div class="spinner-border text-navy" role="status">
                  <span class="visually-hidden">Loading…</span>
                </div>
              </div>

              <!-- Profile load error -->
              <div v-else-if="profileError" class="alert alert-danger" role="alert">{{ profileError }}</div>

              <!-- Edit form -->
              <div v-else-if="profile" class="msa-card">

                <!-- User identity + action bar -->
                <div class="mb-3">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <span class="user-detail-name">{{ displayName(users.find(u => u.userId === selectedUserId)!) }}</span>
                    <span :class="['badge', profile.isEnabled ? 'bg-success' : 'bg-secondary']">
                      {{ profile.isEnabled ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                  <div class="msa-user-actions">
                    <button
                      type="button"
                      :class="['btn btn-sm msa-action-btn', profile.isEnabled ? 'msa-action-btn--danger' : 'msa-action-btn--success']"
                      :disabled="statusSaving"
                      @click="toggleStatus"
                    >
                      <span v-if="statusSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                        <path v-if="profile.isEnabled" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path v-if="profile.isEnabled" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        <path v-else d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                      </svg>
                      {{ profile.isEnabled ? 'Disable User' : 'Enable User' }}
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm msa-action-btn"
                      @click="router.push({ name: 'user-audit-log', params: { userId: selectedUserId } })"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                        <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                      </svg>
                      Audit Log
                    </button>
                    <button
                      v-if="auth.isAdminRole"
                      type="button"
                      :class="['btn btn-sm msa-action-btn', showPasswordForm ? 'msa-action-btn--active' : '']"
                      @click="showPasswordForm = !showPasswordForm; passwordError = ''; passwordSuccess = ''"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                      </svg>
                      {{ showPasswordForm ? 'Cancel' : 'Change Password' }}
                    </button>
                  </div>
                </div>

                <!-- Change Password form (toggled from action bar) -->
                <template v-if="auth.isAdminRole && (showPasswordForm || passwordSuccess)">
                  <div class="msa-password-form mt-2">
                    <div v-if="passwordSuccess" class="alert alert-success py-2 mb-2" role="alert">{{ passwordSuccess }}</div>
                    <template v-if="showPasswordForm">
                      <div v-if="passwordError" class="alert alert-danger py-2 mb-3" role="alert">{{ passwordError }}</div>
                      <div class="mb-3">
                        <label for="mu-newPassword" class="form-label">New Password</label>
                        <input id="mu-newPassword" v-model="newPassword" type="password" class="form-control" autocomplete="new-password" placeholder="8–128 chars, upper, lower, number, special" />
                      </div>
                      <div class="mb-3">
                        <label for="mu-confirmPassword" class="form-label">Confirm Password</label>
                        <input id="mu-confirmPassword" v-model="confirmPassword" type="password" class="form-control" autocomplete="new-password" placeholder="Re-enter password" />
                      </div>
                      <button
                        type="button"
                        class="btn btn-primary-msa btn-sm"
                        :disabled="passwordSaving || !newPassword || !confirmPassword"
                        @click="submitPasswordChange"
                      >
                        <span v-if="passwordSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ passwordSaving ? 'Saving…' : 'Change Password' }}
                      </button>
                    </template>
                  </div>
                </template>

                <div v-if="saveSuccess" class="alert alert-success py-2" role="alert">{{ saveSuccess }}</div>
                <div v-if="saveError" class="alert alert-danger py-2" role="alert">{{ saveError }}</div>

                <!-- Read-only account info -->
                <div class="msa-section-label">Account Information</div>
                <div class="row g-3 mb-4">
                  <div class="col-md-7">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" :value="profile.email" disabled />
                  </div>
                  <div class="col-md-5">
                    <label class="form-label">Member Since</label>
                    <input type="text" class="form-control" :value="profile.signupDate ? new Date(profile.signupDate).toLocaleDateString() : '—'" disabled />
                  </div>
                  <div v-if="profile.crdNumber" class="col-md-5">
                    <label class="form-label">CRD Number</label>
                    <input type="text" class="form-control" :value="profile.crdNumber" disabled />
                  </div>
                </div>

                <!-- Assigned Advisor (read-only) -->
                <template v-if="profile.assignedAdvisor">
                  <hr class="msa-divider" />
                  <div class="msa-section-label">Assigned Advisor</div>
                  <div class="row g-3 mb-4">
                    <div class="col-md-7">
                      <label class="form-label">Advisor Name</label>
                      <input type="text" class="form-control" :value="[profile.assignedAdvisor.firstName, profile.assignedAdvisor.lastName].filter(Boolean).join(' ') || '—'" disabled />
                    </div>
                    <div class="col-md-5">
                      <label class="form-label">CRD Number</label>
                      <input type="text" class="form-control" :value="profile.assignedAdvisor.crdNumber ?? '—'" disabled />
                    </div>
                  </div>
                </template>

                <hr class="msa-divider" />

                <form @submit="onSubmit">
                  <!-- Role (supervisor only) -->
                  <div v-if="auth.isSupervisor" class="mb-3">
                    <div class="msa-section-label">Role</div>
                    <select v-model="role" class="form-select">
                      <option value="client">Client</option>
                      <option value="advisor">Advisor</option>
                      <option value="associate">Associate</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                  <div v-else class="mb-3">
                    <div class="msa-section-label">Role</div>
                    <input type="text" class="form-control text-capitalize" :value="profile.role" disabled />
                  </div>

                  <hr class="msa-divider" />

                  <!-- Personal Details -->
                  <div class="msa-section-label">Personal Details</div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label for="mu-firstName" class="form-label">First Name</label>
                      <input id="mu-firstName" v-model="firstName" type="text" class="form-control" autocomplete="off" />
                    </div>
                    <div class="col-md-6">
                      <label for="mu-lastName" class="form-label">Last Name</label>
                      <input id="mu-lastName" v-model="lastName" type="text" class="form-control" autocomplete="off" />
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label for="mu-phone" class="form-label">Mobile Phone</label>
                      <input
                        id="mu-phone"
                        v-model="phone"
                        type="tel"
                        :class="['form-control', phoneError ? 'is-invalid' : '']"
                        autocomplete="off"
                        placeholder="+1 (555) 000-0000"
                        @blur="handlePhoneBlur"
                      />
                      <div v-if="phoneError" class="invalid-feedback">{{ phoneError }}</div>
                      <div v-else class="msa-field-hint mt-1">E.164 format</div>
                      <div class="form-check mt-2">
                        <input id="mu-smsOptIn" v-model="smsOptIn" class="form-check-input" type="checkbox" />
                        <label class="form-check-label msa-check-label" for="mu-smsOptIn">SMS notifications</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label for="mu-dateOfBirth" class="form-label">Date of Birth</label>
                      <input id="mu-dateOfBirth" v-model="dateOfBirth" type="date" class="form-control" />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label for="mu-governmentId" class="form-label">Government ID</label>
                    <input id="mu-governmentId" v-model="governmentId" type="text" class="form-control" autocomplete="off" placeholder="e.g. 123-45-6789" />
                  </div>

                  <hr class="msa-divider" />

                  <!-- Address -->
                  <div class="msa-section-label">Address</div>
                  <div class="mb-3">
                    <label for="mu-street" class="form-label">Street Address</label>
                    <input id="mu-street" v-model="addressStreet" type="text" class="form-control" autocomplete="off" placeholder="123 Main St" />
                  </div>
                  <div class="mb-3">
                    <label for="mu-street2" class="form-label">Apt, Suite, Unit <span class="text-muted">(optional)</span></label>
                    <input id="mu-street2" v-model="addressStreet2" type="text" class="form-control msa-placeholder-light" autocomplete="off" placeholder="Apt 4B" />
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-5">
                      <label for="mu-city" class="form-label">City</label>
                      <input id="mu-city" v-model="addressCity" type="text" class="form-control" autocomplete="off" />
                    </div>
                    <div class="col-md-3">
                      <label for="mu-state" class="form-label">State</label>
                      <input id="mu-state" v-model="addressState" type="text" class="form-control" autocomplete="off" placeholder="IL" maxlength="2" />
                    </div>
                    <div class="col-md-4">
                      <label for="mu-postal" class="form-label">Postal Code</label>
                      <input id="mu-postal" v-model="addressPostalCode" type="text" class="form-control" autocomplete="off" placeholder="62701" />
                    </div>
                  </div>
                  <div class="mb-4">
                    <label for="mu-country" class="form-label">Country</label>
                    <input id="mu-country" v-model="addressCountry" type="text" class="form-control" autocomplete="off" placeholder="US" maxlength="2" />
                    <div class="msa-field-hint mt-1">2-letter country code, e.g. US, CA, GB</div>
                  </div>

                  <div class="d-flex gap-2 align-items-center">
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

.msa-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #6b7a8d;
  text-decoration: none;
}

.msa-back-link:hover {
  color: var(--msa-navy);
}

.msa-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  padding: 1.5rem;
}

.msa-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--msa-gold);
  margin-bottom: 0.75rem;
}

.msa-divider {
  border-color: #dde3ec;
  margin: 1.25rem 0;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-control, .form-select {
  border-color: #d1d9e0;
  border-radius: 3px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.form-control:focus, .form-select:focus {
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

.msa-check-label {
  font-size: 0.875rem;
  color: #4a5568;
}

.form-check-input:checked {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
}

/* User list */
.list-header {
  border-bottom: 1px solid #dde3ec;
}

.list-body {
  overflow-y: auto;
  max-height: 560px;
}

.empty-list {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid #f0f3f7;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.user-row:hover {
  background: #f5f7fb;
}

.user-row.selected {
  background: #eef1f8;
  border-left: 3px solid var(--msa-navy);
}

.role-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon--supervisor {
  background: #fef3c7;
  color: #d97706;
}

.role-icon--advisor {
  background: #dbeafe;
  color: #1d4ed8;
}

.role-icon--associate {
  background: #d1fae5;
  color: #065f46;
}

.role-icon--client {
  background: #f1f5f9;
  color: #64748b;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.78rem;
  color: #6b7a8d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot--on  { background: #22c55e; }
.status-dot--off { background: #9ca3af; }

/* Role filter chips */
.role-chip {
  font-size: 0.75rem;
  padding: 0.2rem 0.65rem;
  border: 1px solid #d1d9e0;
  border-radius: 20px;
  background: #fff;
  color: #6b7a8d;
  transition: all 0.1s;
}

.role-chip:hover {
  border-color: var(--msa-navy);
  color: var(--msa-navy);
}

.role-chip.active {
  background: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
}

/* Edit panel */
.user-detail-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--msa-navy);
}

.btn-primary-msa {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-size: 0.875rem;
}

.btn-primary-msa:hover {
  background-color: var(--msa-navy-dark, #111d36);
  border-color: var(--msa-navy-dark, #111d36);
  color: #fff;
}

.btn-primary-msa:disabled {
  opacity: 0.55;
}

.msa-password-form {
  background-color: #f8f9fb;
  border: 1px solid #dde3ec;
  border-radius: 4px;
  padding: 1.25rem;
}

/* Action bar */
.msa-user-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.6rem 0.75rem;
  background: #f4f6f9;
  border: 1px solid #dde3ec;
  border-radius: 4px;
}

.msa-action-btn {
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border: 1px solid #c8d0dc;
  background: #fff;
  color: #374151;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
}

.msa-action-btn:hover {
  background: #eef1f8;
  border-color: var(--msa-navy);
  color: var(--msa-navy);
}

.msa-action-btn--active {
  background: #e8ecf3;
  border-color: var(--msa-navy);
  color: var(--msa-navy);
}

.msa-action-btn--danger {
  border-color: #fca5a5;
  color: #b91c1c;
  background: #fff5f5;
}

.msa-action-btn--danger:hover {
  background: #fee2e2;
  border-color: #b91c1c;
  color: #b91c1c;
}

.msa-action-btn--success {
  border-color: #86efac;
  color: #15803d;
  background: #f0fdf4;
}

.msa-action-btn--success:hover {
  background: #dcfce7;
  border-color: #15803d;
  color: #15803d;
}
</style>

