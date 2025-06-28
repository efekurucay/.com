import { getLatestActivity } from '@/lib/github';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activity = await getLatestActivity();
    if (!activity) {
      return NextResponse.json({ error: 'No activity found' }, { status: 404 });
    }
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GitHub activity' }, { status: 500 });
  }
} 