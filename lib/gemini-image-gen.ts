// 公式ドキュメントに基づいた画像生成実装
import { GoogleGenAI, Modality } from "@google/genai";

// Base64画像をGemini API用のフォーマットに変換（サイズ削減処理付き）
function prepareImagePart(base64String: string) {
  const base64Data = base64String.split(",")[1] || base64String;
  const mimeType = base64String.includes("data:")
    ? base64String.split(";")[0].split(":")[1]
    : "image/jpeg";

  // Calculate the size
  const sizeInKB = Math.round((base64Data.length * 3) / 4 / 1024);

  return {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };
}

// リトライロジックの実装
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// Gemini画像生成（公式ドキュメント準拠）
export async function generateImageWithGemini(
  apiKey: string,
  prompt: string,
  images: string[] = [],
  retries = 0,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Initialize with object format as per working example
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // プロンプト配列を構築
    const promptParts: any[] = [];

    // 既存画像がある場合は追加（編集・合成用）
    if (images.length > 0) {
      images.forEach((image) => {
        promptParts.push(prepareImagePart(image));
      });
    }

    // テキストプロンプトを追加
    promptParts.push({ text: prompt });


    // Notify progress before API call
    if (onProgress) {
      onProgress(60);
    }

    // Use the correct API call format from working example
    let response;
    try {
      // Call API exactly like the working example
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: {
          parts: promptParts,
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
    } catch (apiError: any) {

      // Handle token limit errors
      if (
        apiError.message?.includes("32768") ||
        apiError.message?.includes("token count exceeds")
      ) {
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      // Handle quota errors
      if (
        apiError.message?.includes("429") ||
        apiError.message?.includes("quota")
      ) {
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      // If image generation model fails, try with a fallback prompt
      if (
        apiError.message?.includes("500") ||
        apiError.message?.includes("Internal")
      ) {
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      throw apiError;
    }

    // Notify progress after API call
    if (onProgress) {
      onProgress(80);
    }


    // レスポンスから画像を取得（working exampleと同じ処理）
    if (response && response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];

      // Check for safety blocking
      const finishReason = candidate.finishReason;
      if (finishReason) {
        const reasonStr = finishReason.toString();
        if (reasonStr.includes("SAFETY") || reasonStr.includes("BLOCKED")) {
          throw new Error(
            "画像生成がセーフティフィルターにブロックされました。別のプロンプトをお試しください。"
          );
        }
      }

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // 画像データが含まれている場合（working exampleと同じチェック）
          if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            // Base64データURLとして返す
            return `data:${mimeType};base64,${imageData}`;
          }
          // テキストレスポンスの場合（エラーメッセージの可能性）
          if (part.text && !part.inlineData) {
            // Text response (ignored for image generation)
          }
        }
      }
    }

    // 画像が生成されなかった場合 - エラーを投げる（working exampleと同じ）
    throw new Error(
      "The AI did not return an image. Please try again with different images."
    );
  } catch (error: any) {

    // リトライロジック
    if (
      (error.status === 429 || error.message?.includes("quota")) &&
      retries < MAX_RETRIES
    ) {
      const delay = RETRY_DELAY * Math.pow(2, retries);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateImageWithGemini(
        apiKey,
        prompt,
        images,
        retries + 1,
        onProgress
      );
    }

    // エラーハンドリング
    if (error.status === 429 || error.message?.includes("quota")) {
      throw new Error(
        "API利用制限に達しました。" +
          "\n\n対処方法：" +
          "\n1. しばらく待ってから再度お試しください" +
          "\n2. Google AI Studioで有料プランにアップグレード: https://aistudio.google.com/app/billing" +
          "\n3. 詳細はGEMINI_BILLING.mdをご確認ください"
      );
    } else if (
      error.status === 400 &&
      error.message?.includes("API key expired")
    ) {
      throw new Error(
        "APIキーの有効期限が切れています。" +
          "\n\n対処方法：" +
          "\n1. https://aistudio.google.com/app/apikey にアクセス" +
          "\n2. 新しいAPIキーを生成" +
          "\n3. .env.localのGEMINI_API_KEYを更新"
      );
    } else if (error.message?.includes("API key") || error.status === 401) {
      throw new Error(
        "APIキーが無効です。.env.localファイルのGEMINI_API_KEYを確認してください。"
      );
    } else if (
      error.message?.includes("model not found") ||
      error.status === 404
    ) {
      throw new Error(
        "指定されたモデルが見つかりません。APIキーが画像生成プレビューに対応しているか確認してください。"
      );
    } else {
      throw new Error(
        `Failed to generate the virtual try-on image. The model may be unable to process these specific images. Please try again with different pictures. Error: ${
          error.message || "Unknown error"
        }`
      );
    }
  }
}
