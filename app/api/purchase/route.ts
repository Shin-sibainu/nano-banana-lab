import { NextResponse } from 'next/server';

// Mock user credits (in production, this would be in a database)
let userCredits = 25;

const PACK_CREDITS = {
  small: 50,
  pro: 220, // 200 + 10% bonus
  studio: 720, // 600 + 20% bonus
};

export async function POST(request: Request) {
  const { pack }: { pack: keyof typeof PACK_CREDITS } = await request.json();
  
  if (!PACK_CREDITS[pack]) {
    return NextResponse.json({ error: 'Invalid pack' }, { status: 400 });
  }
  
  userCredits += PACK_CREDITS[pack];
  
  return NextResponse.json({ balance: userCredits });
}