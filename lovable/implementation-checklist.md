# Add SNHP autonomous lead generation system to Lovable

## Option A: Start from GitHub sync
1. Push this repository to GitHub.
2. In Lovable, create or open the SNHP project.
3. Connect the project to GitHub from project settings.
4. Point Lovable to this repository and sync the code.
5. Ask Lovable to convert `autonomous-lead-system.html`, `automation.js`, and the marketing files into a full-stack Lovable app using the prompt in `lovable/snhp-autonomous-lead-system-prompt.md`.

## Option B: Start from prompt
1. Create a new Lovable project named `SNHP Autonomous Lead Engine`.
2. Paste the complete prompt from `lovable/snhp-autonomous-lead-system-prompt.md`.
3. Upload or paste the existing static pages as reference files.
4. Connect Lovable Cloud or Supabase.
5. Apply the SQL in `lovable/supabase-schema.sql`.
6. Add the Edge Functions in `lovable/edge-functions/` for daily queue creation and lead scoring.

## Environment variables and secrets
Configure these only inside Lovable/Supabase secrets, never in Git:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`
- `RESEND_API_KEY`
- `MAKE_WEBHOOK_URL` or `ZAPIER_WEBHOOK_URL`
- `GOOGLE_BUSINESS_PROFILE_WORKFLOW_URL`

## Launch acceptance checklist
- Daily queue is automatically created every morning by `lovable/edge-functions/daily-queue/index.ts`.
- Lead form requires consent before any call/text workflow is marked approved.
- Lead score appears immediately after lead creation through `lovable/edge-functions/score-lead/index.ts`.
- Qualified leads create same-day follow-up tasks.
- Public copy says "may qualify" or "depending on your plan".
- Public copy does not ask for Medicaid IDs, diagnoses, birth dates, or card photos.
- Dashboard shows progress toward 10 qualified leads per day.
- CSV export works for backup and reporting.
