<script setup lang="ts">
import { computed } from 'vue'
import FollowUpGroupEditor from './FollowUpGroupEditor.vue'
import ChoicesEditor from './ChoicesEditor.vue'
import type { InvestmentProfileQuestion, FollowUpQuestionGroup } from '@/services/questionsService'

// Named so FollowUpGroupEditor can resolve it via defineAsyncComponent
defineOptions({ name: 'QuestionEditor' })

const question = defineModel<InvestmentProfileQuestion>({ required: true })

const props = defineProps<{
  readonly?: boolean
  depth?: number
}>()

const depth = computed(() => props.depth ?? 0)

const TYPE_LABELS: Record<string, string> = {
  boolean: 'Boolean',
  multipleChoice: 'Multiple Choice',
  freeform: 'Freeform',
  date: 'Date',
  integer: 'Integer',
  decimal: 'Decimal',
}

function set<K extends keyof InvestmentProfileQuestion>(key: K, value: InvestmentProfileQuestion[K]) {
  question.value = { ...question.value, [key]: value }
}

function setChoices(choices: string[]) {
  question.value = { ...question.value, choices }
}

function setType(type: InvestmentProfileQuestion['type']) {
  question.value = {
    ...question.value,
    type,
    // Reset fields that don't apply to the new type
    choices: type === 'multipleChoice' ? (question.value.choices?.length ? question.value.choices : ['']) : null,
    allowsMultipleResponses: type === 'freeform' ? question.value.allowsMultipleResponses : false,
    minValue: (type === 'integer' || type === 'decimal') ? question.value.minValue : null,
    maxValue: (type === 'integer' || type === 'decimal') ? question.value.maxValue : null,
    // Clear follow-ups whose conditions become invalid for the new type
    followUpQuestions: [],
  }
}

function updateFollowUpGroup(index: number, updated: FollowUpQuestionGroup) {
  const fu = [...question.value.followUpQuestions]
  fu[index] = updated
  question.value = { ...question.value, followUpQuestions: fu }
}

function addFollowUpGroup() {
  const defaultOp = question.value.type === 'boolean' ? 'eq'
    : question.value.type === 'multipleChoice' ? 'eq'
    : 'eq'
  const defaultVal = question.value.type === 'boolean' ? 'true'
    : (question.value.choices?.[0] ?? '')
  const newGroup: FollowUpQuestionGroup = {
    condition: { operator: defaultOp, value: defaultVal },
    questions: [],
  }
  question.value = { ...question.value, followUpQuestions: [...question.value.followUpQuestions, newGroup] }
}

function removeFollowUpGroup(index: number) {
  question.value = {
    ...question.value,
    followUpQuestions: question.value.followUpQuestions.filter((_, i) => i !== index),
  }
}
</script>

<template>
  <div :class="['question-editor', depth > 0 && 'question-editor--nested']">
    <!-- Header bar: id, type selector, required badge -->
    <div class="qe-header">
      <code class="qe-id">{{ question.id }}</code>
      <select
        v-if="!readonly"
        :class="['type-select', `type-${question.type}`]"
        :value="question.type"
        @change="setType(($event.target as HTMLSelectElement).value as InvestmentProfileQuestion['type'])"
      >
        <option v-for="(label, val) in TYPE_LABELS" :key="val" :value="val">{{ label }}</option>
      </select>
      <span v-else :class="['type-badge', `type-${question.type}`]">
        {{ TYPE_LABELS[question.type] ?? question.type }}
      </span>
      <span v-if="question.isRequired" class="ms-auto required-badge">Required</span>
    </div>

    <div class="qe-body">
      <!-- Title + Content -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label class="qe-label">Title</label>
          <input
            type="text"
            class="form-control form-control-sm"
            :value="question.title"
            :readonly="readonly"
            @input="set('title', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="col-md-8">
          <label class="qe-label">Content <span class="qe-hint">(shown to client)</span></label>
          <textarea
            class="form-control form-control-sm"
            rows="2"
            :value="question.content"
            :readonly="readonly"
            @input="set('content', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </div>

      <!-- Checkboxes row -->
      <div class="d-flex flex-wrap gap-3 mb-3">
        <div class="form-check">
          <input
            :id="`req-${question.id}-${depth}`"
            class="form-check-input"
            type="checkbox"
            :checked="question.isRequired"
            :disabled="readonly"
            @change="set('isRequired', ($event.target as HTMLInputElement).checked)"
          />
          <label :for="`req-${question.id}-${depth}`" class="form-check-label qe-check-label">
            Required
          </label>
        </div>
        <div v-if="question.type === 'freeform'" class="form-check">
          <input
            :id="`multi-${question.id}-${depth}`"
            class="form-check-input"
            type="checkbox"
            :checked="question.allowsMultipleResponses"
            :disabled="readonly"
            @change="set('allowsMultipleResponses', ($event.target as HTMLInputElement).checked)"
          />
          <label :for="`multi-${question.id}-${depth}`" class="form-check-label qe-check-label">
            Allow multiple responses
          </label>
        </div>
      </div>

      <!-- Min/Max for numeric types -->
      <div v-if="question.type === 'integer' || question.type === 'decimal'" class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <label class="qe-label">Min Value</label>
          <input
            type="number"
            class="form-control form-control-sm"
            :value="question.minValue ?? ''"
            :readonly="readonly"
            @input="set('minValue', ($event.target as HTMLInputElement).value !== '' ? Number(($event.target as HTMLInputElement).value) : null)"
          />
        </div>
        <div class="col-6 col-md-3">
          <label class="qe-label">Max Value</label>
          <input
            type="number"
            class="form-control form-control-sm"
            :value="question.maxValue ?? ''"
            :readonly="readonly"
            @input="set('maxValue', ($event.target as HTMLInputElement).value !== '' ? Number(($event.target as HTMLInputElement).value) : null)"
          />
        </div>
      </div>

      <!-- Choices for multipleChoice -->
      <div v-if="question.type === 'multipleChoice'" class="mb-3">
        <label class="qe-label">Choices</label>
        <ChoicesEditor
          v-if="!readonly"
          :model-value="question.choices ?? []"
          @update:model-value="setChoices"
        />
        <ul v-else class="choices-readonly">
          <li v-for="c in question.choices" :key="c">{{ c }}</li>
        </ul>
      </div>

      <!-- Help text -->
      <div class="mb-3">
        <label class="qe-label">
          Help Text <span class="qe-hint">(optional — displayed below the question)</span>
        </label>
        <input
          type="text"
          class="form-control form-control-sm"
          :value="question.helpText ?? ''"
          :readonly="readonly"
          placeholder="Optional guidance for the client"
          @input="set('helpText', ($event.target as HTMLInputElement).value || null)"
        />
      </div>

      <!-- Follow-up question groups -->
      <div class="qe-section-header">
        <span class="qe-section-label">Follow-up Questions</span>
        <button
          v-if="!readonly"
          type="button"
          class="btn btn-xs btn-outline-navy"
          @click="addFollowUpGroup"
        >
          + Add Follow-up Group
        </button>
      </div>
      <template v-if="question.followUpQuestions.length > 0">
        <div class="qe-followups">
          <div
            v-for="(group, gi) in question.followUpQuestions"
            :key="gi"
            class="qe-followup-row"
          >
            <FollowUpGroupEditor
              :model-value="group"
              :parent-type="question.type"
              :parent-choices="question.choices"
              :readonly="!!readonly"
              :depth="depth"
              @update:model-value="updateFollowUpGroup(gi, $event)"
            />
            <button
              v-if="!readonly"
              type="button"
              class="btn btn-xs btn-outline-danger followup-remove-btn"
              title="Remove follow-up group"
              @click="removeFollowUpGroup(gi)"
            >
              &times;
            </button>
          </div>
        </div>
      </template>
      <div v-else-if="!readonly" class="qe-followup-empty">
        No follow-up groups. Use the button above to add conditions that reveal additional questions.
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-editor {
  background: #fff;
  border: 1px solid #dde3ec;
  border-radius: 4px;
  overflow: hidden;
}

.question-editor--nested {
  background: #fafbfd;
  border-color: #e5e9f0;
}

.qe-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: #f8f9fb;
  border-bottom: 1px solid #edf0f4;
}

.qe-id {
  font-size: 0.78rem;
  color: var(--msa-navy);
  background: #eef1f8;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

.type-badge {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.18rem 0.45rem;
  border-radius: 2px;
}
.type-boolean        { background: #dbeafe; color: #1e40af; }
.type-multipleChoice { background: #ede9fe; color: #5b21b6; }
.type-freeform       { background: #dcfce7; color: #166534; }
.type-date           { background: #fce7f3; color: #9d174d; }
.type-integer,
.type-decimal        { background: #ffedd5; color: #9a3412; }

.required-badge {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #b91c1c;
  background: #fee2e2;
  padding: 0.18rem 0.45rem;
  border-radius: 2px;
}

.qe-body { padding: 1rem; }

.qe-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.qe-hint {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.75rem;
}

.qe-check-label { font-size: 0.82rem; color: #374151; }

.form-check-input:checked {
  background-color: var(--msa-navy);
  border-color: var(--msa-navy);
}

.choices-readonly {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.qe-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.qe-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--msa-gold);
}

.qe-followups {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qe-followup-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.qe-followup-row > :first-child {
  flex: 1;
  min-width: 0;
}

.followup-remove-btn {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.qe-followup-empty {
  font-size: 0.78rem;
  color: #9ca3af;
  padding: 0.5rem 0;
}

.type-select {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.18rem 1.5rem 0.18rem 0.45rem;
  border-radius: 2px;
  height: auto;
  border: 1px solid #d1d5db;
  cursor: pointer;
}
.type-select.type-boolean        { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
.type-select.type-multipleChoice { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }
.type-select.type-freeform       { background: #dcfce7; color: #166534; border-color: #86efac; }
.type-select.type-date           { background: #fce7f3; color: #9d174d; border-color: #f9a8d4; }
.type-select.type-integer,
.type-select.type-decimal        { background: #ffedd5; color: #9a3412; border-color: #fdba74; }
</style>
