import { Metadata } from 'next';
import { getPresetById } from '@/lib/presets';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const preset = getPresetById(params.id);

  if (!preset) {
    return {
      title: 'プリセットが見つかりません - Nano Banana Lab',
    };
  }

  // プリセットごとの適切なメタデータ
  const title = `${preset.title} - AI画像生成 | Nano Banana Lab`;
  const description = preset.description ||
    `${preset.title}を使ってAI画像を生成。${preset.tags.join('、')}に最適なプリセットです。`;

  return {
    title,
    description,
    keywords: [
      ...preset.tags,
      'AI画像生成',
      '画像編集',
      preset.title,
      'Gemini API',
      'Nano Banana Lab'
    ],
    openGraph: {
      title,
      description,
      images: preset.coverUrl ? [preset.coverUrl] : ['/og-image.png'],
      type: 'website',
      siteName: 'Nano Banana Lab',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: preset.coverUrl ? [preset.coverUrl] : ['/og-image.png'],
    },
    alternates: {
      canonical: `/preset/${params.id}`,
    },
  };
}