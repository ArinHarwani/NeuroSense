import { NextResponse } from 'next/server';
import { startNewServerTest } from '@/services/serverState';

export async function POST() {
  const session = startNewServerTest();
  return NextResponse.json({
    testId: session.testId,
    status: session.state,
  });
}
