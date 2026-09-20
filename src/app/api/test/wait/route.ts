import { NextResponse } from 'next/server';
import { waitServerInput } from '@/services/serverState';

export async function POST() {
  const session = waitServerInput();
  return NextResponse.json({
    status: session.state,
    testId: session.testId,
  });
}
