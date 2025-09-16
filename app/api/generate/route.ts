import { NextResponse } from 'next/server';
import type { GenerateRequest, Job } from '@/lib/types';
import { generateWithGemini, buildPrompt } from '@/lib/gemini';
import { getPresetById } from '@/lib/presets';

// In-memory job storage (replace with database in production)
const jobs = new Map<string, Job>();

export async function POST(request: Request) {
  const data: GenerateRequest = await request.json();

  // Generate job ID
  const jobId = Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Create job
  const job: Job = {
    id: jobId,
    presetId: data.presetId,
    inputs: data.inputs,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
  };

  // Store job
  jobs.set(jobId, job);

  // Start processing with Gemini API
  processJobWithGemini(jobId, data);

  return NextResponse.json({ jobId });
}

async function processJobWithGemini(jobId: string, data: GenerateRequest) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    // Update status to running
    job.status = 'running';
    job.progress = 10;
    jobs.set(jobId, job);

    // Get API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get preset if provided
    const preset = data.presetId ? getPresetById(data.presetId) : null;

    // Build prompt and collect images
    let prompt = '';
    const images: string[] = [];

    if (preset) {
      // Debug: Log inputs
      console.log('Preset inputs:', data.inputs);
      console.log('Preset template:', preset.promptTemplate);

      // Build prompt from template
      prompt = buildPrompt(preset.promptTemplate, data.inputs);

      // Collect image inputs
      preset.params.forEach(param => {
        if (param.type === 'image' && data.inputs[param.id]) {
          images.push(data.inputs[param.id]);
        }
      });

      // Debug: Log built prompt
      console.log('Built prompt:', prompt);
    } else {
      // Custom prompt
      prompt = data.prompt || '';
      if (data.images) {
        images.push(...data.images);
      }
    }

    // Validate prompt
    if (!prompt || prompt.trim() === '') {
      throw new Error('プロンプトが空です。パラメータを確認してください。');
    }

    // Update progress
    job.progress = 30;
    jobs.set(jobId, job);

    // Call Gemini API
    console.log('Generating with Gemini:', {
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
      imageCount: images.length
    });
    const result = await generateWithGemini(apiKey, prompt, images);

    // Update progress
    job.progress = 80;
    jobs.set(jobId, job);

    // For now, Gemini 2.5 Flash returns text, not images
    // In production, integrate with an actual image generation service
    console.log('Gemini response:', result);

    // Mark as complete with placeholder result
    job.status = 'succeeded';
    job.progress = 100;
    job.resultUrls = [
      `https://placehold.co/1024x1024?text=Generated+${jobId.slice(0, 6)}`,
      ...(data.variants && data.variants > 1
        ? Array(data.variants - 1).fill(0).map((_, i) =>
            `https://placehold.co/1024x1024?text=Variant+${i+1}`)
        : [])
    ];

    jobs.set(jobId, job);

  } catch (error) {
    console.error('Generation error:', error);
    job.status = 'failed';
    job.progress = 0;
    jobs.set(jobId, job);
  }
}

// Fallback mock processing (for demo purposes)
async function processJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  // Update status to running
  job.status = 'running';
  jobs.set(jobId, job);

  // Simulate processing with progress updates
  const progressSteps = [20, 40, 60, 80, 100];

  for (const progress of progressSteps) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

    const currentJob = jobs.get(jobId);
    if (!currentJob) return;

    currentJob.progress = progress;

    if (progress === 100) {
      currentJob.status = 'succeeded';
      currentJob.resultUrls = [
        `https://placehold.co/1024x1024?text=Result+${jobId.slice(0, 6)}`,
        ...(Math.random() > 0.5 ? [`https://placehold.co/1024x1024?text=Variant+${jobId.slice(0, 6)}`] : [])
      ];
    }

    jobs.set(jobId, currentJob);
  }
}