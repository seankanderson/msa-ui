<script setup lang="ts">
// Services page — public overview of advisory service offerings and fee schedules
</script>

<template>
  <!-- PAGE HEADER -->
  <section class="msa-services-hero">
    <div class="container">
      <div class="row justify-content-center text-center">
        <div class="col-lg-8">
          <p class="msa-services-eyebrow">What We Offer</p>
          <h1 class="msa-services-headline">Our Advisory Services</h1>
          <p class="msa-services-subhead">
            Transparent, fee-based advisory services with no commissions, no custody, and no
            hidden incentives. Choose the service that fits your situation.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- RETIREMENT PREPARATION -->
  <section class="msa-section bg-white" id="retirement-preparation">
    <div class="container">
      <div class="row g-5 align-items-start">
        <div class="col-lg-5">
          <div class="msa-service-icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
          </div>
          <h2 class="msa-service-title">Retirement Preparation</h2>
          <p class="msa-service-lead">
            Designed for individuals with under $500K net worth who are approaching retirement
            and feel overwhelmed by their financial picture.
          </p>
          <p class="msa-service-body">
            We help you understand where you stand, identify risks, and create an actionable
            path forward — without judgment. Our advisors review your full financial picture
            including existing accounts, Social Security projections, income needs, and
            expense planning to deliver a clear, written retirement readiness report.
          </p>
          <p class="msa-service-body">
            All engagements are non-discretionary. We advise; you decide. We never touch your
            accounts, execute trades, or hold your funds.
          </p>
        </div>
        <div class="col-lg-7">
          <div class="msa-fees-card">
            <h4 class="msa-fees-title">Service Fees</h4>
            <table class="table msa-fees-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th class="text-end">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="fw-semibold">Initial Consultation</span>
                    <small class="d-block text-muted">Includes a 60-minute meeting — follows account sign-up and completion of the investment profile questionnaire — includes written assessment and prioritized action items</small>
                  </td>
                  <td class="text-end">$300</td>
                </tr>
                <tr>
                  <td>
                    <span class="fw-semibold">Follow-up Consultations</span>
                    <small class="d-block text-muted">Scheduled as-needed</small>
                  </td>
                  <td class="text-end">$50 / 15 min</td>
                </tr>
              </tbody>
            </table>
            <p class="msa-fees-note">
              All fees are flat-rate. No percentage-of-assets charges. No hidden costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SENIOR FINANCIAL MONITORING -->
  <section class="msa-section msa-section-alt" id="senior-financial-monitoring">
    <div class="container">
      <div class="row g-5 align-items-start flex-lg-row-reverse">
        <div class="col-lg-5">
          <div class="msa-service-icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
              />
            </svg>
          </div>
          <h2 class="msa-service-title">Senior Financial Monitoring</h2>
          <p class="msa-service-lead">
            Independent oversight of a senior's financial accounts to detect and report
            suspicious activity, unauthorized transactions, or signs of financial exploitation.
          </p>
          <p class="msa-service-body">
            Families and legal representatives engage us to serve as a neutral, third-party
            monitor for elderly individuals who may be vulnerable to financial abuse. We review
            account activity on a monthly basis and deliver clear, plain-language reports to
            designated family members or authorized representatives.
          </p>
          <p class="msa-service-body">
            We do not hold or manage any accounts. Our role is strictly observational and
            advisory — identifying red flags and escalating concerns through proper channels,
            including reporting to Adult Protective Services when warranted.
          </p>
        </div>
        <div class="col-lg-7">
          <div class="msa-fees-card">
            <h4 class="msa-fees-title">Service Fees</h4>
            <table class="table msa-fees-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th class="text-end">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="fw-semibold">Intake &amp; Account Setup</span>
                    <small class="d-block text-muted">Includes a 60-minute meeting — initial review and baseline documentation — includes action items for structuring accounts to reduce exposure to fraud and theft</small>
                  </td>
                  <td class="text-end">$300</td>
                </tr>
                <tr>
                  <td>
                    <span class="fw-semibold">Monthly Account Monitoring</span>
                    <small class="d-block text-muted">Per account reviewed each month — report generated and sent to the designated custodian</small>
                  </td>
                  <td class="text-end">$50 / mo per account</td>
                </tr>
              </tbody>
            </table>
            <p class="msa-fees-note">
              Monitoring services are provided on a month-to-month basis with no long-term
              commitment required.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CLIENT INTERMEDIATION -->
  <section v-if="false" class="msa-section bg-white" id="client-intermediation">
    <div class="container">
      <div class="row g-5 align-items-start">
        <div class="col-lg-5">
          <div class="msa-service-icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A3 3 0 0 1 3 2.506zm1.068.5H7v-.5a1.5 1.5 0 0 0-3 0c0 .085.002.274.045.43zM9 3h2.932l.023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0zm6 4v-2H1v2zm-1 1H2v7.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5zm-7 1v6H2.5a.5.5 0 0 1-.5-.5V9zm1 0h5v5.5a.5.5 0 0 1-.5.5H8z"/>
            </svg>
          </div>
          <h2 class="msa-service-title">Client Intermediation</h2>
          <p class="msa-service-lead">
            We stand between you and the institutions — creditors, servicers, collectors, and
            financial organizations — so you don't have to face them alone.
          </p>
          <p class="msa-service-body">
            When institutions receive correspondence from your advisor rather
            than from you directly, the dynamic changes. Our involvement signals that your
            situation is being professionally managed, your records are in order, and any
            missteps on their part will be documented. This has a measurable chilling effect
            on aggressive or improper collection behavior.
          </p>
          <p class="msa-service-body">
            We handle written and verbal communications on your behalf using an Authorization
            to Communicate — meaning you retain full decision-making authority while we
            manage the back-and-forth.
          </p>
          <p class="msa-service-body">
            We also recognize where our authority ends. When a situation escalates beyond
            financial coordination — into legal disputes, litigation risk, or regulatory
            matters — we identify that line clearly and act accordingly. We can forward your
            complete documentation to an attorney, recommend counsel suited to your situation,
            and coordinate directly with them so nothing falls through the cracks during the
            transition.
          </p>
          <div class="msa-intermediation-note">
            <strong>Not legal representation.</strong> Client Intermediation is a financial
            coordination and communication service. We operate strictly within the bounds of
            authorized financial representation and do not provide legal advice or execute
            binding legal agreements.
          </div>
        </div>
        <div class="col-lg-7">
          <div class="msa-fees-card">
            <h4 class="msa-fees-title">Service Fees</h4>
            <table class="table msa-fees-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th class="text-end">Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="fw-semibold">Communication &amp; Response Handling</span>
                    <small class="d-block text-muted">Per communication sent or received on your behalf, including documentation of one response</small>
                  </td>
                  <td class="text-end">$50</td>
                </tr>
                <tr>
                  <td>
                    <span class="fw-semibold">Hardship Letter Preparation</span>
                    <small class="d-block text-muted">Client-signed letter with supporting financial narrative</small>
                  </td>
                  <td class="text-end">$100</td>
                </tr>
                <tr>
                  <td>
                    <span class="fw-semibold">Financial Documentation Package</span>
                    <small class="d-block text-muted">Compiled financial packet for creditor submission</small>
                  </td>
                  <td class="text-end">$100</td>
                </tr>
                <tr>
                  <td>
                    <span class="fw-semibold">Authorization Setup</span>
                    <small class="d-block text-muted">Preparation and filing of Authorization to Communicate or Limited POA with a creditor</small>
                  </td>
                  <td class="text-end">$50</td>
                </tr>
              </tbody>
            </table>
            <p class="msa-fees-note">
              All fees are per-engagement. No retainer required. Engagements are initiated at
              your direction and you remain in control of every decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONFIDENTIAL OVERSIGHT -->
  <section class="msa-section bg-white" id="confidential-oversight">
    <div class="container">
      <div class="row g-5 align-items-start">
        <div class="col-lg-5">
          <div class="msa-service-icon-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
          <h2 class="msa-service-title">Confidential Oversight</h2>
          <p class="msa-service-lead">
            For individuals, legal representatives, and advocates who need an independent
            expert to evaluate public sector finances, pension systems, and bond initiatives.
          </p>
          <p class="msa-service-body">
            Our involvement remains strictly confidential and non-participatory with any entity
            under review. Engagements are structured to ensure our independence is never
            compromised — we do not communicate with, accept compensation from, or publish
            findings accessible to the entities we evaluate.
          </p>
          <p class="msa-service-body">
            Due to the sensitive nature of these engagements, fees and scope are determined
            on a case-by-case basis. Please contact us to discuss your situation with a senior
            advisor.
          </p>
        </div>
        <div class="col-lg-7">
          <div class="msa-fees-card msa-fees-card-consult">
            <h4 class="msa-fees-title">Service Fees</h4>
            <div class="msa-consult-notice">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                class="msa-consult-icon"
                viewBox="0 0 16 16"
              >
                <path
                  d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"
                />
              </svg>
              <p class="msa-consult-text">Please consult with an advisor for fees.</p>
            </div>
            <p class="msa-fees-note mt-2">
              Depending on the nature of the situation and the individuals involved, some
              engagements may qualify for pro bono or reduced-fee services. Please mention
              your circumstances when reaching out.
            </p>
            <p class="msa-fees-note mt-3">
              Confidential Oversight engagements are scoped individually. Contact us to arrange
              a private consultation with a senior advisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA BAND -->
  <section class="msa-cta-section">
    <div class="container text-center">
      <h2 class="msa-cta-headline">Ready to Get Started?</h2>
      <p class="msa-cta-sub">
        Create a free account and connect with an advisor who fits your needs.
      </p>
      <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
        <RouterLink class="btn btn-cta-primary btn-lg" to="/signup">Create a Free Account</RouterLink>
        <RouterLink class="btn btn-cta-outline btn-lg" to="/login">Log In</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* PAGE HERO */
.msa-services-hero {
  background: linear-gradient(160deg, var(--msa-navy) 0%, #243a5e 100%);
  color: #fff;
  padding: 4rem 0 3.5rem;
}

.msa-services-eyebrow {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--msa-gold);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.msa-services-headline {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.msa-services-subhead {
  font-size: 1.05rem;
  color: #c5d2e6;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

/* SECTIONS */
.msa-section {
  padding: 4.5rem 0;
}

.msa-section-alt {
  background-color: var(--msa-light-gray);
}

/* SERVICE CONTENT */
.msa-service-icon-wrap {
  color: var(--msa-navy);
  margin-bottom: 1rem;
}

.msa-service-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--msa-navy);
  margin-bottom: 0.75rem;
}

.msa-service-lead {
  font-size: 1rem;
  font-weight: 600;
  color: #2a3d5a;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.msa-service-body {
  font-size: 0.9375rem;
  color: #4a5568;
  line-height: 1.75;
  margin-bottom: 0.75rem;
}

.msa-intermediation-note {
  font-size: 0.8rem;
  color: #6b7a8d;
  background-color: #f4f6fa;
  border-left: 3px solid #b0bfd0;
  border-radius: 0 4px 4px 0;
  padding: 0.75rem 1rem;
  margin-top: 1.25rem;
  line-height: 1.6;
}

/* FEES CARD */
.msa-fees-card {
  background: #fff;
  border: 1px solid #dde3ec;
  border-top: 3px solid var(--msa-gold);
  border-radius: 4px;
  padding: 2rem;
}

.msa-fees-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--msa-navy);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.25rem;
}

.msa-fees-table {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.msa-fees-table thead th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7a8d;
  border-bottom: 2px solid #dde3ec;
  padding-bottom: 0.6rem;
}

.msa-fees-table tbody tr td {
  padding: 0.85rem 0.5rem;
  vertical-align: top;
  border-color: #edf0f5;
  color: #2d3748;
}

.msa-fees-note {
  font-size: 0.8rem;
  color: #6b7a8d;
  margin: 0;
  border-top: 1px solid #edf0f5;
  padding-top: 0.75rem;
}

/* CONSULT variant */
.msa-fees-card-consult {
  display: flex;
  flex-direction: column;
}

.msa-consult-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f4f6fa;
  border-left: 4px solid var(--msa-navy);
  border-radius: 0 4px 4px 0;
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.25rem;
}

.msa-consult-icon {
  color: var(--msa-navy);
  flex-shrink: 0;
}

.msa-consult-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--msa-navy);
  margin: 0;
  font-style: italic;
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

.btn-cta-outline {
  background-color: transparent;
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 2rem;
}

.btn-cta-outline:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
}
</style>
