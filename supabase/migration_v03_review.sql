-- v0.3: review workflow support
-- 1) allow 'merged' status on raw intake
alter table raw_reports drop constraint if exists raw_reports_ingestion_status_check;
alter table raw_reports add constraint raw_reports_ingestion_status_check
  check (ingestion_status in ('new','normalized','rejected','needs_review','published','merged'));

-- 2) multi-source support on events (skip if already added)
alter table events add column if not exists source_urls text[];

-- 3) policies for the authenticated admin user
--    (anon still has zero access to raw_reports; public read on reports/events unchanged)
create policy "auth read raw_reports" on raw_reports
  for select to authenticated using (true);

create policy "auth update raw_reports" on raw_reports
  for update to authenticated using (true) with check (true);

create policy "auth insert reports" on reports
  for insert to authenticated with check (true);

create policy "auth update events" on events
  for update to authenticated using (true) with check (true);
