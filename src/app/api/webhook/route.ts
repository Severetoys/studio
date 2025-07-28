
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { adminApp } from '@/lib/firebase-admin';

const db = getDatabase(adminApp);

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-goog-channel-token');

  if (secret !== process.env.GOOGLE_SHEETS_WEBHOOK_SECRET) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Here you can process the data from your Google Sheet
    // For example, you can save it to your Firebase Realtime Database
    const ref = db.ref('google-sheets-data');
    await ref.push(data);

    return NextResponse.json({ success: true, message: 'Data received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
