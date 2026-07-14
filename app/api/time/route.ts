// app/api/time/route.ts

export async function GET() {
  return Response.json({
    now: new Date().toString(),
    iso: new Date().toISOString(),
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}