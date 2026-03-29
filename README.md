# Main Street Advisors UI

Frontend application for Main Street Advisors LTD (MSA), built with Vue 3, TypeScript, Vite, Pinia, Vue Router, and Bootstrap 5.

This repository contains the client-facing marketing funnel and authenticated UI flows for onboarding, authentication, and advisor-client interactions.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia
- Bootstrap 5
- Axios
- Vitest + Vue Test Utils
- Playwright

## Requirements

- Node.js: `^20.19.0 || >=22.12.0`
- npm: current LTS-compatible version

## Quick Start

```sh
npm install
npm run dev
```

App runs on the Vite development server and supports hot module reload.

## Scripts

- `npm run dev`: start local dev server
- `npm run build`: type-check and build production assets
- `npm run preview`: preview production build locally
- `npm run test:unit`: run unit tests (Vitest)
- `npm run test:e2e`: run end-to-end tests (Playwright)
- `npm run lint`: run oxlint + eslint with fixes
- `npm run format`: run Prettier on `src/`

## Project Structure

```text
src/
  components/
    layout/
      NavBar.vue
      FooterBar.vue
  router/
    index.ts
  services/
    api.ts
    authService.ts
  stores/
    auth.ts
  views/
    HomeView.vue
    auth/
      LoginView.vue
      SignupView.vue
      MfaView.vue
      VerifyEmailView.vue
  App.vue
  main.ts
```

## Domain Context

The UI supports MSA's advisory model:

- Prospect education and conversion funnel
- Client account creation and authentication
- Role-based experiences for clients, advisors, supervisors, and associates
- Compliance-oriented workflows and auditable user interactions

Backend and integration direction:

- API: .NET Core
- OpenAPI definition: `meta/openapi.yaml`
- Cloud platform: Microsoft Azure
- Planned integrations: Google OAuth, Fidelity read-only brokerage integration, Plaid, Twilio/Azure Communication Services, Stripe, DocuSign

## Testing

Unit tests:

```sh
npm run test:unit
```

E2E tests:

```sh
npx playwright install
npm run test:e2e
```

## Notes

- This repo currently focuses on the UI layer and client-side app behavior.
- Compliance and audit persistence are expected to be enforced primarily by backend services and APIs.
