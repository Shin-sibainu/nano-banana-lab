"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Job } from "@/lib/types";

interface GenerationResultProps {
  jobId: string | null;
  onReset?: () => void;
}

export function GenerationResult({ jobId, onReset }: GenerationResultProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          throw new Error("ジョブの取得に失敗しました");
        }

        const jobData: Job = await response.json();
        setJob(jobData);

        // ジョブが完了していない場合は再度ポーリング
        if (jobData.status === "queued" || jobData.status === "running") {
          setTimeout(pollJobStatus, 2000); // 2秒ごとにポーリング
        }
      } catch (err) {
        console.error("Job polling error:", err);
        setError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    };

    pollJobStatus();
  }, [jobId]);

  if (!jobId || !job) {
    return null;
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case "queued":
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case "succeeded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case "queued":
        return "待機中...";
      case "running":
        return "生成中...";
      case "succeeded":
        return "完了！";
      case "failed":
        return "エラーが発生しました";
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated-${jobId}-${index}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* ステータス表示 */}
      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-sm text-muted-foreground">
              ジョブID: {jobId.slice(0, 8)}...
            </p>
          </div>
        </div>
        {job.progress > 0 && job.status === "running" && (
          <div className="flex items-center gap-2">
            <Progress value={job.progress} className="w-32" />
            <span className="text-sm text-muted-foreground">{job.progress}%</span>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {(job.status === "failed" || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "生成処理中にエラーが発生しました。もう一度お試しください。"}
          </AlertDescription>
        </Alert>
      )}

      {/* 生成結果の表示 */}
      {job.status === "succeeded" && job.resultUrls && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">生成結果</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {job.resultUrls.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border bg-card"
              >
                <div className="aspect-square relative">
                  <Image
                    src={url}
                    alt={`生成結果 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => downloadImage(url, index)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    ダウンロード
                  </Button>
                </div>
                {job.resultUrls!.length > 1 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-xs">
                    バリエーション {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      {job.status === "succeeded" && (
        <div className="flex gap-3">
          <Button onClick={onReset} variant="outline" className="flex-1">
            新しく生成する
          </Button>
          <Button
            onClick={() => {
              if (job.resultUrls) {
                job.resultUrls.forEach((url, i) => downloadImage(url, i));
              }
            }}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            すべてダウンロード
          </Button>
        </div>
      )}

      {job.status === "failed" && (
        <Button onClick={onReset} className="w-full">
          もう一度試す
        </Button>
      )}
    </div>
  );
}