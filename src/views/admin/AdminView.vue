<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="msa-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-9">

          <h1 class="msa-page-title mb-1">Admin</h1>
          <p class="msa-page-sub mb-5">Manage users, questions, and other administrative settings.</p>

          <div class="row g-4">

            <div class="col-sm-6 col-lg-4">
              <RouterLink to="/admin/users" class="admin-tile text-decoration-none">
                <div class="admin-tile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                  </svg>
                </div>
                <div class="admin-tile-label">Manage Users</div>
                <div class="admin-tile-desc">View and manage user accounts, roles, and assignments.</div>
              </RouterLink>
            </div>

            <div class="col-sm-6 col-lg-4" v-if="auth.isSupervisor">
              <RouterLink to="/admin/questions" class="admin-tile text-decoration-none">
                <div class="admin-tile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zm-9 4v1.5h2.5V13h1.5V6.5H11V5H5zm0 0"/>
                    <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M5.5 5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm0 3h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zm0 3h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1z"/>
                  </svg>
                </div>
                <div class="admin-tile-label">Manage Questions</div>
                <div class="admin-tile-desc">Configure investment profile question sets and answer choices.</div>
              </RouterLink>
            </div>

          </div>

        </div>
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
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--msa-navy);
}

.msa-page-sub {
  color: #6b7a8d;
  font-size: 0.9rem;
}

.admin-tile {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  padding: 1.75rem 1.5rem;
  height: 100%;
  color: inherit;
  transition: box-shadow 0.15s ease, border-top-color 0.15s ease;
}

.admin-tile:hover {
  box-shadow: 0 4px 16px rgba(27, 42, 74, 0.12);
  border-top-color: var(--msa-gold);
}

.admin-tile-icon {
  color: var(--msa-navy);
  margin-bottom: 1rem;
}

.admin-tile-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.4rem;
}

.admin-tile-desc {
  font-size: 0.85rem;
  color: #6b7a8d;
  line-height: 1.5;
}
</style>
