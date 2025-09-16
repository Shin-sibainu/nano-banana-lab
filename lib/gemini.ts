import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini APIクライアントの初期化
export function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

// 画像をBase64からGemini API用のフォーマットに変換
export function prepareImageForGemini(base64String: string) {
  // data:image/jpeg;base64, の部分を除去
  const base64Data = base64String.split(",")[1];
  const mimeType = base64String.split(";")[0].split(":")[1];

  return {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || "image/jpeg",
    },
  };
}

// プロンプトテンプレートの変数を置換
export function buildPrompt(
  template: string,
  inputs: Record<string, any>
): string {
  let prompt = template;

  // まず条件式を処理（${variable ? "true" : "false"} 形式）
  prompt = prompt.replace(/\$\{(\w+)\s*\?\s*"([^"]*)"\s*:\s*"([^"]*)"\}/g, (match, key, trueVal, falseVal) => {
    const value = inputs[key];
    if (value === true || value === "true") return trueVal;
    if (value === false || value === "false") return falseVal;
    return value ? trueVal : falseVal;
  });

  // テンプレートリテラル内の条件式を処理
  prompt = prompt.replace(/\$\{(\w+)\s*\?\s*`([^`]*)`\s*:\s*`([^`]*)`\}/g, (match, key, trueVal, falseVal) => {
    const value = inputs[key];
    // trueVal/falseVal内の変数も置換
    let result = value ? trueVal : falseVal;

    // 内部の変数を置換
    Object.keys(inputs).forEach(innerKey => {
      const innerValue = inputs[innerKey];
      if (innerValue !== undefined && innerValue !== null && innerValue !== "") {
        if (typeof innerValue === "string" && innerValue.startsWith("data:image")) {
          result = result.replace(new RegExp(`\\$\\{${innerKey}\\}`, "g"), "[image]");
        } else {
          result = result.replace(new RegExp(`\\$\\{${innerKey}\\}`, "g"), String(innerValue));
        }
      }
    });

    return result;
  });

  // 通常の変数を置換（${variable} 形式）
  Object.keys(inputs).forEach(key => {
    const value = inputs[key];
    if (value !== undefined && value !== null && value !== "") {
      // 画像の場合はプレースホルダーを使用
      if (typeof value === "string" && value.startsWith("data:image")) {
        prompt = prompt.replace(new RegExp(`\\$\\{${key}\\}`, "g"), "[image]");
      } else if (typeof value !== "boolean") {
        // boolean以外の値を置換
        prompt = prompt.replace(new RegExp(`\\$\\{${key}\\}`, "g"), String(value));
      }
    }
  });

  // 条件式の後処理（入力がない場合の処理）
  prompt = prompt.replace(/\$\{(\w+)\s*\?\s*`[^`]*`\s*:\s*""\}/g, "");

  // 未使用の変数を削除
  prompt = prompt.replace(/\$\{[^}]+\}/g, "");

  return prompt.trim();
}

// Gemini APIを使った画像生成
export async function generateWithGemini(
  apiKey: string,
  prompt: string,
  images: string[] = []
) {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    },
  });

  // コンテンツの準備
  const parts: any[] = [{ text: prompt }];

  // 画像を追加
  images.forEach(imageBase64 => {
    if (imageBase64) {
      parts.push(prepareImageForGemini(imageBase64));
    }
  });

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("画像生成に失敗しました");
  }
}