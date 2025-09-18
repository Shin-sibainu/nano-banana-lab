'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/ImageUploader';
import { JobStatusBar } from '@/components/JobStatusBar';
import { toast } from 'sonner';
import { apiClient } from '@/lib/client';
import type { Job } from '@/lib/types';
import Image from 'next/image';

export default function LabPage() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState(1);
  const [seed, setSeed] = useState('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('プロンプトを入力してください');
      return;
    }

    // Create a temporary job for UI
    const tempJob: Job = {
      id: `job_${Date.now()}`,
      inputs: { prompt, variants, seed, images },
      status: 'running',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setCurrentJob(tempJob);
    toast.success('生成を開始しました');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev || prev.progress >= 90) return prev;
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 500);

    try {
      // Call the generate API directly
      const response = await apiClient.post<{ resultUrls: string[], status: string }>('/generate', {
        prompt,
        images,
        variants
      });

      clearInterval(progressInterval);

      if (response.resultUrls && response.resultUrls.length > 0) {
        const completedJob: Job = {
          ...tempJob,
          status: 'succeeded',
          progress: 100,
          resultUrls: response.resultUrls
        };

        handleJobUpdate(completedJob);
      } else {
        throw new Error('画像が生成されませんでした');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Generation failed:', error);
      setCurrentJob(null);
      toast.error('生成に失敗しました');
    }
  };

  // Remove mock progress effect - we're now using real API

  const handleJobUpdate = (updatedJob: Job) => {
    setCurrentJob(updatedJob);

    if (updatedJob.status === 'succeeded') {
      setCompletedJobs(prev => [updatedJob, ...prev]);
      setCurrentJob(null);
      toast.success('生成が完了しました！');
    } else if (updatedJob.status === 'failed') {
      setCurrentJob(null);
      toast.error('生成に失敗しました');
    }
  };

  const addImage = (image: string | undefined) => {
    if (image) {
      setImages(prev => [...prev, image]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold gradient-text mb-4">フリージェネレーション・ラボ</h1>
        <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
          自由にプロンプトを入力して画像を生成できます。参考画像をアップロードして、より詳細な指示も可能です。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="modern-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">生成設定</CardTitle>
              <CardDescription>
                プロンプトと生成パラメータを設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">プロンプト *</Label>
                <Textarea
                  id="prompt"
                  placeholder="生成したい画像の説明を詳細に入力してください..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variants">生成数</Label>
                <Input
                  id="variants"
                  type="number"
                  min="1"
                  max="4"
                  value={variants}
                  onChange={(e) => setVariants(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seed">シード値（オプション）</Label>
                <Input
                  id="seed"
                  placeholder="再現性のためのシード値"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || !!currentJob}
                className="w-full py-3 text-lg font-semibold gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105 transition-all duration-300"
                size="lg" 
              >
                {currentJob ? '生成中...' : '生成する'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reference Images & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reference Images */}
          <Card className="modern-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">参考画像</CardTitle>
              <CardDescription>
                生成の参考にする画像をアップロード（オプション）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                value=""
                onChange={addImage}
              />
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`Reference ${index + 1}`}
                        width={150}
                        height={150}
                        className="rounded-lg object-cover w-full aspect-square"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Job Status */}
          {currentJob && (
            <JobStatusBar
              job={currentJob}
              onUpdate={handleJobUpdate}
            />
          )}

          {/* Results */}
          {completedJobs.length > 0 && (
            <Card className="modern-card border-0">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text">生成結果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {completedJobs.map(job => (
                  <div key={job.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {new Date(job.createdAt).toLocaleString('ja-JP')}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                        onClick={() => {
                          if (job.inputs.prompt) {
                            setPrompt(job.inputs.prompt as string);
                            setVariants(job.inputs.variants as number || 1);
                            setSeed(job.inputs.seed as string || '');
                          }
                        }}
                      >
                        設定を復元
                      </Button>
                    </div>
                    
                    {job.inputs.prompt && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{job.inputs.prompt as string}</p>
                      </div>
                    )}

                    {job.resultUrls && job.resultUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {job.resultUrls.map((url, index) => (
                          <Image
                            key={index}
                            src={url}
                            alt={`Result ${index + 1}`}
                            width={300}
                            height={300}
                            className="rounded-lg object-cover w-full aspect-square hover:scale-105 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}