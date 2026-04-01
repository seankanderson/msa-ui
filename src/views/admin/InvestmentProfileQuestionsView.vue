<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import questionsService from '@/services/questionsService'
import { getApiError } from '@/services/api'
import type { InvestmentProfileQuestionsDocument, InvestmentProfileQuestion, QuestionSetName } from '@/services/questionsService'
import QuestionSetSelector from '@/components/admin/QuestionSetSelector.vue'
import QuestionStepper from '@/components/admin/QuestionStepper.vue'
import QuestionEditor from '@/components/admin/QuestionEditor.vue'

const NAMES: QuestionSetName[] = ['basic-individual-investment-profile']

// ── State ─────────────────────────────────────────────────────────────────────
const initialLoading  = ref(true)
const selectedName    = ref<QuestionSetName>('basic-individual-investment-profile')
const viewingVersion  = ref<'current' | 'draft' | null>(null)
const currentSet      = ref<InvestmentProfileQuestionsDocument | null>(null)
const draftSet        = ref<InvestmentProfileQuestionsDocument | null>(null)
const localQuestions  = ref<InvestmentProfileQuestion[]>([])
const currentIndex    = ref(0)

const loadingCurrent  = ref(false)
const loadingDraft    = ref(false)
const creating        = ref(false)
const saving          = ref(false)
const discarding      = ref(false)
const publishing      = ref(false)

const alertSuccess    = ref('')
const alertError      = ref('')

// ── Computed ──────────────────────────────────────────────────────────────────
const isReadonly = computed(() => viewingVersion.value !== 'draft')

const isDirty = computed(() =>
  viewingVersion.value === 'draft' &&
  JSON.stringify(localQuestions.value) !== JSON.stringify(draftSet.value?.questions ?? []),
)

// ── Helpers ───────────────────────────────────────────────────────────────────
function deepCopy<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }
function clearAlerts() { alertSuccess.value = ''; alertError.value = '' }

function applyToEditor(set: InvestmentProfileQuestionsDocument) {
  localQuestions.value = deepCopy(set.questions ?? [])
  currentIndex.value = 0
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadVersions(name: QuestionSetName) {
  loadingCurrent.value = true
  loadingDraft.value = true

  const [cur, drf] = await Promise.allSettled([
    questionsService.getCurrent(name),
    questionsService.getDraft(),
  ])

  currentSet.value = cur.status === 'fulfilled' ? cur.value.data : null
  loadingCurrent.value = false

  draftSet.value = drf.status === 'fulfilled' ? drf.value.data : null
  loadingDraft.value = false
}

onMounted(async () => {
  await loadVersions(selectedName.value)
  if (currentSet.value) handleViewCurrent()
  initialLoading.value = false
})

// ── Version switching ─────────────────────────────────────────────────────────
function handleViewCurrent() {
  if (!currentSet.value) return
  viewingVersion.value = 'current'
  applyToEditor(currentSet.value)
}

function handleViewDraft() {
  if (!draftSet.value) return
  viewingVersion.value = 'draft'
  applyToEditor(draftSet.value)
}

async function handleSelectName(name: QuestionSetName) {
  clearAlerts()
  selectedName.value = name
  viewingVersion.value = null
  localQuestions.value = []
  await loadVersions(name)
  if (currentSet.value) handleViewCurrent()
}

// ── Draft lifecycle ───────────────────────────────────────────────────────────
async function handleCreateDraft() {
  clearAlerts()
  creating.value = true
  try {
    await questionsService.startDraft(selectedName.value, true)
    const { data } = await questionsService.getDraft()
    draftSet.value = data
    viewingVersion.value = 'draft'
    localQuestions.value = deepCopy(data.questions ?? [])
    currentIndex.value = 0
    alertSuccess.value = 'Draft created with questions copied from the current version.'
  } catch (err) {
    alertError.value = getApiError(err, 'Failed to create draft.')
  } finally {
    creating.value = false
  }
}

async function handleSaveDraft() {
  clearAlerts()
  saving.value = true
  try {
    await questionsService.updateDraft({
      description: draftSet.value?.description,
      questions: localQuestions.value,
    })
    // PUT returns a success summary, not the full document — sync draftSet from local state
    draftSet.value = { ...draftSet.value!, questions: deepCopy(localQuestions.value) }
    alertSuccess.value = 'Draft saved.'
  } catch (err) {
    alertError.value = getApiError(err, 'Failed to save draft.')
  } finally {
    saving.value = false
  }
}

async function handleDiscardDraft() {
  if (!confirm('Discard this draft? This cannot be undone.')) return
  clearAlerts()
  discarding.value = true
  try {
    await questionsService.discardDraft()
    draftSet.value = null
    if (viewingVersion.value === 'draft') handleViewCurrent()
    alertSuccess.value = 'Draft discarded.'
  } catch (err) {
    alertError.value = getApiError(err, 'Failed to discard draft.')
  } finally {
    discarding.value = false
  }
}

async function handlePublishDraft() {
  if (isDirty.value && !confirm('You have unsaved changes. Publish the saved draft (without your current edits)?')) return
  if (!isDirty.value && !confirm('Publish this draft? It will become the active question set immediately.')) return
  clearAlerts()
  publishing.value = true
  try {
    await questionsService.publishDraft()
    const { data } = await questionsService.getCurrent(selectedName.value)
    currentSet.value = data
    draftSet.value = null
    handleViewCurrent()
    alertSuccess.value = 'Draft published successfully.'
  } catch (err) {
    alertError.value = getApiError(err, 'Failed to publish draft.')
  } finally {
    publishing.value = false
  }
}

// ── Editor update ─────────────────────────────────────────────────────────────
function updateQuestion(updated: InvestmentProfileQuestion) {
  localQuestions.value[currentIndex.value] = updated
}

function handleAddQuestion() {
  const newQ: InvestmentProfileQuestion = {
    id: `question_${Date.now()}`,
    title: 'New Question',
    content: '',
    type: 'freeform',
    isRequired: false,
    displayOrder: localQuestions.value.length + 1,
    choices: null,
    allowsMultipleResponses: false,
    followUpQuestions: [],
    minValue: null,
    maxValue: null,
    helpText: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  localQuestions.value = [...localQuestions.value, newQ]
  currentIndex.value = localQuestions.value.length - 1
}

function handleDeleteQuestion(index: number) {
  if (!confirm(`Delete question "${localQuestions.value[index]?.title}"? This cannot be undone.`)) return
  const updated = localQuestions.value.filter((_, i) => i !== index)
  // Fix displayOrder after deletion
  localQuestions.value = updated.map((q, i) => ({ ...q, displayOrder: i + 1 }))
  currentIndex.value = Math.min(currentIndex.value, localQuestions.value.length - 1)
}
</script>

<template>
  <div class="msa-page">
    <div class="container-fluid px-4 py-4">

      <h1 class="msa-page-title mb-1">Investment Profile Questions</h1>
      <p class="msa-page-sub mb-3">Manage question sets used to collect investment profiles from clients.</p>

      <!-- Alerts -->
      <div
        v-if="alertSuccess"
        class="alert alert-success alert-dismissible fade show mb-3"
        role="alert"
      >
        {{ alertSuccess }}
        <button type="button" class="btn-close" aria-label="Close" @click="alertSuccess = ''" />
      </div>
      <div
        v-if="alertError"
        class="alert alert-danger alert-dismissible fade show mb-3"
        role="alert"
      >
        {{ alertError }}
        <button type="button" class="btn-close" aria-label="Close" @click="alertError = ''" />
      </div>

      <!-- Initial spinner -->
      <div v-if="initialLoading" class="text-center py-5">
        <div class="spinner-border text-navy" role="status">
          <span class="visually-hidden">Loading…</span>
        </div>
      </div>

      <template v-else>
        <!-- Selector / control panel -->
        <QuestionSetSelector
          :names="NAMES"
          :selected-name="selectedName"
          :current-set="currentSet"
          :draft-set="draftSet"
          :viewing-version="viewingVersion"
          :loading-current="loadingCurrent"
          :loading-draft="loadingDraft"
          :creating="creating"
          :saving="saving"
          :discarding="discarding"
          :publishing="publishing"
          :is-dirty="isDirty"
          class="mb-4"
          @select-name="handleSelectName"
          @view-current="handleViewCurrent"
          @view-draft="handleViewDraft"
          @create-draft="handleCreateDraft"
          @save-draft="handleSaveDraft"
          @discard-draft="handleDiscardDraft"
          @publish-draft="handlePublishDraft"
        />

        <!-- Editor -->
        <template v-if="viewingVersion">
          <div v-if="localQuestions.length === 0" class="empty-questions">
            No questions found in this set.
          </div>
          <QuestionStepper
            v-else
            v-model="currentIndex"
            :questions="localQuestions"
            :readonly="isReadonly"
            @add-question="handleAddQuestion"
            @delete-question="handleDeleteQuestion"
          >
            <QuestionEditor
              :model-value="localQuestions[currentIndex]!"
              :readonly="isReadonly"
              :depth="0"
              @update:model-value="updateQuestion"
            />
          </QuestionStepper>
        </template>
      </template>

    </div>
  </div>
</template>

<style scoped>
.msa-page {
  background-color: var(--msa-light-gray);
  min-height: calc(100vh - 130px);
}

.msa-page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.msa-page-sub {
  color: #6b7a8d;
  font-size: 0.875rem;
}

.empty-questions {
  background: #fff;
  border: 1px dashed #cdd3dc;
  border-radius: 4px;
  padding: 2.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>
