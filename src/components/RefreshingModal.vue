<template>
  <Teleport to="body">
    <Transition name="refresh-fade">
      <div v-if="isRefreshingToken" class="refresh-backdrop" aria-live="polite" aria-label="Refreshing session">
        <div class="refresh-card">
          <div class="refresh-spinner">
            <div class="spinner-ring" />
            <div class="spinner-ring spinner-ring--delay" />
          </div>
          <p class="refresh-text">Refreshing your session&hellip;</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { isRefreshingToken } from '@/services/refreshState'
</script>

<style scoped>
.refresh-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(27, 42, 74, 0.45);
  backdrop-filter: blur(3px);
}

.refresh-card {
  background: #fff;
  border-radius: 10px;
  padding: 2rem 2.75rem;
  box-shadow: 0 8px 32px rgba(27, 42, 74, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  min-width: 220px;
}

/* Double-ring spinner */
.refresh-spinner {
  position: relative;
  width: 52px;
  height: 52px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: var(--msa-navy);
  animation: spin 0.9s linear infinite;
}

.spinner-ring--delay {
  border-top-color: var(--msa-gold);
  animation-delay: -0.45s;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.refresh-text {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--msa-navy);
  letter-spacing: 0.01em;
}

/* Transition */
.refresh-fade-enter-active,
.refresh-fade-leave-active {
  transition: opacity 0.25s ease;
}
.refresh-fade-enter-from,
.refresh-fade-leave-to {
  opacity: 0;
}
.refresh-fade-enter-active .refresh-card,
.refresh-fade-leave-active .refresh-card {
  transition: transform 0.25s ease;
}
.refresh-fade-enter-from .refresh-card {
  transform: scale(0.9);
}
.refresh-fade-leave-to .refresh-card {
  transform: scale(0.95);
}
</style>
