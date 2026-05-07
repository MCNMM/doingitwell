# Lovable prompt: SNHP autonomous lead generation system

Build a production-ready web app for Southern Nevada Health Pass named **SNHP Autonomous Lead Engine**. The app must help staff generate 10 qualified organic Medicaid leads per day from Molina Healthcare of Nevada, SilverSummit Healthplan, and Nevada Medicaid Fee-for-Service members in Southern Nevada.

## Product goals
- Autonomously create a daily organic outreach queue across Facebook groups, Google Business Profile, Reddit, Nextdoor, short-form video, partner outreach, and website/checklist leads.
- Capture leads with explicit call/text consent, plan type, source, need, county, and next step.
- Score and prioritize leads automatically.
- Generate compliant channel-specific outreach copy with "may qualify" and "depending on your plan" language.
- Schedule same-day and next-day follow-up tasks automatically.
- Provide admin dashboards for lead source performance, daily progress toward 10 leads, and follow-up aging.
- Keep PHI and Medicaid ID data out of the product unless a HIPAA-compliant intake path is separately approved.

## Required pages
1. Public landing page with plan cards for Molina, SilverSummit, Nevada Medicaid Fee-for-Service, and "Not sure".
2. Benefits checklist lead magnet page with SMS CTA: `Text CHECKLIST to 702-867-1223`.
3. Lead intake page with consent checkbox and privacy warning.
4. Staff dashboard showing daily leads, qualified leads, open tasks, source performance, and follow-up queue.
5. Campaign generator page that creates posts, comments, partner outreach, Google Business Profile posts, and short video scripts.
6. Partner directory page for food pantries, churches, schools, pregnancy resources, disability groups, housing resources, and recovery groups.
7. Compliance/audit page showing consent events, outreach history, and privacy guardrails.

## Database requirements
Use Supabase or Lovable Cloud with tables from `lovable/supabase-schema.sql`:
- `leads`
- `consent_events`
- `outreach_tasks`
- `campaign_messages`
- `partners`
- `source_daily_metrics`
- `audit_logs`

## Automation rules
- Every day at 8:00 AM Pacific, create the daily task queue:
  - 15 Facebook group interactions
  - 2 short-form videos
  - 1 Google Business Profile post or Q&A update
  - 5 Reddit/Nextdoor helpful replies
  - 5 partner outreach messages
  - same-day follow-up review
- When a lead is created, calculate score:
  - +35 for explicit call/text consent
  - +25 for phone number
  - +20 for Molina, SilverSummit, or Nevada Medicaid Fee-for-Service plan identified
  - +10 for high-intent need: transportation, wellness rewards, pregnancy resources, provider/card help
  - +10 for high-intent source: Google Business Profile, website checklist, or partner referral
- If score is 70 or above, mark the lead as qualified and create an immediate follow-up task.
- If the lead is not reached same day, create a next-day follow-up task.
- Generate weekly source reports showing actual leads, qualified leads, and conversion rate by channel.

## Messaging requirements
Always include:
- Southern Nevada Health Pass name
- Call/text CTA: 702-867-1223
- Target plans: Molina, SilverSummit, Nevada Medicaid Fee-for-Service
- Privacy warning when asking for comments or replies
- "May qualify" or "depending on your plan" language

Never include:
- Guaranteed benefits unless verified by the plan
- Claims that SNHP represents Molina, SilverSummit, or Nevada Medicaid
- Requests for Medicaid IDs, diagnoses, birth dates, or card photos in public comments

## Design direction
Use a clean healthcare/community-resource look:
- Trustworthy navy, teal, green, and white palette
- Mobile-first cards
- Large CTAs
- Accessible labels and contrast
- Dashboard metrics with progress toward 10 leads/day

## Integrations to prepare but not hard-code
Create settings screens and environment-variable placeholders for:
- Twilio or approved SMS provider
- Resend or approved email provider
- Google Business Profile workflow notes
- Meta/Facebook workflow notes for approved organic posting only
- Zapier/Make webhook URL for optional outbound automations

Do not store API keys in source code. Use Lovable/Supabase secrets or environment variables.
