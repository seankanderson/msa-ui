<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="msa-footer">
    <div class="container">
      <div class="row gy-4">
        <div class="col-md-4">
          <p class="msa-footer-brand mb-1">Main Street Advisors LTD</p>
          <p class="msa-footer-tagline">Independent. Objective. On Your Side.</p>
        </div>
        <div class="col-md-4">
          <p class="msa-footer-heading">Legal</p>
          <ul class="list-unstyled msa-footer-links mb-0">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Form ADV</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <p class="msa-footer-heading">Contact</p>
          <p class="msa-footer-text mb-0">
            For inquiries, please contact us through<br />
            our secure client portal.
          </p>
        </div>
      </div>
      <hr class="msa-footer-divider" />
      <div class="row align-items-center">
        <div class="col-md-8">
          <p class="msa-footer-disclaimer mb-0">
            Main Street Advisors LTD is a registered investment advisory firm. We are a
            non-discretionary advisor and do not take custody of client funds. All investing involves
            risk. Past performance is not indicative of future results.
          </p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
          <p class="msa-footer-copy mb-0">&copy; {{ year }} Main Street Advisors LTD</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.msa-footer {
  background-color: var(--msa-navy-dark);
  color: #ccd6e8;
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.msa-footer-brand {
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.msa-footer-tagline {
  color: var(--msa-gold);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.msa-footer-heading {
  font-weight: 600;
  color: #fff;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.msa-footer-links a {
  color: #aabbd4;
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 2;
  display: block;
}

.msa-footer-links a:hover {
  color: #fff;
}

.msa-footer-text {
  font-size: 0.875rem;
  color: #aabbd4;
}

.msa-footer-divider {
  border-color: rgba(255, 255, 255, 0.12);
  margin: 2rem 0 1rem;
}

.msa-footer-disclaimer {
  font-size: 0.75rem;
  color: #7a95b5;
  line-height: 1.6;
}

.msa-footer-copy {
  font-size: 0.8rem;
  color: #7a95b5;
}
</style>
