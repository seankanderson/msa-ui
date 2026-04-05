<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import userService, { type AuditLogEntry } from '@/services/userService'
import { getApiError } from '@/services/api'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.userId as string)
const userName = ref('')

const entries = ref<AuditLogEntry[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref('')

const PAGE_SIZE = 20
const currentPage = ref(1)
const eventTypeFilter = ref('')

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))
const skip = computed(() => (currentPage.value - 1) * PAGE_SIZE)

async function loadLogs() {
  error.value = ''
  loading.value = true
  try {
    const params: { eventType?: string; skip: number; take: number; sort: 'asc' | 'desc' } = {
      skip: skip.value,
      take: PAGE_SIZE,
      sort: 'desc',
    }
    if (eventTypeFilter.value) params.eventType = eventTypeFilter.value
    const { data } = await userService.getUserAuditLogs(userId.value, params)
    entries.value = data.items
    total.value = data.total
  } catch (err) {
    error.value = getApiError(err, 'Failed to load audit logs.')
  } finally {
    loading.value = false
  }
}

async function loadUserName() {
  try {
    const { data } = await userService.getProfile(userId.value)
    userName.value = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email
  } catch {
    userName.value = userId.value
  }
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatEventType(et: string): string {
  return et.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusBadgeClass(code: number | null): string {
  if (code === null) return 'badge bg-secondary'
  if (code < 300) return 'badge bg-success'
  if (code < 400) return 'badge bg-info text-dark'
  if (code < 500) return 'badge bg-warning text-dark'
  return 'badge bg-danger'
}

const expandedRowId = ref<string | null>(null)
const resolvedUsers = ref<Map<string, string>>(new Map())
const resolvingUsers = ref<Set<string>>(new Set())

async function resolveUser(uid: string) {
  if (resolvedUsers.value.has(uid) || resolvingUsers.value.has(uid)) return
  resolvingUsers.value = new Set(resolvedUsers.value.keys()).add(uid)
  try {
    const { data } = await userService.getProfile(uid)
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email
    resolvedUsers.value = new Map(resolvedUsers.value).set(uid, name)
  } catch {
    resolvedUsers.value = new Map(resolvedUsers.value).set(uid, uid)
  } finally {
    const next = new Set(resolvingUsers.value)
    next.delete(uid)
    resolvingUsers.value = next
  }
}

function toggleRow(entryId: string, performedByUserId: string) {
  if (expandedRowId.value === entryId) {
    expandedRowId.value = null
  } else {
    expandedRowId.value = entryId
    resolveUser(performedByUserId)
  }
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details || Object.keys(details).length === 0) return ''
  return JSON.stringify(details, null, 2)
}

function applyFilter() {
  currentPage.value = 1
  loadLogs()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadLogs()
}

onMounted(() => {
  loadUserName()
  loadLogs()
})
</script>

<template>
  <div class="msa-page py-4">
    <div class="container-fluid px-4">

      <!-- Header -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <RouterLink :to="{ path: '/admin/users', query: { selected: userId } }" class="btn btn-outline-secondary btn-sm">
          ← Back to Users
        </RouterLink>
        <div>
          <h1 class="msa-page-title mb-0">Audit Log</h1>
          <div v-if="userName" class="msa-page-subtitle text-muted">{{ userName }}</div>
        </div>
      </div>

      <!-- Filter row -->
      <div class="card msa-card mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label mb-1 small">Filter by Event Type</label>
              <input
                v-model="eventTypeFilter"
                type="text"
                class="form-control form-control-sm"
                placeholder="e.g. profile_updated"
                @keyup.enter="applyFilter"
              />
            </div>
            <div class="col-auto">
              <button class="btn btn-primary-msa btn-sm" @click="applyFilter">Apply</button>
              <button
                v-if="eventTypeFilter"
                class="btn btn-link btn-sm text-muted ms-1"
                @click="eventTypeFilter = ''; applyFilter()"
              >Clear</button>
            </div>
            <div class="col-auto ms-auto text-muted small align-self-end">
              <span v-if="!loading">{{ total }} total record{{ total !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

      <!-- Table -->
      <div class="card msa-card">
        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-5 text-muted">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading…
          </div>
          <div v-else-if="entries.length === 0" class="text-center py-5 text-muted">
            No audit log entries found.
          </div>
          <div v-else class="table-responsive">
            <table class="table msa-audit-table mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Performed By</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th style="width: 2rem"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="entry in entries" :key="entry.id">
                  <tr
                    class="msa-audit-row"
                    :class="{ 'msa-audit-row--expanded': expandedRowId === entry.id }"
                    @click="toggleRow(entry.id, entry.userId)"
                  >
                    <td class="text-nowrap msa-audit-ts">{{ formatTimestamp(entry.timestamp) }}</td>
                    <td>
                      <span class="msa-event-type">{{ formatEventType(entry.eventType) }}</span>
                    </td>
                    <td class="text-muted small">
                      <span v-if="entry.userId === entry.targetUserId">Self</span>
                      <span v-else>{{ entry.userId }}</span>
                    </td>
                    <td>
                      <span :class="statusBadgeClass(entry.statusCode)">
                        {{ entry.statusCode ?? '—' }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ entry.ipAddress ?? '—' }}</td>
                    <td class="msa-expand-chevron">
                      <span>{{ expandedRowId === entry.id ? '▲' : '▼' }}</span>
                    </td>
                  </tr>
                  <tr v-if="expandedRowId === entry.id" class="msa-audit-detail-row">
                    <td colspan="6" class="msa-audit-detail-cell">
                      <div class="msa-audit-detail-performed-by mb-2">
                        <span class="msa-detail-label">Performed by:</span>
                        <span v-if="resolvingUsers.has(entry.userId)" class="ms-2 text-muted small">
                          <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading…
                        </span>
                        <span v-else class="ms-2">
                          {{ resolvedUsers.get(entry.userId) ?? entry.userId }}
                        </span>
                      </div>
                      <div class="msa-audit-detail-action">{{ entry.action }}</div>
                      <pre v-if="formatDetails(entry.details)" class="msa-audit-detail-json">{{ formatDetails(entry.details) }}</pre>
                      <div v-else class="msa-audit-detail-empty">No additional details.</div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex align-items-center justify-content-between mt-3">
        <div class="text-muted small">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <nav aria-label="Audit log pagination">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="goToPage(currentPage - 1)">‹ Prev</button>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="goToPage(currentPage + 1)">Next ›</button>
            </li>
          </ul>
        </nav>
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
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.msa-page-subtitle {
  font-size: 0.9rem;
}

.msa-card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.msa-audit-table th {
  background-color: var(--msa-navy);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: none;
  padding: 0.65rem 1rem;
}

.msa-audit-table td {
  vertical-align: middle;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  border-color: #e9ecef;
}

.msa-audit-ts {
  font-size: 0.8rem;
  color: #555;
}

.msa-event-type {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--msa-navy);
}

.msa-audit-row {
  cursor: pointer;
  user-select: none;
}

.msa-audit-row:hover td {
  background-color: #eef1f6;
}

.msa-audit-row--expanded td {
  background-color: #e8ecf3;
}

.msa-expand-chevron {
  text-align: center;
  color: #888;
  font-size: 0.65rem;
}

.msa-audit-detail-row td {
  background-color: #f8f9fc !important;
  border-top: none;
}

.msa-audit-detail-cell {
  padding: 1rem 1.25rem 1.25rem !important;
}

.msa-audit-detail-performed-by {
  font-size: 0.82rem;
  color: #555;
}

.msa-detail-label {
  font-weight: 600;
  color: var(--msa-navy);
}

.msa-audit-detail-action {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.75rem;
}

.msa-audit-detail-json {
  background-color: #1e2a3a;
  color: #c9d1d9;
  font-size: 0.78rem;
  line-height: 1.5;
  padding: 0.85rem 1rem;
  border-radius: 6px;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}

.msa-audit-detail-empty {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

.pagination .page-item.active .page-link {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
}

.pagination .page-link {
  color: var(--msa-navy);
}
</style>
