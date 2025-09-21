import { NextResponse } from "next/server";
import type { GenerateRequest, ImageData } from "@/lib/types";
import { generateImageWithGemini } from "@/lib/gemini-image-gen";
import { getPresetById } from "@/lib/presets";
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const data: GenerateRequest = await request.json();

  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です。ログインしてください。" },
        { status: 401 }
      );
    }

    // Check user credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "ユーザー情報の取得に失敗しました" },
        { status: 500 }
      );
    }

    if (userData.credits < 1) {
      return NextResponse.json(
        { error: "クレジットが不足しています。クレジットを購入してください。" },
        { status: 402 }
      );
    }
    // Get API key
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. Please set GEMINI_API_KEY in .env.local",
        },
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
          const imageData = data.inputs[param.id] as ImageData;
          // If it's an ImageData object, use the previewUrl; otherwise assume it's a string
          if (typeof imageData === 'object' && imageData.previewUrl) {
            images.push(imageData.previewUrl);
          } else if (typeof imageData === 'string') {
            images.push(imageData);
          }
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


    // Create generation record first
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        prompt,
        preset_id: data.presetId || null,
        inputs: data.inputs,
        status: 'processing',
        credits_used: 0
      })
      .select()
      .single();

    if (genError || !generation) {
      return NextResponse.json(
        { error: "生成記録の作成に失敗しました" },
        { status: 500 }
      );
    }

    // Use credits atomically
    const { data: creditUsed, error: creditError } = await supabase.rpc('use_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_generation_id: generation.id
    });

    if (creditError || creditUsed === false) {
      // Delete the generation record if credit consumption fails
      await supabase
        .from('generations')
        .delete()
        .eq('id', generation.id);

      return NextResponse.json(
        { error: "クレジットの使用に失敗しました" },
        { status: 402 }
      );
    }

    // Call Gemini API and get result directly
    const result = await generateImageWithGemini(apiKey, prompt, images, 0);

    // Process result
    const resultUrls: string[] = [];

    if (result) {
      resultUrls.push(result);
    } else {
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
          // Variant generation failed, skip
        }
      }
    }


    // Update generation record with success
    await supabase
      .from('generations')
      .update({
        image_url: resultUrls[0] || null,
        status: 'completed',
        credits_used: 1
      })
      .eq('id', generation.id);

    // Return results directly
    return NextResponse.json({
      resultUrls,
      status: "succeeded",
      generationId: generation.id
    });
  } catch (error: any) {
    // If we have a generation ID, update it with the error
    if (error.generationId) {
      const supabase = await createClient();
      await supabase
        .from('generations')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', error.generationId);
    }

    return NextResponse.json(
      { error: error.message || "画像生成に失敗しました" },
      { status: 500 }
    );
  }
}
