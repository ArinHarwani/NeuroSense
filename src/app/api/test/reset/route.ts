import { NextResponse } from 'next/server';
import { resetServerSession } from '@/services/serverState';

export async function POST() {
  const session = resetServerSession();
  return NextResponse.json({
    status: session.state,
    testId: session.testId,
  });
}
