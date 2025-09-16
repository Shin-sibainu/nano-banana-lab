import { NextResponse } from 'next/server';

// Import jobs from generate route (in production, use shared database)
const jobs = new Map();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;
  
  // Since we can't import the jobs Map from generate route in this mock,
  // we'll simulate the job state based on when it might have been created
  const mockJob = {
    id: jobId,
    status: 'succeeded',
    progress: 100,
    resultUrls: [
      `https://placehold.co/1024x1024?text=Result+${jobId.slice(0, 6)}`,
    ],
    createdAt: new Date().toISOString(),
    inputs: {}
  };
  
  return NextResponse.json(mockJob);
}