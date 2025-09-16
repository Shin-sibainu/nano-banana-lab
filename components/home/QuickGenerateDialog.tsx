"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParameterForm } from "@/components/ParameterForm";
import { GenerationResult } from "@/components/GenerationResult";
import type { Preset } from "@/lib/types";
import { useConsent } from "@/lib/consent";
import { toast } from "sonner";
import { generateImage } from "@/app/actions/generate";

// グローバルステートまたはコンテキストで管理することも可能
let dialogPreset: Preset | null = null;
let setDialogPreset: (preset: Preset | null) => void = () => {};

export function QuickGenerateDialog() {
  const [quickGeneratePreset, setQuickGeneratePreset] = useState<Preset | null>(
    null
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "result">("input");
  const { consent } = useConsent();

  // グローバルに公開
  dialogPreset = quickGeneratePreset;
  setDialogPreset = setQuickGeneratePreset;

  const handleGenerate = async () => {
    if (!quickGeneratePreset) return;

    setIsGenerating(true);
    try {
      const result = await generateImage({
        presetId: quickGeneratePreset.id,
        inputs: formValues,
      });

      if (result.success) {
        toast.success("生成を開始しました");
        setCurrentJobId(result.jobId);
        setActiveTab("result"); // 結果タブに切り替え
      } else {
        toast.error(result.error || "生成に失敗しました");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCurrentJobId(null);
    setActiveTab("input");
    // フォームの値を初期値にリセット
    if (quickGeneratePreset) {
      setFormValues(quickGeneratePreset.sampleInputs || {});
    }
  };

  const canGenerate = () => {
    if (!quickGeneratePreset) return false;

    const hasPersonalImage = quickGeneratePreset.params.some(
      (p) =>
        p.type === "image" && (p.id.includes("person") || p.id.includes("人物"))
    );

    if (hasPersonalImage && !consent.personalImages) {
      return false;
    }

    const requiredParams = quickGeneratePreset.params.filter((p) => p.required);
    return requiredParams.every((p) => formValues[p.id]);
  };

  return (
    <Dialog
      open={!!quickGeneratePreset}
      onOpenChange={() => {
        setQuickGeneratePreset(null);
        setCurrentJobId(null);
        setActiveTab("input");
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto modern-card border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">
            {quickGeneratePreset?.title}
          </DialogTitle>
        </DialogHeader>

        {quickGeneratePreset && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "input" | "result")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">パラメータ入力</TabsTrigger>
              <TabsTrigger value="result" disabled={!currentJobId}>
                生成結果
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="mt-6">
              <ParameterForm
                params={quickGeneratePreset.params}
                values={formValues}
                onChange={setFormValues}
                onSubmit={handleGenerate}
                canGenerate={canGenerate()}
                isGenerating={isGenerating}
              />
            </TabsContent>

            <TabsContent value="result" className="mt-6">
              <GenerationResult
                jobId={currentJobId}
                onReset={handleReset}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// PresetCardから呼び出すための関数をexport
export function openQuickGenerateDialog(preset: Preset) {
  const hasPersonalImage = preset.params.some(
    (p) =>
      p.type === "image" && (p.id.includes("person") || p.id.includes("人物"))
  );

  // consentチェックは呼び出し元で行う
  setDialogPreset(preset);
}
