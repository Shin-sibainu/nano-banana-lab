import { NextResponse } from 'next/server';

// Mock user credits
let userCredits = 25;

export async function GET() {
  return NextResponse.json({ balance: userCredits });
}