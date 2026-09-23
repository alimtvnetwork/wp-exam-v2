# Wise vs. Stripe Payment Gateway Driver Strategy & Riseup Asia Theme Token Palette Alignment

Slug: wise-stripe-and-theme-tokens
Status: open
Raised: 2026-09-23
Blocking: Form monetization & visual branding customization

## Question

How should the WP Exam & Universal Form Engine architect its payment driver abstraction to reconcile real-time webhooks, asynchronous international bank transfers (Wise), and instant card checkouts (Stripe), while aligning JSON theme tokens with the proprietary Riseup Asia enterprise design system?

## Problem & Missing Capabilities in Current Architecture

1. **Synchronous vs. Asynchronous Settlement Divergence:** Stripe provides synchronous card authorization via Stripe Elements/Checkout with instant confirmation webhooks (`checkout.session.completed`), whereas Wise (formerly TransferWise) operates primarily on asynchronous multi-currency bank rails (ACH, SEPA, SWIFT) where payments may remain in `processing` status for 1–3 business days before settlement webhooks arrive.
2. **Unified Transaction Status Lifecycle:** A naive abstraction will break if it assumes instant completion. Submissions requiring payment must accommodate a pending escrow state where the applicant's submission is held until payment is verified.
3. **Riseup Asia Token Alignment:** The application mandates support for multiple themes (Dracula, VS Code, Microsoft Blue, Job Forms, Riseup Asia). The specific color space values and contrast tokens for "Riseup Asia" must be formalized to prevent visual fragmentation between the Laravel standalone app and the WordPress plugin embed.

## Options Considered

### Option A: Stripe-Only Instant Checkout (Simplest)

- **Architecture:** Restrict payment gateway support exclusively to Stripe Checkout and PaymentIntents.
- **Pros:** Instant webhook fulfillment, zero delayed pending state complexity, standardized worldwide credit/debit card support.
- **Cons:** Excludes direct multi-currency bank payouts and cross-border low-fee transfers commonly required across South/Southeast Asian developer hiring markets.

### Option B: Pluggable Multi-Driver Payment Gateway with Webhook State Machine (Recommended)

- **Architecture:** Implement a modular `PaymentGatewayManager` supporting swappable drivers (`StripeDriver`, `WiseDriver`) conforming to `App\Contracts\PaymentGatewayInterface`.
  - For Stripe: Dispatches `createCheckoutSession()` returning redirect URL; verifies cryptographic signature on `POST /api/v1/payments/webhook/stripe`.
  - For Wise: Dispatches `createTransferQuote()` and generates unique virtual IBAN/account payment reference; listens on `POST /api/v1/payments/webhook/wise` for `transfer.state-change` events.
  - Form submissions transition to `awaiting_payment` until the gateway webhook transitions `PaymentTransaction` to `completed`, automatically dispatching the candidate confirmation email.
  - Theme tokens are locked to the documented Riseup Asia design specification (`02-spec/21-app/21f-forms-spec/03-visual-and-ux.md`).
- **Pros:** Full coverage of global cards (Stripe) and low-cost Asian bank transfers (Wise); future-proof for PayPal or Razorpay additions; unified submission state machine.
- **Cons:** Requires background queue workers to monitor and expire stale pending Wise transfers.

### Option C: Manual Proof of Payment Upload

- **Architecture:** Candidate uploads a bank transfer receipt or transaction ID screenshot; an administrator manually verifies payment in the review console.
- **Pros:** Zero gateway API integrations, no transaction processing fees.
- **Cons:** High manual review friction, delayed applicant onboarding, poor user experience.

## Impact if Guessed Wrong

- Forcing Stripe-only alienates applicants in regions with restricted international card usage.
- Naive synchronous payment assumptions will mark Wise bank transfer submissions as failed prematurely.
- Unstandardized theme tokens will result in inconsistent button colors, unreadable input text, and broken dark mode contrast.

## Next Steps for User Review

Review the payment transaction schema in `02-spec/23-app-db/02-forms-and-project-tree-schema.md` and theme tokens in `02-spec/21-app/21f-forms-spec/03-visual-and-ux.md`.
