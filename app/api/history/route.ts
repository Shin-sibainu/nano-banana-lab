import { NextResponse } from 'next/server';
import type { Job } from '@/lib/types';

// Mock history data
const mockHistory: Job[] = [
  {
    id: 'job_123456',
    presetId: 'outfit-change',
    inputs: {
      person: 'data:image/jpeg;base64,/9j/4AAQ...', // Mock base64
      outfit_style: 'エレガントなイブニングドレス',
      same_pose: true
    },
    status: 'succeeded',
    progress: 100,
    resultUrls: ['https://placehold.co/1024x1024?text=Evening+Dress'],
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'job_789012',
    presetId: 'photo-restore',
    inputs: {
      photo: 'data:image/jpeg;base64,/9j/4AAQ...', // Mock base64
      denoise: true,
      tone: 'warm'
    },
    status: 'succeeded',
    progress: 100,
    resultUrls: ['https://placehold.co/1024x1024?text=Restored+Photo'],
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 'job_345678',
    inputs: {
      prompt: '美しい桜並木の風景',
      variants: 2,
      seed: '12345'
    },
    status: 'succeeded',
    progress: 100,
    resultUrls: [
      'https://placehold.co/1024x1024?text=Cherry+Blossoms+1',
      'https://placehold.co/1024x1024?text=Cherry+Blossoms+2'
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'job_901234',
    presetId: 'sketch-to-illustration',
    inputs: {
      linedraft: 'data:image/jpeg;base64,/9j/4AAQ...', // Mock base64
      style: 'アニメ風',
      quality: 'high'
    },
    status: 'running',
    progress: 60,
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  },
];

export async function GET() {
  return NextResponse.json(mockHistory);
}