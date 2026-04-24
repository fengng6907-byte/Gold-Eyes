import { fetchGoldPrice } from '@/lib/goldPriceService';
import { SSE_INTERVAL_MS } from '@/lib/constants';

/**
 * GET /api/gold/stream
 * 
 * Server-Sent Events (SSE) endpoint for live gold price updates.
 * Pushes new price data to connected clients every SSE_INTERVAL_MS (10s).
 * 
 * Usage in frontend:
 *   const source = new EventSource('/api/gold/stream');
 *   source.onmessage = (e) => {
 *     const data = JSON.parse(e.data);
 *     console.log('Gold price:', data.usd);
 *   };
 * 
 * Events:
 *   - "message": Gold price update (same format as /api/gold/price)
 *   - "error": Error notification
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data immediately
      try {
        const initial = await fetchGoldPrice();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initial)}\n\n`)
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`)
        );
      }

      // Send periodic updates
      const interval = setInterval(async () => {
        try {
          const data = await fetchGoldPrice();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`)
          );
        }
      }, SSE_INTERVAL_MS);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Client disconnected
          clearInterval(interval);
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on abort (client disconnect)
      // Store interval IDs for potential cleanup
      const cleanup = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      };

      // The stream will be closed by the client or server
      // We rely on the heartbeat catch to detect disconnection
      void cleanup; // Reference to prevent unused warning
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// Prevent static generation — this must be dynamic
export const dynamic = 'force-dynamic';
