<script setup lang="ts">
import type { InvestmentProfileQuestionsDocument } from '@/services/questionsService'

defineProps<{
  set: InvestmentProfileQuestionsDocument
  mode: 'view-current' | 'edit-draft'
  hasDraft: boolean
  isDirty: boolean
  saving: boolean
  publishing: boolean
  discarding: boolean
}>()

const emit = defineEmits<{
  'create-draft': []
  'edit-draft': []
  'save-draft': []
  'discard-draft': []
  'publish-draft': []
}>()

function fmt(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div class="meta-card">
    <div class="meta-card-header">
      <div class="d-flex align-items-center gap-2 mb-1">
        <span :class="['status-badge', `status-${set.status}`]">{{ set.status }}</span>
        <span class="meta-name">{{ set.name }}</span>
      </div>
      <p v-if="set.description" class="meta-desc mb-0">{{ set.description }}</p>
    </div>

    <div class="meta-card-body">
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Published</span>
          <span class="meta-value">{{ fmt(set.publishedDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Published By</span>
          <span class="meta-value">{{ set.publishedBy || '—' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Last Modified</span>
          <span class="meta-value">{{ fmt(set.lastModifiedDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Last Modified By</span>
          <span class="meta-value">{{ set.lastModifiedBy || '—' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Questions</span>
          <span class="meta-value">{{ set.questions.length }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Set ID</span>
          <span class="meta-value meta-id">{{ set.id }}</span>
        </div>
      </div>
    </div>

    <div class="meta-card-actions">
      <template v-if="mode === 'view-current'">
        <button
          v-if="!hasDraft"
          class="btn btn-primary-msa btn-sm"
          :disabled="saving"
          @click="emit('create-draft')"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          {{ saving ? 'Creating…' : 'Create Draft' }}
        </button>
        <button v-else class="btn btn-outline-navy btn-sm" @click="emit('edit-draft')">
          Edit Existing Draft
        </button>
      </template>

      <template v-else>
        <button
          class="btn btn-primary-msa btn-sm"
          :disabled="!isDirty || saving"
          @click="emit('save-draft')"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          {{ saving ? 'Saving…' : 'Save Draft' }}
        </button>
        <button
          class="btn btn-success btn-sm"
          :disabled="isDirty || publishing"
          :title="isDirty ? 'Save the draft before publishing' : ''"
          @click="emit('publish-draft')"
        >
          <span v-if="publishing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          {{ publishing ? 'Publishing…' : 'Publish' }}
        </button>
        <button
          class="btn btn-outline-danger btn-sm"
          :disabled="discarding"
          @click="emit('discard-draft')"
        >
          {{ discarding ? 'Discarding…' : 'Discard Draft' }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.meta-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  overflow: hidden;
}

.meta-card-header {
  padding: 0.875rem 1.5rem 0.75rem;
  border-bottom: 1px solid #f0f2f5;
}

.meta-card-body {
  padding: 0.75rem 1.5rem;
}

.meta-card-actions {
  padding: 0.75rem 1.5rem;
  background: #f8f9fb;
  border-top: 1px solid #edf0f4;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
  font-family: 'Consolas', monospace;
}

.meta-desc {
  font-size: 0.875rem;
  color: #6b7a8d;
  margin-top: 0.25rem;
}

.status-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
}
.status-current  { background: #d1fae5; color: #065f46; }
.status-draft    { background: #fef3c7; color: #92400e; }
.status-archived { background: #f3f4f6; color: #6b7280; }

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem 1.5rem;
}
@media (max-width: 768px) {
  .meta-grid { grid-template-columns: repeat(2, 1fr); }
}

.meta-item { display: flex; flex-direction: column; }

.meta-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--msa-gold);
}

.meta-value { font-size: 0.82rem; color: #374151; }

.meta-id {
  font-family: 'Consolas', monospace;
  font-size: 0.72rem;
  color: #6b7a8d;
  word-break: break-all;
}

.btn-primary-msa {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-weight: 600;
}
.btn-primary-msa:hover:not(:disabled) { background-color: #142038; border-color: #142038; color: #fff; }
.btn-primary-msa:disabled { opacity: 0.65; }

.btn-outline-navy {
  border-color: var(--msa-navy);
  color: var(--msa-navy);
  background: transparent;
}
.btn-outline-navy:hover { background: var(--msa-navy); color: #fff; }
</style>
