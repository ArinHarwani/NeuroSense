import { NextResponse } from 'next/server';
import { analyzeServerTest } from '@/services/serverState';

export async function POST() {
  const session = analyzeServerTest();
  return NextResponse.json({
    testId: session.testId,
    status: session.state,
  });
}
