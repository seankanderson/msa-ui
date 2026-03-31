<script setup lang="ts">
const choices = defineModel<string[]>({ required: true })

function add() {
  choices.value = [...choices.value, '']
}

function remove(i: number) {
  choices.value = choices.value.filter((_, idx) => idx !== i)
}

function update(i: number, e: Event) {
  const arr = [...choices.value]
  arr[i] = (e.target as HTMLInputElement).value
  choices.value = arr
}
</script>

<template>
  <div class="choices-editor">
    <div v-for="(choice, i) in choices" :key="i" class="choice-row">
      <span class="choice-num">{{ i + 1 }}</span>
      <input
        type="text"
        class="form-control form-control-sm choice-input"
        :value="choice"
        placeholder="Choice text"
        @input="update(i, $event)"
      />
      <button
        type="button"
        class="btn btn-sm btn-outline-danger choice-remove"
        :disabled="choices.length <= 1"
        aria-label="Remove choice"
        @click="remove(i)"
      >
        &times;
      </button>
    </div>
    <button type="button" class="btn btn-sm btn-outline-secondary mt-2" @click="add">
      + Add Choice
    </button>
  </div>
</template>

<style scoped>
.choices-editor { display: flex; flex-direction: column; gap: 0.375rem; }

.choice-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.choice-num {
  font-size: 0.75rem;
  color: #9ca3af;
  width: 1.25rem;
  text-align: right;
  flex-shrink: 0;
}

.choice-input { flex: 1; }
.choice-remove { flex-shrink: 0; line-height: 1; padding: 0.2rem 0.45rem; }
</style>
