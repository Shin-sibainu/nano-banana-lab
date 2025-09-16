'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, RotateCcw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { Job } from '@/lib/types';
import { apiClient } from '@/lib/client';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiClient.get<Job[]>('/history');
      setJobs(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('履歴の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = async (job: Job) => {
    try {
      const result = await apiClient.post<{ jobId: string }>('/generate', {
        presetId: job.presetId,
        inputs: job.inputs,
      });
      
      toast.success(`再生成ジョブを開始しました: ${result.jobId}`);
    } catch (error) {
      console.error('Rerun failed:', error);
      toast.error('再生成に失敗しました');
    }
  };

  const handleCopyShareLink = (job: Job) => {
    const shareUrl = `${window.location.origin}/result/${job.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('共有リンクをコピーしました');
  };

  const handleDelete = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    toast.success('ジョブを削除しました');
  };

  const getStatusBadge = (status: Job['status']) => {
    const variants = {
      queued: 'secondary',
      running: 'default',
      succeeded: 'success',
      failed: 'destructive',
    } as const;

    const labels = {
      queued: 'キュー',
      running: '実行中',
      succeeded: '完了',
      failed: '失敗',
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-extrabold gradient-text mb-4">生成履歴</h1>
        <div className="w-24 h-1 gradient-bg mx-auto rounded-full mb-6"></div>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
          過去の生成ジョブの履歴を確認できます。再実行や共有リンクの取得も可能です。
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="modern-card p-12 rounded-3xl max-w-md mx-auto">
            <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-2xl">📝</div>
            </div>
            <p className="text-muted-foreground text-lg mb-6">まだ生成履歴がありません。</p>
            <Button asChild className="gradient-animated text-white border-0 shadow-glow hover:shadow-glow-hover hover:scale-105 transition-all duration-300">
            <a href="/">プリセットから始める</a>
          </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map(job => (
            <Card key={job.id} className="modern-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl gradient-text">
                      ジョブ ID: {job.id}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {new Date(job.createdAt).toLocaleString('ja-JP')}
                      {job.presetId && ` • プリセット: ${job.presetId}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Input Preview */}
                  <div className="lg:col-span-1 space-y-3">
                    <h4 className="font-semibold text-lg gradient-text">入力情報</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(job.inputs).map(([key, value]) => (
                        <div key={key} className="p-3 glass rounded-lg">
                          <span className="text-muted-foreground">{key}:</span>
                          <br />
                          {typeof value === 'string' && value.startsWith('data:image') ? (
                            <div className="mt-1">
                              <Image
                                src={value}
                                alt="Input"
                                width={80}
                                height={80}
                                className="rounded object-cover"
                              />
                            </div>
                          ) : (
                            <span className="break-words">
                              {String(value).length > 50 
                                ? `${String(value).substring(0, 50)}...` 
                                : String(value)
                              }
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Results */}
                  <div className="lg:col-span-2">
                    {job.resultUrls && job.resultUrls.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg gradient-text">生成結果</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {job.resultUrls.map((url, index) => (
                            <div key={index} className="aspect-square relative rounded-2xl overflow-hidden shadow-glow hover:shadow-glow-hover transition-all duration-300">
                              <Image
                                src={url}
                                alt={`Result ${index + 1}`}
                                fill
                                className="object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : job.status === 'running' ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        生成中... ({job.progress}%)
                      </div>
                    ) : job.status === 'failed' ? (
                      <div className="flex items-center justify-center h-32 text-destructive">
                        生成に失敗しました
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        キューで待機中...
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1 space-y-2">
                    <h4 className="font-semibold text-lg gradient-text">アクション</h4>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline" 
                        className="glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                        size="sm"
                        onClick={() => handleRerun(job)}
                        disabled={job.status === 'running' || job.status === 'queued'}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        再実行
                      </Button>
                      <Button
                        variant="outline"
                        className="glass border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                        size="sm"
                        onClick={() => handleCopyShareLink(job)}
                        disabled={job.status !== 'succeeded'}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        共有リンク
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}