import { NextRequest } from 'next/server';
import { listeners, serverSession, ServerTestSession } from '@/services/serverState';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let listener: ((session: ServerTestSession) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      const initialPayload = `data: ${JSON.stringify({
        event: 'TEST_STATE_CHANGED',
        session: serverSession,
      })}\n\n`;
      controller.enqueue(encoder.encode(initialPayload));

      // Subscribe to changes
      listener = (session: ServerTestSession) => {
        try {
          const payload = `data: ${JSON.stringify({
            event: 'TEST_STATE_CHANGED',
            session,
          })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          if (listener) listeners.delete(listener);
        }
      };

      listeners.add(listener);
    },
    cancel() {
      if (listener) {
        listeners.delete(listener);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
