<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
</script>

<template>
  <div class="msa-app">
    <NavBar />
    <main class="msa-main">
      <RouterView />
    </main>
    <FooterBar />
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

.msa-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.msa-main {
  flex: 1;
}
</style>
