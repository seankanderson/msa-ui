<script setup lang="ts">
</script>

<template>
  <div class="msa-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-9">

          <div class="d-flex align-items-center gap-3 mb-1">
            <RouterLink to="/admin" class="msa-back-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Admin
            </RouterLink>
          </div>

          <h1 class="msa-page-title mb-1">Manage Users</h1>
          <p class="msa-page-sub mb-4">View and manage user accounts, roles, and advisor assignments.</p>

          <div class="msa-card text-center py-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="msa-placeholder-icon mb-3" viewBox="0 0 16 16">
              <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002A.274.274 0 0 1 15 13H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
            <p class="msa-placeholder-text">User management is coming soon.</p>
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

.msa-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #6b7a8d;
  text-decoration: none;
}

.msa-back-link:hover {
  color: var(--msa-navy);
}

.msa-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-navy);
  border-radius: 4px;
  padding: 2rem;
}

.msa-placeholder-icon {
  color: #b0bac6;
}

.msa-placeholder-text {
  color: #6b7a8d;
  font-size: 0.95rem;
  margin: 0;
}
</style>
