-- SNHP Autonomous Lead Engine schema for Lovable Cloud or Supabase.
-- Do not store Medicaid IDs, diagnoses, card photos, or full dates of birth in these tables.

create extension if not exists pgcrypto;

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  phone text,
  email text,
  plan_type text not null check (plan_type in ('Molina Healthcare of Nevada', 'SilverSummit Healthplan', 'Nevada Medicaid Fee-for-Service', 'Not sure', 'Other')),
  county text default 'Clark',
  source text not null,
  need text not null,
  consent_to_call_text boolean not null default false,
  score integer not null default 0 check (score >= 0 and score <= 100),
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'scheduled', 'closed', 'not_qualified')),
  next_step text,
  notes text
);

create table if not exists consent_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  consent_type text not null,
  consent_value boolean not null,
  consent_source text not null,
  consent_text text not null
);

create table if not exists outreach_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now(),
  due_at timestamptz not null,
  channel text not null,
  task_type text not null,
  title text not null,
  instructions text,
  status text not null default 'open' check (status in ('open', 'done', 'skipped', 'overdue')),
  expected_leads integer not null default 0
);

create table if not exists campaign_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  channel text not null,
  plan_focus text not null,
  message_body text not null,
  compliance_checked boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted', 'archived'))
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organization_name text not null,
  category text not null,
  contact_name text,
  contact_url text,
  phone text,
  email text,
  city text,
  status text not null default 'new' check (status in ('new', 'contacted', 'active', 'paused', 'declined')),
  last_contacted_at timestamptz,
  notes text
);

create table if not exists source_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  source text not null,
  tasks_completed integer not null default 0,
  leads_created integer not null default 0,
  qualified_leads integer not null default 0,
  unique (metric_date, source)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb
);

alter table leads enable row level security;
alter table consent_events enable row level security;
alter table outreach_tasks enable row level security;
alter table campaign_messages enable row level security;
alter table partners enable row level security;
alter table source_daily_metrics enable row level security;
alter table audit_logs enable row level security;

create policy "Authenticated users can manage leads" on leads for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage consent events" on consent_events for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage outreach tasks" on outreach_tasks for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage campaign messages" on campaign_messages for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage partners" on partners for all to authenticated using (true) with check (true);
create policy "Authenticated users can manage source metrics" on source_daily_metrics for all to authenticated using (true) with check (true);
create policy "Authenticated users can read audit logs" on audit_logs for select to authenticated using (true);
create policy "Authenticated users can insert audit logs" on audit_logs for insert to authenticated with check (true);
