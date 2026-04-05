<script setup lang="ts">
// Privacy Policy — MSA client data and confidentiality commitment
</script>

<template>
  <!-- PAGE HEADER -->
  <section class="msa-privacy-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-7">
          <p class="msa-privacy-eyebrow">Legal</p>
          <h1 class="msa-privacy-headline">Privacy Policy</h1>
          <p class="msa-privacy-subhead">
            How Main Street Advisors LTD collects, protects, and never misuses your
            personal and financial information.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="msa-privacy-body">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">

          <div class="msa-privacy-section">
            <h2 class="msa-privacy-section-title">Our Commitment to Your Privacy</h2>
            <p>
              Main Street Advisors LTD treats client privacy as sacred. We do not disclose
              personal, financial, or advisory information without explicit written consent
              from the client. This prohibition covers disclosures to private parties, law
              enforcement, and courts.
            </p>
          </div>

          <div class="msa-privacy-section">
            <h2 class="msa-privacy-section-title">Court Orders and Legal Process</h2>
            <p>
              If a valid court order prohibits client notification — such as a sealed subpoena
              — we will confirm its legitimacy and, where appropriate, challenge it before
              complying. We do not treat the existence of a legal demand alone as sufficient
              grounds to override our obligations to you.
            </p>
          </div>

          <div class="msa-privacy-section">
            <h2 class="msa-privacy-section-title">No Sale or Unauthorized Sharing of Data</h2>
            <p>
              Client data is never sold, shared, or transmitted to any third party without
              your authorization. Our fiduciary obligations reinforce and extend this
              commitment — protecting your information is not merely a legal requirement,
              it is central to the trust on which our advisory relationship depends.
            </p>
          </div>

          <div class="msa-privacy-section">
            <h2 class="msa-privacy-section-title">Regulatory Framework</h2>
            <p>
              Our privacy practices are governed by SEC Regulation S-P (Privacy of Consumer
              Financial Information), which establishes the standards for how registered
              investment advisors must safeguard client data and provide privacy notices.
            </p>
          </div>

          <div class="msa-privacy-notice">
            <p class="mb-0">
              Questions about your privacy or how your information is handled may be directed
              to your advisor through the secure client portal.
            </p>
          </div>

          <p class="msa-privacy-updated">Last updated: April 2026</p>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* HERO */
.msa-privacy-hero {
  background: linear-gradient(160deg, var(--msa-navy) 0%, #243a5e 100%);
  color: #fff;
  padding: 3.5rem 0 3rem;
}

.msa-privacy-eyebrow {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--msa-gold);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.msa-privacy-headline {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.msa-privacy-subhead {
  font-size: 1rem;
  color: #c5d2e6;
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.7;
}

/* BODY */
.msa-privacy-body {
  padding: 4rem 0 5rem;
  background-color: #fff;
}

.msa-privacy-section {
  margin-bottom: 2.5rem;
}

.msa-privacy-section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--msa-gold);
  display: inline-block;
}

.msa-privacy-section p {
  font-size: 0.9375rem;
  color: #4a5568;
  line-height: 1.8;
  margin: 0;
}

.msa-privacy-notice {
  background-color: #f4f6fa;
  border-left: 4px solid var(--msa-navy);
  border-radius: 0 4px 4px 0;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  color: #2a3d5a;
  margin-top: 2.5rem;
}

.msa-privacy-updated {
  font-size: 0.775rem;
  color: #9aabbd;
  margin-top: 2rem;
  margin-bottom: 0;
}
</style>
