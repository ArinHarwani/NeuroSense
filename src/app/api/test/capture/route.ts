import { NextResponse } from 'next/server';
import { captureServerInput } from '@/services/serverState';

export async function POST() {
  const session = captureServerInput();
  return NextResponse.json({
    testId: session.testId,
    status: session.state,
    hardwareFeedback: session.hardwareFeedback,
  });
}
