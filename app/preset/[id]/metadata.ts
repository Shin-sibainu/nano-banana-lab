import type { Metadata } from 'next';
import { getPresetById } from '@/lib/presets';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const preset = getPresetById(params.id);

  if (!preset) {
    return {
      title: 'プリセット不明',
      description: '指定されたプリセットが見つかりませんでした。',
    };
  }

  return {
    title: preset.title,
    description: preset.description,
    openGraph: {
      title: `${preset.title} | Nano Banana Lab`,
      description: preset.description,
      images: [preset.coverUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: preset.title,
      description: preset.description,
      images: [preset.coverUrl],
    },
  };
}

export async function generateStaticParams() {
  const { presets } = await import('@/lib/presets');

  return presets.map((preset) => ({
    id: preset.id,
  }));
}