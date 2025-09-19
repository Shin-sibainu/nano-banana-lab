'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Sparkles, Zap, Wand2 } from 'lucide-react';
import type { Job } from '@/lib/types';
import { cn } from '@/lib/utils';

interface JobStatusBarProps {
  job: Job;
  onUpdate?: (job: Job) => void;
}

export function JobStatusBar({ job, onUpdate }: JobStatusBarProps) {
  const [currentJob, setCurrentJob] = useState(job);
  const [dots, setDots] = useState('');

  // Update job state when prop changes
  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  // Animated dots
  useEffect(() => {
    if (currentJob.status === 'running') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentJob.status]);

  const getStatusIcon = () => {
    switch (currentJob.status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (currentJob.status) {
      case 'queued':
        return 'キューに追加済み';
      case 'running':
        return `生成中${dots}`;
      case 'succeeded':
        return '完了';
      case 'failed':
        return '失敗';
      default:
        return '不明';
    }
  };

  const getProgressMessage = () => {
    const progress = currentJob.progress || 0;
    if (progress < 20) return 'プロンプトを準備中...';
    if (progress < 40) return '画像を解析中...';
    if (progress < 60) return 'AIモデルに送信中...';
    if (progress < 80) return '画像を生成中...';
    if (progress < 95) return '最終処理中...';
    return '完了処理中...';
  };

  const getStatusVariant = () => {
    switch (currentJob.status) {
      case 'succeeded':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div className="space-y-4 p-6 modern-card rounded-2xl border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-base font-semibold gradient-text">生成結果</span>
        </div>
        <Badge variant={getStatusVariant()} className="px-4 py-2 text-sm font-semibold">
          {getStatusText()}
        </Badge>
      </div>

      {(currentJob.status === 'queued' || currentJob.status === 'running') && (
        <div className="space-y-3">
          {/* Enhanced progress bar */}
          <div className="relative">
            <Progress
              value={currentJob.progress}
              className={cn(
                "w-full h-4 rounded-full transition-all duration-500",
                currentJob.status === 'running' && "shadow-lg shadow-blue-500/25"
              )}
            />
            {currentJob.status === 'running' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                  <Zap className="h-3 w-3 text-white animate-pulse delay-100" />
                  <Wand2 className="h-3 w-3 text-white animate-pulse delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Progress details */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {getProgressMessage()}
            </p>
            <p className="text-lg font-bold gradient-text">
              {currentJob.progress}%
            </p>
          </div>

          {/* Estimated time (if running) */}
          {currentJob.status === 'running' && currentJob.progress > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              予想残り時間: {Math.max(1, Math.round((100 - currentJob.progress) * 0.3))}秒
            </p>
          )}
        </div>
      )}
    </div>
  );
}