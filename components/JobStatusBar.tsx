'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Job } from '@/lib/types';

interface JobStatusBarProps {
  job: Job;
  onUpdate?: (job: Job) => void;
}

export function JobStatusBar({ job, onUpdate }: JobStatusBarProps) {
  const [currentJob, setCurrentJob] = useState(job);

  useEffect(() => {
    if (currentJob.status === 'running' || currentJob.status === 'queued') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/jobs/${currentJob.id}`);
          const updatedJob: Job = await response.json();
          setCurrentJob(updatedJob);
          onUpdate?.(updatedJob);
          
          if (updatedJob.status === 'succeeded' || updatedJob.status === 'failed') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Failed to fetch job status:', error);
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentJob.id, currentJob.status, onUpdate]);

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
        return '生成中...';
      case 'succeeded':
        return '完了';
      case 'failed':
        return '失敗';
      default:
        return '不明';
    }
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
    <div className="space-y-3 p-6 modern-card rounded-2xl border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-base font-semibold gradient-text">ジョブ ID: {currentJob.id}</span>
        </div>
        <Badge variant={getStatusVariant()} className="px-4 py-2 text-sm font-semibold">
          {getStatusText()}
        </Badge>
      </div>
      
      {(currentJob.status === 'queued' || currentJob.status === 'running') && (
        <div className="space-y-2">
          <Progress value={currentJob.progress} className="w-full h-3 rounded-full" />
          <p className="text-sm text-muted-foreground text-center font-medium">
            {currentJob.progress}% 完了
          </p>
        </div>
      )}
    </div>
  );
}