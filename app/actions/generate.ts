"use server";

import { revalidatePath } from "next/cache";
import type { GenerateRequest } from "@/lib/types";

export async function generateImage(data: {
  presetId?: string;
  inputs: Record<string, any>;
}) {
  try {
    // バックエンドAPIを呼び出し（実際の実装に置き換える）
    const response = await fetch(`${process.env.API_URL || "http://localhost:3000"}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Generation failed");
    }

    const result = await response.json();

    // 履歴ページをリバリデート
    revalidatePath("/history");

    return {
      success: true,
      jobId: result.jobId,
    };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: "生成処理に失敗しました",
    };
  }
}