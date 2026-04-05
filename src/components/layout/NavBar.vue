<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark msa-navbar">
    <div class="container">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
        <span class="msa-brand-mark">MSA</span>
        <span class="msa-brand-name d-none d-sm-inline">Main Street Advisors</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNav" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" exact-active-class="active">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/services" active-class="active">Services</RouterLink>
          </li>
          <li v-if="auth.isAdminRole" class="nav-item">
            <RouterLink class="nav-link" to="/admin" active-class="active">Admin</RouterLink>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <template v-if="!auth.isAuthenticated">
            <RouterLink class="btn btn-outline-light btn-sm" to="/login">Log In</RouterLink>
            <RouterLink class="btn btn-accent btn-sm" to="/signup">Get Started</RouterLink>
          </template>
          <template v-else>
            <span class="text-light small me-2">{{ auth.user?.email }}</span>
            <RouterLink class="btn btn-outline-light btn-sm" to="/profile">Profile</RouterLink>
            <button class="btn btn-outline-light btn-sm" @click="handleLogout">Sign Out</button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.msa-navbar {
  background-color: var(--msa-navy);
  border-bottom: 3px solid var(--msa-gold);
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.msa-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--msa-gold);
  color: var(--msa-navy);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  border-radius: 2px;
}

.msa-brand-name {
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
  color: #fff;
}

.btn-accent {
  background-color: var(--msa-gold);
  border-color: var(--msa-gold);
  color: var(--msa-navy);
  font-weight: 600;
}

.btn-accent:hover {
  background-color: #a0740a;
  border-color: #a0740a;
  color: #fff;
}
</style>
