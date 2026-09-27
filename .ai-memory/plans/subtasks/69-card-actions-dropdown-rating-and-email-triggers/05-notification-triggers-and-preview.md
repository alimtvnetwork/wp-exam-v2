# Subtask 05: Notification Trigger Modal & Sanitized Email Template Live Preview

> **/goal** Build a multi-channel notification trigger configuration modal and interactive live email template preview dock.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/components/forms/notification-trigger-modal.tsx`
- `src/components/forms/FormBuilder.tsx`

## Tasks
1. Notification Trigger Configuration Modal:
   - Channel selection: `Email`, `WhatsApp`, `Telegram`.
   - Event trigger: `On Form Submit`, `On Section Complete`, `On Score Threshold`.
   - Email Fields: `To`, `From Name`, `From Email`, `Reply-To`, `CC`, `BCC`, `Subject`, `Color Theme / Primary Hex`.
2. Live Preview Dock:
   - Renders the sanitized `assets/templates/email-template.html` template in an iframe or sandboxed container.
   - Interpolates form values and mock applicant data in real time.
3. FormBuilder Integration:
   - Add "Notifications / Triggers" button in top toolbar or Tools menu.
