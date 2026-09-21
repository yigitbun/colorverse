-- Image extraction stays browser-local in the MVP. Keep the reserved history
-- table private and remove its unused direct browser write surface until a
-- dedicated, validated RPC is needed.

revoke all on table public.extraction_runs from anon, authenticated;
