import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const subscribers = db.collection('subscribers');

    // Ensure index exists for unique email
    await subscribers.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    const existing = await subscribers.findOne({ email });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You're already on the priority update list! We'll notify you as new superpowers drop.",
      });
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    await subscribers.insertOne({
      email,
      createdAt: new Date(),
      source: 'change-firewall-trailer-site',
      userAgent,
      ip,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      alreadySubscribed: false,
      message: "🎉 You're in! You'll receive early access to new Change Firewall releases & MCP features.",
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to join update list. Please try again in a few moments.' },
      { status: 500 }
    );
  }
}
