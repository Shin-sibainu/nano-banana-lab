'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function checkUserCredits() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'ユーザーがログインしていません', hasCredits: false };
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    return { error: 'ユーザー情報の取得に失敗しました', hasCredits: false };
  }

  return {
    hasCredits: userData.credits > 0,
    credits: userData.credits
  };
}

export async function useCreditsForGeneration(generationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ユーザーがログインしていません' };
  }

  // Use the database function to consume credits atomically
  const { data, error } = await supabase.rpc('use_credits', {
    p_user_id: user.id,
    p_amount: 1,
    p_generation_id: generationId
  });

  if (error) {
    console.error('Credit consumption error:', error);
    return { success: false, error: 'クレジットの使用に失敗しました' };
  }

  if (data === false) {
    return { success: false, error: 'クレジットが不足しています' };
  }

  // Revalidate the header to show updated credits
  revalidatePath('/', 'layout');

  return { success: true };
}

export async function saveGenerationRecord(
  prompt: string,
  presetId: string | null,
  inputs: any,
  imageUrl: string | null,
  status: 'processing' | 'completed' | 'failed',
  errorMessage?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'ユーザーがログインしていません' };
  }

  const { data, error } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      prompt,
      preset_id: presetId,
      inputs,
      image_url: imageUrl,
      status,
      error_message: errorMessage,
      credits_used: status === 'completed' ? 1 : 0
    })
    .select()
    .single();

  if (error) {
    console.error('Generation save error:', error);
    return { success: false, error: '生成記録の保存に失敗しました' };
  }

  return { success: true, generationId: data.id };
}