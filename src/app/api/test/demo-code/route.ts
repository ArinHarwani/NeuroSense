import { NextRequest, NextResponse } from 'next/server';
import { submitServerDemoCode } from '@/services/serverState';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body.code;
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const session = await submitServerDemoCode(code);
    return NextResponse.json({
      status: session.state,
      result: session.result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'INVALID_TEST_CODE',
        message: 'No reference profile found. Please enter a valid reference code.',
      },
      { status: 404 }
    );
  }
}
