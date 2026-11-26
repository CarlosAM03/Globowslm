-- Run as the migration role. The provisioner creates globows_runtime without
-- elevated attributes and provides its password separately.
BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO globows_runtime;

DO $$
DECLARE
  app_table text;
BEGIN
  FOREACH app_table IN ARRAY ARRAY[
    'database_initialization', 'content_entries', 'content_revisions', 'media',
    'draft_media_refs', 'revision_media_refs', 'draft_entry_refs', 'revision_entry_refs',
    'audit_events', 'owners', 'sessions', 'login_challenges', 'rate_limit_buckets',
    'upload_tickets', 'media_preview_tickets'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', app_table);
    IF NOT EXISTS (
      SELECT FROM pg_policies
      WHERE schemaname = 'public' AND tablename = app_table AND policyname = 'globows_runtime'
    ) THEN
      EXECUTE format(
        'CREATE POLICY globows_runtime ON public.%I TO globows_runtime USING (true) WITH CHECK (true)',
        app_table
      );
    END IF;
    EXECUTE format('GRANT SELECT ON public.%I TO globows_runtime', app_table);
  END LOOP;
END $$;

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
GRANT INSERT, UPDATE ON public.content_entries, public.owners, public.sessions TO globows_runtime;
GRANT INSERT ON public.content_revisions, public.revision_media_refs, public.revision_entry_refs, public.audit_events TO globows_runtime;
GRANT INSERT, DELETE ON public.draft_media_refs, public.draft_entry_refs, public.media_preview_tickets TO globows_runtime;
GRANT INSERT, UPDATE, DELETE ON public.media, public.login_challenges, public.rate_limit_buckets, public.upload_tickets TO globows_runtime;

COMMIT;
