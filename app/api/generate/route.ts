import { NextResponse } from "next/server";
import type { GenerateRequest } from "@/lib/types";
import { generateImageWithGemini } from "@/lib/gemini-image-gen";
import { getPresetById } from "@/lib/presets";

export async function POST(request: Request) {
  const data: GenerateRequest = await request.json();

  try {

    // Get API key
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    // Get preset if provided
    const preset = data.presetId ? getPresetById(data.presetId) : null;

    // Build prompt and collect images
    let prompt = "";
    const images: string[] = [];

    if (preset) {
      // Build prompt from template
      prompt = preset.promptTemplate.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return data.inputs[key] || match;
      });

      // Collect image inputs
      preset.params.forEach((param) => {
        if (param.type === "image" && data.inputs[param.id]) {
          images.push(data.inputs[param.id]);
        }
      });
    } else {
      // Custom prompt
      prompt = data.prompt || "";
      if (data.images) {
        images.push(...data.images);
      }
    }

    // Validate prompt
    if (!prompt || prompt.trim() === "") {
      return NextResponse.json(
        { error: "プロンプトが空です。パラメータを確認してください。" },
        { status: 400 }
      );
    }

    console.log("Generating with Gemini:", {
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? "..." : ""),
      imageCount: images.length,
    });

    // Call Gemini API and get result directly
    const result = await generateImageWithGemini(
      apiKey,
      prompt,
      images,
      0
    );

    // Process result
    const resultUrls: string[] = [];

    if (result) {
      resultUrls.push(result);
    } else {
      console.error("No result from Gemini API");
      return NextResponse.json(
        { error: "画像生成に失敗しました" },
        { status: 500 }
      );
    }

    // Generate variants if requested
    if (data.variants && data.variants > 1) {
      for (let i = 1; i < data.variants; i++) {
        try {
          const variantResult = await generateImageWithGemini(
            apiKey,
            prompt + ` (variation ${i + 1})`,
            images,
            0
          );
          if (variantResult && variantResult.startsWith("data:image")) {
            resultUrls.push(variantResult);
          }
        } catch (variantError) {
          console.error(`Variant ${i} generation failed:`, variantError);
        }
      }
    }

    console.log(`Generated ${resultUrls.length} images`);

    // Return results directly
    return NextResponse.json({
      resultUrls,
      status: "succeeded"
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error.message || "画像生成に失敗しました" },
      { status: 500 }
    );
  }
}
