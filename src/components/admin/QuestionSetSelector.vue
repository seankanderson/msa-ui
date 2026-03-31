<script setup lang="ts">
import type { InvestmentProfileQuestionsDocument, QuestionSetName } from '@/services/questionsService'

const props = defineProps<{
  names: QuestionSetName[]
  selectedName: QuestionSetName
  currentSet: InvestmentProfileQuestionsDocument | null
  draftSet: InvestmentProfileQuestionsDocument | null
  viewingVersion: 'current' | 'draft' | null
  loadingCurrent: boolean
  loadingDraft: boolean
  creating: boolean
  saving: boolean
  discarding: boolean
  publishing: boolean
  isDirty: boolean
}>()

const emit = defineEmits<{
  'select-name': [name: QuestionSetName]
  'view-current': []
  'view-draft': []
  'create-draft': []
  'save-draft': []
  'discard-draft': []
  'publish-draft': []
}>()

function formatName(name: string) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="qss">
    <!-- Name pills -->
    <div class="qss-names" role="tablist" aria-label="Question set">
      <button
        v-for="name in names"
        :key="name"
        role="tab"
        :class="['qss-name-pill', name === selectedName && 'qss-name-pill--active']"
        :aria-selected="name === selectedName"
        @click="emit('select-name', name)"
      >
        {{ formatName(name) }}
      </button>
    </div>

    <!-- Version cards -->
    <div class="qss-cards">

      <!-- Current version card -->
      <div :class="['qss-card', viewingVersion === 'current' && 'qss-card--active']">
        <div class="qss-card-header">
          <span class="qss-card-label">Current Version</span>
          <span v-if="currentSet" class="status-badge status-current">current</span>
        </div>

        <div class="qss-card-body">
          <div v-if="loadingCurrent" class="qss-loading">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading…
          </div>
          <template v-else-if="currentSet">
            <div class="qss-meta-grid">
              <div class="qss-meta-item">
                <span class="qss-meta-label">Published</span>
                <span class="qss-meta-value">{{ fmtDate(currentSet.publishedDate) }}</span>
              </div>
              <div class="qss-meta-item">
                <span class="qss-meta-label">By</span>
                <span class="qss-meta-value">{{ currentSet.publishedBy || '—' }}</span>
              </div>
              <div class="qss-meta-item">
                <span class="qss-meta-label">Questions</span>
                <span class="qss-meta-value">{{ currentSet.questions.length }}</span>
              </div>
              <div class="qss-meta-item">
                <span class="qss-meta-label">Last Modified</span>
                <span class="qss-meta-value">{{ fmtDate(currentSet.lastModifiedDate) }}</span>
              </div>
            </div>
          </template>
          <div v-else class="qss-empty">No current version found.</div>
        </div>

        <div class="qss-card-footer">
          <button
            class="btn btn-sm"
            :class="viewingVersion === 'current' ? 'btn-navy' : 'btn-outline-navy'"
            :disabled="!currentSet || loadingCurrent"
            @click="emit('view-current')"
          >
            {{ viewingVersion === 'current' ? 'Viewing' : 'View Current' }}
          </button>
        </div>
      </div>

      <!-- Draft version card -->
      <div :class="['qss-card', viewingVersion === 'draft' && 'qss-card--active']">
        <div class="qss-card-header">
          <span class="qss-card-label">Draft Version</span>
          <span v-if="draftSet" class="status-badge status-draft">draft</span>
          <span v-else-if="!loadingDraft" class="status-badge status-none">none</span>
        </div>

        <div class="qss-card-body">
          <div v-if="loadingDraft" class="qss-loading">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Loading…
          </div>
          <template v-else-if="draftSet">
            <div class="qss-meta-grid">
              <div class="qss-meta-item">
                <span class="qss-meta-label">Last Modified</span>
                <span class="qss-meta-value">{{ fmtDate(draftSet.lastModifiedDate) }}</span>
              </div>
              <div class="qss-meta-item">
                <span class="qss-meta-label">By</span>
                <span class="qss-meta-value">{{ draftSet.lastModifiedBy || '—' }}</span>
              </div>
              <div class="qss-meta-item">
                <span class="qss-meta-label">Questions</span>
                <span class="qss-meta-value">{{ draftSet.questions.length }}</span>
              </div>
              <div v-if="viewingVersion === 'draft' && isDirty" class="qss-meta-item">
                <span class="unsaved-badge">Unsaved changes</span>
              </div>
            </div>
          </template>
          <div v-else class="qss-empty">No draft exists. Create one from the current version to start editing.</div>
        </div>

        <div class="qss-card-footer">
          <!-- No draft: Create button -->
          <template v-if="!draftSet">
            <button
              class="btn btn-sm btn-outline-navy"
              :disabled="!currentSet || creating || loadingDraft"
              @click="emit('create-draft')"
            >
              <span v-if="creating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ creating ? 'Creating…' : 'Create Draft' }}
            </button>
          </template>

          <!-- Draft exists: View + lifecycle actions -->
          <template v-else>
            <button
              class="btn btn-sm"
              :class="viewingVersion === 'draft' ? 'btn-navy' : 'btn-outline-navy'"
              :disabled="loadingDraft"
              @click="emit('view-draft')"
            >
              {{ viewingVersion === 'draft' ? 'Viewing' : 'View Draft' }}
            </button>

            <button
              v-if="viewingVersion === 'draft'"
              class="btn btn-sm btn-outline-secondary"
              :disabled="!isDirty || saving"
              @click="emit('save-draft')"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ saving ? 'Saving…' : 'Save Draft' }}
            </button>

            <button
              class="btn btn-sm btn-success"
              :disabled="isDirty || publishing"
              :title="isDirty ? 'Save the draft before publishing' : ''"
              @click="emit('publish-draft')"
            >
              <span v-if="publishing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ publishing ? 'Publishing…' : 'Publish' }}
            </button>

            <button
              class="btn btn-sm btn-outline-danger"
              :disabled="discarding"
              @click="emit('discard-draft')"
            >
              {{ discarding ? 'Discarding…' : 'Discard' }}
            </button>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.qss {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  overflow: hidden;
}

/* Name pills */
.qss-names {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #edf0f4;
  background: #f8f9fb;
}

.qss-name-pill {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1px solid #cdd3dc;
  background: #fff;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.15s;
}
.qss-name-pill:hover { border-color: var(--msa-navy); color: var(--msa-navy); }
.qss-name-pill--active {
  background: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
}

/* Cards row */
.qss-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 640px) {
  .qss-cards { grid-template-columns: 1fr; }
}

.qss-card {
  padding: 1rem;
  border-right: 1px solid #edf0f4;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: background 0.15s;
}
.qss-card:last-child { border-right: none; }
.qss-card--active { background: #f0f4ff; }

.qss-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

.qss-card-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--msa-navy);
}

.status-badge {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0.17rem 0.42rem;
  border-radius: 2px;
}
.status-current  { background: #d1fae5; color: #065f46; }
.status-draft    { background: #fef3c7; color: #92400e; }
.status-none     { background: #f3f4f6; color: #9ca3af; }
.status-archived { background: #f3f4f6; color: #6b7280; }

.qss-card-body { flex: 1; min-height: 72px; }

.qss-loading {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
  color: #9ca3af;
  padding: 0.5rem 0;
}

.qss-empty {
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
  padding: 0.25rem 0;
  line-height: 1.5;
}

.qss-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem 1rem;
}

.qss-meta-item { display: flex; flex-direction: column; }

.qss-meta-label {
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--msa-gold);
}

.qss-meta-value { font-size: 0.8rem; color: #374151; }

.unsaved-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  padding: 0.15rem 0.4rem;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  align-self: flex-start;
  margin-top: 0.2rem;
}

.qss-card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid #edf0f4;
}

.btn-navy {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
  color: #fff;
  font-weight: 600;
}
.btn-navy:hover:not(:disabled) { background: #142038; border-color: #142038; color: #fff; }

.btn-outline-navy {
  border-color: var(--msa-navy);
  color: var(--msa-navy);
  background: transparent;
}
.btn-outline-navy:hover:not(:disabled) { background: var(--msa-navy); color: #fff; }
</style>
