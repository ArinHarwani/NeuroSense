import { NextResponse } from 'next/server';
import { serverSession } from '@/services/serverState';

export async function GET() {
  return NextResponse.json(serverSession);
}
