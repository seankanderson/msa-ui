<script setup lang="ts">
import type { InvestmentProfileQuestion } from '@/services/questionsService'

const props = defineProps<{
  questions: InvestmentProfileQuestion[]
  readonly: boolean
}>()

const currentIndex = defineModel<number>({ required: true })

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < props.questions.length - 1) currentIndex.value++
}
</script>

<template>
  <div class="stepper">
    <!-- Sidebar -->
    <aside class="stepper-sidebar">
      <div class="sidebar-title">Questions</div>
      <ul class="sidebar-list">
        <li
          v-for="(q, i) in questions"
          :key="q.id"
          :class="['sidebar-item', i === currentIndex && 'sidebar-item--active']"
          @click="currentIndex = i"
        >
          <span class="sidebar-num">{{ i + 1 }}</span>
          <span class="sidebar-label">{{ q.title }}</span>
        </li>
      </ul>
    </aside>

    <!-- Main content area -->
    <div class="stepper-main">
      <div class="stepper-content">
        <div class="stepper-progress">
          <span class="progress-text">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
          <span class="progress-id">{{ questions[currentIndex]?.id }}</span>
        </div>
        <slot />
      </div>

      <div class="stepper-nav">
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="currentIndex === 0"
          @click="prev"
        >
          ← Previous
        </button>

        <div class="nav-dots" role="tablist">
          <button
            v-for="(_, i) in questions"
            :key="i"
            :class="['nav-dot', i === currentIndex && 'nav-dot--active']"
            :aria-label="`Question ${i + 1}`"
            role="tab"
            @click="currentIndex = i"
          />
        </div>

        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="currentIndex === questions.length - 1"
          @click="next"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  border: 1px solid #dde3ec;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

/* Sidebar */
.stepper-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #dde3ec;
  background: #f8f9fb;
  display: flex;
  flex-direction: column;
  max-height: 78vh;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--msa-gold);
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid #dde3ec;
  position: sticky;
  top: 0;
  background: #f8f9fb;
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0.375rem 0;
}

.sidebar-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.1s;
}
.sidebar-item:hover { background: #eef1f8; }
.sidebar-item--active { background: var(--msa-navy); }
.sidebar-item--active .sidebar-num,
.sidebar-item--active .sidebar-label { color: #fff; }

.sidebar-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #9ca3af;
  width: 1.25rem;
  text-align: right;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.sidebar-label {
  font-size: 0.8rem;
  color: #374151;
  line-height: 1.35;
}

/* Main */
.stepper-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stepper-content {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  max-height: 78vh;
}

.stepper-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.progress-id {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: 'Consolas', monospace;
}

/* Nav footer */
.stepper-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #dde3ec;
  background: #f8f9fb;
}

.nav-dots {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.15s;
}
.nav-dot:hover    { background: #9ca3af; }
.nav-dot--active  { background: var(--msa-navy); }
</style>
