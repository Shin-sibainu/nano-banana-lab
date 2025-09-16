"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import type { Preset } from "@/lib/types";
import { useConsent } from "@/lib/consent";
import { toast } from "sonner";
import { openQuickGenerateDialog } from "@/components/home/QuickGenerateDialog";

interface QuickGenerateButtonProps {
  preset: Preset;
}

export function QuickGenerateButton({ preset }: QuickGenerateButtonProps) {
  const { consent } = useConsent();

  const handleClick = () => {
    const hasPersonalImage = preset.params.some(
      (p) =>
        p.type === "image" && (p.id.includes("person") || p.id.includes("人物"))
    );

    if (hasPersonalImage && !consent.personalImages) {
      toast.error(
        "人物画像の生成には同意が必要です。設定から同意してください。"
      );
      return;
    }

    openQuickGenerateDialog(preset);
  };

  return (
    <Button
      size="sm"
      className="px-4 gradient-animated hover:shadow-glow transition-all duration-300 hover:scale-105"
      onClick={handleClick}
    >
      <Zap className="h-4 w-4 text-white" />
    </Button>
  );
}