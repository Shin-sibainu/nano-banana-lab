"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ParameterForm } from "@/components/ParameterForm";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw } from "lucide-react";
import type { Job } from "@/lib/types";
import { apiClient } from "@/lib/client";
import { getPresetById } from "@/lib/presets";
import { useConsent } from "@/lib/consent";
import { toast } from "sonner";

export default function PresetDetailPage() {
  const params = useParams();
  const presetId = params.id as string;

  const preset = useMemo(() => getPresetById(presetId), [presetId]);
  const [formValues, setFormValues] = useState<Record<string, any>>(
    () => preset?.sampleInputs || {}
  );
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const { consent } = useConsent();

  const missingPresetNotified = useRef(false);

  useEffect(() => {
    if (preset) {
      setFormValues(preset.sampleInputs || {});
      missingPresetNotified.current = false;
      return;
    }

    if (!missingPresetNotified.current) {
      toast.error("プリセットが見つかりませんでした");
      missingPresetNotified.current = true;
    }
  }, [preset, presetId]);

  const handleGenerate = async () => {
    if (!preset) return;

    // Create a temporary job for UI
    const tempJob: Job = {
      id: `job_${Date.now()}`,
      presetId: preset.id,
      inputs: formValues,
      status: "running",
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setCurrentJob(tempJob);
    toast.success("生成を開始しました");

    // Simulate progress
    const progressInterval = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev || prev.progress >= 90) return prev;
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 500);

    try {
      // Call the generate API directly
      const result = await apiClient.post<{ resultUrls: string[], status: string }>("/generate", {
        presetId: preset.id,
        inputs: formValues,
      });

      clearInterval(progressInterval);

      if (result.resultUrls && result.resultUrls.length > 0) {
        const completedJob: Job = {
          ...tempJob,
          status: 'succeeded',
          progress: 100,
          resultUrls: result.resultUrls
        };

        handleJobUpdate(completedJob);
      } else {
        throw new Error('画像が生成されませんでした');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Generation failed:", error);
      setCurrentJob(null);
      toast.error("生成に失敗しました");
    }
  };

  const handleJobUpdate = (updatedJob: Job) => {
    setCurrentJob(updatedJob);

    if (updatedJob.status === "succeeded") {
      setCompletedJobs((prev) => [updatedJob, ...prev]);
      setCurrentJob(null);
      toast.success("生成が完了しました！");
    } else if (updatedJob.status === "failed") {
      setCurrentJob(null);
      toast.error("生成に失敗しました");
    }
  };

  const handleRerun = (job: Job) => {
    setFormValues(job.inputs);
    handleGenerate();
  };

  const handleCopyShareLink = (job: Job) => {
    const shareUrl = `${window.location.origin}/result/${job.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("共有リンクをコピーしました");
  };

  const canGenerate = () => {
    if (!preset) return false;

    // モックなので必須フィールドチェックも緩める（画像なしでも生成可能に）
    return true;
  };

  if (!preset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">プリセットが見つかりませんでした</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-6 p-6 modern-card rounded-3xl border-0">
          <Image
            src={preset.coverUrl}
            alt={preset.title}
            width={80}
            height={80}
            className="rounded-2xl object-cover shadow-glow"
          />
          <div>
            <h1 className="text-4xl font-extrabold gradient-text mb-2">
              {preset.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-3">
              {preset.description}
            </p>
            <div className="flex gap-2 mt-2">
              {preset.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">
              パラメータ設定
            </CardTitle>
            <CardDescription>
              生成したい画像の詳細を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParameterForm
              params={preset.params}
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleGenerate}
              isGenerating={!!currentJob}
              canGenerate={canGenerate()}
            />
          </CardContent>
        </Card>

        {/* Right: Recent Results */}
        <Card className="modern-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">生成結果</CardTitle>
            <CardDescription>
              {currentJob ? "生成中..." : "生成結果が表示されます"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Job Status */}
            {currentJob && (
              <div className="p-4 glass rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {currentJob.status === "queued" && "待機中..."}
                    {currentJob.status === "running" && "生成中..."}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {currentJob.progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 ? (
              <div className="space-y-4">
                {completedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="space-y-3">
                    {job.resultUrls?.map((url, index) => (
                      <div
                        key={index}
                        className="aspect-square relative rounded-xl overflow-hidden shadow-glow hover:shadow-glow-hover transition-all duration-300 group"
                      >
                        <Image
                          src={url}
                          alt={`Result ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `result-${job.id}-${index}.png`;
                              link.click();
                            }}
                          >
                            ダウンロード
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 glass"
                        onClick={() => handleRerun(job)}
                      >
                        再実行
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 glass"
                        onClick={() => handleCopyShareLink(job)}
                      >
                        共有
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !currentJob && (
                <div className="p-12 text-center text-muted-foreground">
                  <p>まだ生成結果がありません</p>
                  <p className="text-sm mt-2">
                    生成を開始すると、ここに結果が表示されます
                  </p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}