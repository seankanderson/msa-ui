<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import RefreshingModal from '@/components/RefreshingModal.vue'
</script>

<template>
  <div class="msa-app">
    <div class="msa-regulatory-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" class="msa-regulatory-icon" aria-hidden="true">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
      </svg>
      <span>
        Main Street Advisors LTD is currently in the process of registering with regulators and is not yet permitted to operate as an investment advisory firm.
        This site is informational only. &mdash; <strong>Coming Soon.</strong>
      </span>
    </div>
    <NavBar />
    <main class="msa-main">
      <RouterView />
    </main>
    <FooterBar />
    <RefreshingModal />
  </div>
</template>

<style>
:root {
  --msa-navy: #1b2a4a;
  --msa-navy-dark: #111d34;
  --msa-gold: #b8860b;
  --msa-light-gray: #f4f6f9;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  color: #1f2937;
  background-color: var(--msa-light-gray);
  margin: 0;
}

.msa-regulatory-banner {
  background-color: #7a3a00;
  color: #fde8c8;
  font-size: 0.8rem;
  line-height: 1.5;
  padding: 0.5rem 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.msa-regulatory-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.msa-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.msa-main {
  flex: 1;
}
</style>
