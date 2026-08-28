export async function GET() {
  const supa = Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return Response.json({
    ok: true,
    app: 'rivo-mission-control',
    mode: supa ? 'supabase' : 'demo',
    ts: new Date().toISOString(),
  });
}
