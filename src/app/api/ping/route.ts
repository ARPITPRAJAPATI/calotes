// Edge Runtime ping route — used by BetterStack for zero-CPU uptime monitoring.
// Edge Runtime = no Node.js, no Mongoose, no Fluid CPU charge. Just instant 200 OK.
export const runtime = 'edge';

export async function GET() {
  return new Response(
    JSON.stringify({ status: 'ok', service: 'calotes.in', ts: Date.now() }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // No CDN cache — BetterStack must always get a fresh response
        'Cache-Control': 'no-store',
      },
    }
  );
}
