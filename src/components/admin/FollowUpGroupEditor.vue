<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import type { FollowUpQuestionGroup, InvestmentProfileQuestion } from '@/services/questionsService'

// Async import breaks the circular dependency with QuestionEditor
const QuestionEditor = defineAsyncComponent(() => import('./QuestionEditor.vue'))

const group = defineModel<FollowUpQuestionGroup>({ required: true })

const props = defineProps<{
  parentType: string
  parentChoices: string[] | null
  readonly: boolean
  depth: number
}>()

const operators = computed(() => {
  switch (props.parentType) {
    case 'boolean': return ['eq']
    case 'multipleChoice': return ['eq', 'neq', 'contains']
    case 'integer':
    case 'decimal': return ['eq', 'neq', 'gt', 'lt', 'gte', 'lte']
    default: return ['eq', 'neq', 'contains']
  }
})

const valueIsDropdown = computed(() =>
  props.parentType === 'boolean' ||
  (props.parentType === 'multipleChoice' && !!props.parentChoices?.length),
)

const valueOptions = computed(() =>
  props.parentType === 'boolean' ? ['true', 'false'] : (props.parentChoices ?? []),
)

function setOperator(op: string) {
  group.value = { ...group.value, condition: { ...group.value.condition, operator: op } }
}

function setConditionValue(val: string) {
  group.value = { ...group.value, condition: { ...group.value.condition, value: val } }
}

function updateNestedQuestion(index: number, updated: InvestmentProfileQuestion) {
  const questions = [...group.value.questions]
  questions[index] = updated
  group.value = { ...group.value, questions }
}

function addQuestion() {
  const newQ: InvestmentProfileQuestion = {
    id: `followup-${Date.now()}`,
    title: '',
    content: '',
    type: 'freeform',
    isRequired: false,
    displayOrder: group.value.questions.length,
    choices: null,
    allowsMultipleResponses: false,
    followUpQuestions: [],
    minValue: null,
    maxValue: null,
    helpText: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  group.value = { ...group.value, questions: [...group.value.questions, newQ] }
}

function removeQuestion(index: number) {
  group.value = { ...group.value, questions: group.value.questions.filter((_, i) => i !== index) }
}
</script>

<template>
  <div class="followup-group">
    <div class="followup-condition">
      <span class="condition-label">Show when answer</span>

      <select
        class="form-select form-select-sm condition-op"
        :value="group.condition.operator"
        :disabled="readonly"
        @change="setOperator(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="op in operators" :key="op" :value="op">{{ op }}</option>
      </select>

      <select
        v-if="valueIsDropdown"
        class="form-select form-select-sm condition-val"
        :value="group.condition.value"
        :disabled="readonly"
        @change="setConditionValue(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in valueOptions" :key="opt" :value="opt">{{ opt }}</option>
      </select>

      <input
        v-else
        type="text"
        class="form-control form-control-sm condition-val"
        :value="group.condition.value"
        :readonly="readonly"
        placeholder="value"
        @input="setConditionValue(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="followup-questions-header">
      <span class="followup-questions-label">Nested Questions</span>
      <button
        v-if="!readonly"
        type="button"
        class="btn btn-xs btn-outline-navy"
        @click="addQuestion"
      >
        + Add Question
      </button>
    </div>

    <div v-if="group.questions.length > 0" class="followup-questions">
      <div
        v-for="(q, qi) in group.questions"
        :key="q.id"
        class="followup-question-row"
      >
        <QuestionEditor
          :model-value="q"
          :readonly="readonly"
          :depth="depth + 1"
          @update:model-value="updateNestedQuestion(qi, $event)"
        />
        <button
          v-if="!readonly"
          type="button"
          class="btn btn-xs btn-outline-danger nested-remove-btn"
          title="Remove question"
          @click="removeQuestion(qi)"
        >
          &times;
        </button>
      </div>
    </div>
    <div v-else-if="!readonly" class="followup-questions-empty">
      No questions yet. Use the button above to add a nested question.
    </div>
  </div>
</template>

<style scoped>
.followup-group {
  border-left: 3px solid var(--msa-gold);
  border-radius: 0 4px 4px 0;
  padding: 0.75rem 1rem;
  background: rgba(212, 170, 90, 0.05);
}

.followup-condition {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.condition-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--msa-gold);
  white-space: nowrap;
}

.condition-op  { width: auto; min-width: 80px;  max-width: 120px; }
.condition-val { width: auto; min-width: 100px; max-width: 200px; }

.followup-questions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.followup-questions-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.followup-questions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.followup-question-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.followup-question-row > :first-child {
  flex: 1;
  min-width: 0;
}

.nested-remove-btn {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.followup-questions-empty {
  font-size: 0.78rem;
  color: #9ca3af;
  padding: 0.25rem 0;
}
</style>
