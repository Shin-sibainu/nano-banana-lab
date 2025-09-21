"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, AlertCircle } from "lucide-react";

interface CreditInsufficientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsNeeded?: number;
  currentCredits?: number;
}

export default function CreditInsufficientDialog({
  open,
  onOpenChange,
  creditsNeeded = 1,
  currentCredits = 0,
}: CreditInsufficientDialogProps) {
  const router = useRouter();

  const handleBilling = () => {
    router.push("/billing");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <AlertDialogTitle>クレジットが不足しています</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-red-800">
                画像生成には
                <span className="font-bold">{creditsNeeded}クレジット</span>
                必要です。
              </p>
              <p className="text-sm text-red-800 mt-1">
                現在の残高:{" "}
                <span className="font-bold">{currentCredits}クレジット</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                クレジットを購入して、画像生成を続けましょう！
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• 100クレジット = ¥1,000</li>
                <li>• 500クレジット = ¥4,500（10%お得）</li>
                <li>• 1000クレジット = ¥8,000（20%お得）</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBilling}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
          >
            <CreditCard className="h-4 w-4" />
            クレジットを購入
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
