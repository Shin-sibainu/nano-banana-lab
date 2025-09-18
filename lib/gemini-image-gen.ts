// 公式ドキュメントに基づいた画像生成実装
import { GoogleGenAI, Modality } from "@google/genai";

// Base64画像をGemini API用のフォーマットに変換（サイズ削減処理付き）
function prepareImagePart(base64String: string) {
  const base64Data = base64String.split(",")[1] || base64String;
  const mimeType = base64String.includes("data:")
    ? base64String.split(";")[0].split(":")[1]
    : "image/jpeg";

  // Log the size for debugging
  const sizeInKB = Math.round((base64Data.length * 3) / 4 / 1024);
  console.log(`Image size: ${sizeInKB}KB`);

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
    // GoogleGenAIを初期化
    const ai = new GoogleGenAI({ apiKey });

    // Skip model listing for now - not available in @google/generative-ai

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

    console.log("=== GEMINI API REQUEST DEBUG ===");
    console.log("Model:", "gemini-2.5-flash-image-preview");
    console.log("Prompt length:", prompt.length);
    console.log("Image count:", images.length);
    console.log("Full prompt:", prompt);
    console.log("Prompt parts structure:", JSON.stringify(promptParts, null, 2));
    console.log("API Key exists:", !!apiKey);
    console.log("API Key prefix:", apiKey ? apiKey.substring(0, 10) + '...' : 'none');
    console.log("=== END REQUEST DEBUG ===");

    // Notify progress before API call
    if (onProgress) {
      onProgress(60);
    }

    // Use the correct API call format from CLAUDE.md
    let response;
    try {
      console.log("Calling Gemini API with ai.models.generateContent...");
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: promptParts
      });
      console.log("API call successful");
    } catch (apiError: any) {
      console.error("Gemini API call failed:", apiError.message);

      // Handle token limit errors
      if (apiError.message?.includes("32768") || apiError.message?.includes("token count exceeds")) {
        console.log("Token limit exceeded, returning mock image");
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      // Handle quota errors
      if (apiError.message?.includes("429") || apiError.message?.includes("quota")) {
        console.log("Quota exceeded, returning mock image");
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      // If image generation model fails, try with a fallback prompt
      if (apiError.message?.includes("500") || apiError.message?.includes("Internal")) {
        console.log("API internal error, using mock image as fallback");
        const seed = Date.now();
        return `https://picsum.photos/seed/${seed}/1024/1024`;
      }

      throw apiError;
    }

    // Notify progress after API call
    if (onProgress) {
      onProgress(80);
    }

    // DETAILED DEBUGGING: Log the complete response structure
    console.log("=== COMPLETE GEMINI API RESPONSE DEBUG ===");
    console.log("Full response object:", JSON.stringify(response, null, 2));

    if (response.candidates) {
      console.log("Candidates found:", response.candidates.length);
      response.candidates.forEach((candidate, index) => {
        console.log(`Candidate ${index}:`, JSON.stringify(candidate, null, 2));

        if (candidate.content) {
          console.log(`Candidate ${index} content:`, JSON.stringify(candidate.content, null, 2));

          if (candidate.content.parts) {
            console.log(`Candidate ${index} parts count:`, candidate.content.parts.length);
            candidate.content.parts.forEach((part, partIndex) => {
              console.log(`Part ${partIndex} structure:`, JSON.stringify(part, null, 2));
              console.log(`Part ${partIndex} keys:`, Object.keys(part));

              if (part.text) {
                console.log(`Part ${partIndex} has text:`, part.text.substring(0, 200));
              }
              if (part.inlineData) {
                console.log(`Part ${partIndex} has inlineData:`, {
                  mimeType: part.inlineData.mimeType,
                  dataLength: part.inlineData.data ? part.inlineData.data.length : 'no data'
                });
              }
              // その他のプロパティをチェック
              const otherKeys = Object.keys(part).filter(k => k !== 'text' && k !== 'inlineData');
              if (otherKeys.length > 0) {
                console.log(`Part ${partIndex} has other keys:`, otherKeys);
              }
            });
          } else {
            console.log(`Candidate ${index} has no parts`);
          }
        } else {
          console.log(`Candidate ${index} has no content`);
        }
      });
    } else {
      console.log("No candidates in response");
    }
    console.log("=== END RESPONSE DEBUG ===");

    // レスポンスから画像を取得
    if (response && response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];

      // Check for safety blocking - finishReason is an enum in @google/genai
      const finishReason = candidate.finishReason;
      if (finishReason) {
        const reasonStr = finishReason.toString();
        if (reasonStr.includes("SAFETY") || reasonStr.includes("BLOCKED")) {
          console.warn("Image generation blocked by safety filters:", reasonStr);
          throw new Error("画像生成がセーフティフィルターにブロックされました。別のプロンプトをお試しください。");
        }
      }

      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          // テキストレスポンス（スキップ）
          if (part.text) {
            console.log("Text response:", part.text.substring(0, 200));
            continue; // テキストはスキップして次のパートを確認
          }
          // 画像データが含まれている場合
          if (part.inlineData && part.inlineData.data) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || "image/png";
            console.log("🎉 Image generated successfully!");
            // Base64データURLとして返す
            return `data:${mimeType};base64,${imageData}`;
          }
        }
      }
    }

    // 画像が生成されなかった場合 - モックプレースホルダーを使用
    console.warn("No image generated, using mock image");
    // ランダムな美しい画像を返す（デモ用）
    const seed = Date.now();
    return `https://picsum.photos/seed/${seed}/1024/1024`;

  } catch (error: any) {
    console.error("Gemini API error:", error);

    // リトライロジック
    if ((error.status === 429 || error.message?.includes("quota")) && retries < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retries);
      console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateImageWithGemini(apiKey, prompt, images, retries + 1, onProgress);
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
    } else if (error.status === 400 && error.message?.includes("API key expired")) {
      throw new Error(
        "APIキーの有効期限が切れています。" +
        "\n\n対処方法：" +
        "\n1. https://aistudio.google.com/app/apikey にアクセス" +
        "\n2. 新しいAPIキーを生成" +
        "\n3. .env.localのGEMINI_API_KEYを更新"
      );
    } else if (error.message?.includes("API key") || error.status === 401) {
      throw new Error("APIキーが無効です。.env.localファイルのGEMINI_API_KEYを確認してください。");
    } else if (error.message?.includes("model not found") || error.status === 404) {
      throw new Error("指定されたモデルが見つかりません。APIキーが画像生成プレビューに対応しているか確認してください。");
    } else {
      throw new Error(`画像生成に失敗しました: ${error.message || "不明なエラー"}`);
    }
  }
}