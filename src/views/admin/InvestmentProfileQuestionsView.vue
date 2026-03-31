<script setup lang="ts">
import { ref, onMounted } from 'vue'
import questionsService from '@/services/questionsService'
import { getApiError } from '@/services/api'
import type { InvestmentProfileQuestionsDocument, InvestmentProfileQuestion } from '@/services/questionsService'
import QuestionStepper from '@/components/admin/QuestionStepper.vue'
import QuestionEditor from '@/components/admin/QuestionEditor.vue'

const loading      = ref(true)
const loadError    = ref('')
const currentSet   = ref<InvestmentProfileQuestionsDocument | null>(null)
const localQuestions = ref<InvestmentProfileQuestion[]>([])
const currentIndex = ref(0)

onMounted(async () => {
  try {
    const { data } = await questionsService.getCurrent()
    currentSet.value = data
    localQuestions.value = JSON.parse(JSON.stringify(data.questions ?? []))
  } catch (err) {
    console.error('[InvestmentProfileQuestionsView] load error:', err)
    loadError.value = getApiError(err, 'Failed to load question set.')
  } finally {
    loading.value = false
  }
})

function updateQuestion(updated: InvestmentProfileQuestion) {
  localQuestions.value[currentIndex.value] = updated
}
</script>

<template>
  <div class="msa-page">
    <div class="container-fluid px-4 py-4">

      <h1 class="msa-page-title mb-1">Investment Profile Questions</h1>
      <p class="msa-page-sub">Browse and inspect the current question set.</p>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-navy" role="status">
          <span class="visually-hidden">Loading…</span>
        </div>
      </div>

      <!-- Load error -->
      <div v-else-if="loadError" class="alert alert-danger mt-4" role="alert">
        {{ loadError }}
      </div>

      <template v-else-if="currentSet">
        <!-- Info bar -->
        <div class="info-bar mb-3">
          <span class="info-name">{{ currentSet.name }}</span>
          <span :class="['status-badge', `status-${currentSet.status}`]">{{ currentSet.status }}</span>
          <span class="info-count">{{ localQuestions.length }} questions</span>
        </div>

        <!-- No questions state -->
        <div v-if="localQuestions.length === 0" class="empty-questions">
          No questions found in this set.
        </div>

        <!-- Stepper + editor -->
        <QuestionStepper
          v-else
          v-model="currentIndex"
          :questions="localQuestions"
          :readonly="false"
        >
          <QuestionEditor
            :model-value="localQuestions[currentIndex]!"
            :readonly="false"
            :depth="0"
            @update:model-value="updateQuestion"
          />
        </QuestionStepper>
      </template>

      <div v-else class="alert alert-info mt-4" role="alert">
        No active question set found.
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
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.msa-page-sub {
  color: #6b7a8d;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.info-bar {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  background: #fff;
  border: 1px solid #dde3ec;
  border-left: 3px solid var(--msa-navy);
  border-radius: 4px;
}

.info-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--msa-navy);
  font-family: 'Consolas', monospace;
}

.info-count {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-left: auto;
}

.status-badge {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.18rem 0.45rem;
  border-radius: 2px;
}
.status-current  { background: #d1fae5; color: #065f46; }
.status-draft    { background: #fef3c7; color: #92400e; }
.status-archived { background: #f3f4f6; color: #6b7280; }

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
