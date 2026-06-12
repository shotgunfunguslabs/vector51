-- Vector51 v0.2 schema
-- Run in Supabase SQL editor. Public read, no public write.

create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  observed_at   timestamptz not null,
  city          text not null,
  state         char(2) not null,
  lat           double precision,
  lng           double precision,
  event_type    text not null,
  source_name   text not null,
  source_class  text not null check (source_class in
                  ('Community report','Public report','Media report','Agency-confirmed','Multi-source signal')),
  signal_level  text not null check (signal_level in ('Low','Medium','High')),
  summary       text,
  url           text,
  created_at    timestamptz not null default now()
);

create index if not exists reports_observed_at_idx on reports (observed_at desc);
create index if not exists reports_state_idx on reports (state);

create table if not exists signal_snapshots (
  id               uuid primary key default gen_random_uuid(),
  snapshot_at      timestamptz not null default now(),
  state            char(2) not null,
  activity_score   int not null check (activity_score between 0 and 100),
  tier             text not null check (tier in ('Quiet','Elevated','Active','Hot Zone')),
  report_count_7d  int not null default 0,
  change_7d_pct    numeric,
  unique (snapshot_at, state)
);

create index if not exists snapshots_state_time_idx on signal_snapshots (state, snapshot_at desc);

-- The app reads the latest snapshot per state through this view.
create or replace view latest_signal_snapshots as
  select distinct on (state) *
  from signal_snapshots
  order by state, snapshot_at desc;

-- Row level security: anonymous read-only.
alter table reports enable row level security;
alter table signal_snapshots enable row level security;

create policy "public read reports" on reports
  for select to anon using (true);

create policy "public read snapshots" on signal_snapshots
  for select to anon using (true);
