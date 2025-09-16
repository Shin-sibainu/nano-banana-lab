"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useConsent } from '@/lib/consent';

export function ConsentDialog() {
  const { consent, setConsent } = useConsent();
  const [open, setOpen] = useState(false);
  const [tempConsent, setTempConsent] = useState(consent);

  // Open dialog on first visit (no stored consent)
  useEffect(() => {
    // If there is no saved consent (personalImages default false), show once
    const stored = typeof window !== 'undefined' ? localStorage.getItem('nano-banana-consent') : null;
    setOpen(!stored);
  }, []);

  const handleSave = () => {
    setConsent(tempConsent);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>利用規約とプライバシー設定</DialogTitle>
          <DialogDescription>
            Nano Banana を安全にご利用いただくための設定です。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="personal"
              checked={tempConsent.personalImages}
              onCheckedChange={(checked) =>
                setTempConsent({ ...tempConsent, personalImages: checked as boolean })
              }
            />
            <label htmlFor="personal" className="text-sm">
              <div className="font-medium">人物画像の生成に同意する</div>
              <div className="text-muted-foreground">
                肖像権を侵害しない画像のみをアップロードすることを約束します
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="exif"
              checked={tempConsent.exifRemoval}
              onCheckedChange={(checked) =>
                setTempConsent({ ...tempConsent, exifRemoval: checked as boolean })
              }
            />
            <label htmlFor="exif" className="text-sm">
              <div className="font-medium">EXIF情報の自動除去</div>
              <div className="text-muted-foreground">
                アップロード時に位置情報等のメタデータを除去します
              </div>
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="label"
              checked={tempConsent.generationLabel}
              onCheckedChange={(checked) =>
                setTempConsent({ ...tempConsent, generationLabel: checked as boolean })
              }
            />
            <label htmlFor="label" className="text-sm">
              <div className="font-medium">AI生成画像へのラベル付与</div>
              <div className="text-muted-foreground">
                生成画像に「AI生成」の透かしを追加します
              </div>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full">
            設定を保存してはじめる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
