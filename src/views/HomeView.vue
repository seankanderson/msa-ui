<script setup lang="ts">
// Home page — sales funnel entry point for Main Street Advisors
</script>

<template>
  <!-- HERO -->
  <section class="msa-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8">
          <p class="msa-hero-eyebrow">Independent Investment Advisory</p>
          <h1 class="msa-hero-headline">
            Retirement Clarity for<br class="d-none d-md-block" />
            Main Street America
          </h1>
          <p class="msa-hero-subhead">
            Honest, structured advice from an independent advisor who takes no custody of your
            funds and has nothing to sell — only guidance aligned with your goals.
          </p>
          <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
            <RouterLink class="btn btn-cta-primary btn-lg" to="/signup">
              Get Started — It&rsquo;s Free
            </RouterLink>
            <RouterLink class="btn btn-cta-secondary btn-lg" to="/login">
              Log In to Your Account
            </RouterLink>
          </div>
          <p class="msa-hero-note mt-3">
            No custody of your funds &bull; No trade execution &bull; 100% independent
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- WHO WE SERVE -->
  <section class="msa-section bg-white">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7">
          <h2 class="msa-section-title">Who We Serve</h2>
          <p class="msa-section-lead">
            We focus on two distinct client groups, each with specialized advisory services.
          </p>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="msa-card h-100">
            <div class="msa-card-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
                />
              </svg>
            </div>
            <h3 class="msa-card-title">Retirement Preparation</h3>
            <p class="msa-card-body">
              For individuals with under $500K net worth who are approaching retirement and
              feel overwhelmed by their financial picture. We help you understand where you
              stand, identify risks, and create an actionable path forward — without judgment.
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="msa-card h-100">
            <div class="msa-card-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
                />
                <path
                  d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"
                />
              </svg>
            </div>
            <h3 class="msa-card-title">Confidential Oversight</h3>
            <p class="msa-card-body">
              For individuals, legal representatives, and advocates who need an independent
              expert to evaluate public sector finances, pension systems, and bond initiatives.
              Our involvement remains strictly confidential and non-participatory with any
              entity under review.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- OUR APPROACH -->
  <section class="msa-section msa-section-alt">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-lg-7">
          <h2 class="msa-section-title">Our Approach</h2>
          <p class="msa-section-lead">
            Built on independence, transparency, and fiduciary responsibility.
          </p>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="msa-pillar">
            <h4 class="msa-pillar-title">Non-Discretionary</h4>
            <p class="msa-pillar-body">
              We never execute trades or move money. You retain full control over your accounts
              at all times. Our role is advice — not action.
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="msa-pillar">
            <h4 class="msa-pillar-title">No Custody</h4>
            <p class="msa-pillar-body">
              We do not hold, manage, or have direct access to your funds. Any portfolio data
              shared with us is read-only and client-authorized.
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="msa-pillar">
            <h4 class="msa-pillar-title">FINRA-Compliant</h4>
            <p class="msa-pillar-body">
              All client communications, disclosures, and advisory activities are conducted in
              accordance with FINRA regulations governing registered investment advisors.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CALL TO ACTION -->
  <section class="msa-cta-section">
    <div class="container text-center">
      <h2 class="msa-cta-headline">Ready to Take the First Step?</h2>
      <p class="msa-cta-sub">
        Create your free account today. No commitment, no obligation.
      </p>
      <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
        <RouterLink class="btn btn-cta-primary btn-lg" to="/signup">Create an Account</RouterLink>
        <RouterLink class="btn btn-cta-outline btn-lg" to="/login">I Already Have an Account</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* HERO */
.msa-hero {
  background: linear-gradient(160deg, var(--msa-navy) 0%, #243a5e 100%);
  color: #fff;
  padding: 5rem 0 4rem;
}

.msa-hero-eyebrow {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--msa-gold);
  font-weight: 600;
  margin-bottom: 1rem;
}

.msa-hero-headline {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}

.msa-hero-subhead {
  font-size: 1.1rem;
  color: #c5d2e6;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.msa-hero-note {
  font-size: 0.8rem;
  color: #7a95b5;
  letter-spacing: 0.04em;
}

/* SECTIONS */
.msa-section {
  padding: 4.5rem 0;
}

.msa-section-alt {
  background-color: var(--msa-light-gray);
}

.msa-section-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.75rem;
}

.msa-section-lead {
  color: #5a6a7e;
  font-size: 1rem;
  margin: 0;
}

/* CARDS */
.msa-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-gold);
  border-radius: 4px;
  padding: 2rem;
}

.msa-card-icon {
  color: var(--msa-navy);
  margin-bottom: 1rem;
}

.msa-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.75rem;
}

.msa-card-body {
  color: #4a5568;
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0;
}

/* PILLARS */
.msa-pillar {
  padding: 1.5rem;
  border-left: 3px solid var(--msa-gold);
}

.msa-pillar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.5rem;
}

.msa-pillar-body {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
}

/* CTA BAND */
.msa-cta-section {
  background-color: var(--msa-navy);
  color: #fff;
  padding: 4rem 0;
}

.msa-cta-headline {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.msa-cta-sub {
  color: #c5d2e6;
  font-size: 1rem;
  margin: 0;
}

/* BUTTONS */
.btn-cta-primary {
  background-color: var(--msa-gold);
  border-color: var(--msa-gold);
  color: var(--msa-navy);
  font-weight: 700;
  padding: 0.75rem 2rem;
}

.btn-cta-primary:hover {
  background-color: #a0740a;
  border-color: #a0740a;
  color: #fff;
}

.btn-cta-secondary {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

.btn-cta-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
}

.btn-cta-outline {
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.45);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

.btn-cta-outline:hover {
  border-color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
