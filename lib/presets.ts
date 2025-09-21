import type { Preset } from "@/lib/types";

export const presets: Preset[] = [
  // 👤 人物系
  {
    id: "outfit-change",
    title: "衣装替え",
    tags: ["人物", "変換"],
    description:
      "人物の衣装を参考画像の服装に変更します。同じ人物の顔を保持したまま、新しい服装に着替えさせることができます。",
    coverUrl: "https://placehold.co/400x400?text=Outfit+Change",
    promptTemplate:
      "Change the outfit of the person in the first image to match the exact outfit shown in the second image while keeping the same face and pose. Make the clothing swap look natural and realistic.",
    params: [
      { id: "person", label: "人物画像", type: "image", required: true },
      {
        id: "reference_outfit",
        label: "参考衣装画像",
        type: "image",
        required: true,
      },
    ],
    sampleInputs: {},
  },
  {
    id: "pose-change",
    title: "ポーズ指定",
    tags: ["人物", "変換"],
    description:
      "人物のポーズを指定したものに変更します。顔の特徴を保持しながら、新しいポーズや動作を取らせることができます。",
    coverUrl: "https://placehold.co/400x400?text=Pose+Change",
    promptTemplate:
      'Change the pose of the person in ${person} to ${pose} while ${consistent_id ? "maintaining facial consistency" : "allowing natural variation"}.',
    params: [
      { id: "person", label: "人物画像", type: "image", required: true },
      {
        id: "pose",
        label: "ポーズ",
        type: "select",
        options: ["standing", "sitting", "action"],
        required: true,
      },
      {
        id: "consistent_id",
        label: "顔の一貫性を保持",
        type: "switch",
        default: true,
      },
    ],
    sampleInputs: {
      pose: "action",
      consistent_id: true,
    },
  },
  {
    id: "bg-replace-person",
    title: "人物背景差し替え",
    tags: ["人物", "背景"],
    description:
      "人物はそのままに背景だけを指定したものに差し替えます。自然な影や光の調整も行います。",
    coverUrl: "https://placehold.co/400x400?text=BG+Replace",
    promptTemplate:
      'Replace the background of ${person} with "${background_desc}" ${shadows ? "with natural shadows and lighting" : "with flat lighting"}.',
    params: [
      { id: "person", label: "人物画像", type: "image", required: true },
      {
        id: "background_desc",
        label: "背景の説明",
        type: "text",
        placeholder: "美しい海岸、モダンなオフィス、桜並木など",
        required: true,
      },
      { id: "shadows", label: "影と光の調整", type: "switch", default: true },
    ],
    sampleInputs: {
      background_desc: "夕焼けの美しい海岸",
      shadows: true,
    },
  },

  // 📷 写真修復・加工
  {
    id: "photo-restore",
    title: "古写真修復",
    tags: ["修復", "写真"],
    description:
      "古い写真や劣化した写真を鮮明に修復します。傷、汚れ、色褪せなどを自動で修正し、元の美しさを取り戻します。",
    coverUrl: "https://placehold.co/400x400?text=Photo+Restore",
    promptTemplate:
      'Restore this old photo ${denoise ? "with noise reduction" : ""} using ${tone} color tone.',
    params: [
      { id: "photo", label: "修復する写真", type: "image", required: true },
      { id: "denoise", label: "ノイズ除去", type: "switch", default: true },
      {
        id: "tone",
        label: "色調",
        type: "select",
        options: ["neutral", "warm", "cool"],
        required: true,
      },
    ],
    sampleInputs: {
      denoise: true,
      tone: "warm",
    },
  },
  {
    id: "photo-colorize",
    title: "白黒→カラー",
    tags: ["修復", "写真", "カラー化"],
    description:
      "白黒写真を自然なカラー写真に変換します。時代背景を考慮した適切な色付けを行います。",
    coverUrl: "https://placehold.co/400x400?text=Colorize",
    promptTemplate:
      "Colorize this black and white photo with historically accurate and natural colors.",
    params: [{ id: "photo", label: "白黒写真", type: "image", required: true }],
  },
  {
    id: "photo-outpaint",
    title: "外延生成",
    tags: ["修復", "拡張"],
    description:
      "画像の外側を自然に拡張します。元の画像に調和する背景を生成して、より広い視野の画像を作成します。",
    coverUrl: "https://placehold.co/400x400?text=Outpaint",
    promptTemplate:
      "Extend the image outward by ${pad_percent}% with ${fill_style} style continuation.",
    params: [
      { id: "base", label: "基本画像", type: "image", required: true },
      {
        id: "pad_percent",
        label: "拡張率（%）",
        type: "number",
        min: 5,
        max: 200,
        step: 5,
        required: true,
      },
      {
        id: "fill_style",
        label: "拡張スタイル",
        type: "text",
        placeholder: "自然な継続、ミニマル、装飾的など",
      },
    ],
    sampleInputs: {
      pad_percent: 50,
      fill_style: "自然な継続",
    },
  },

  // ✏️ デザイン・クリエイティブ変換
  {
    id: "sketch-to-illustration",
    title: "ラフ→完成",
    tags: ["デザイン", "イラスト"],
    description:
      "手描きのラフスケッチを完成されたイラストに変換します。指定したスタイルで詳細を追加し、プロ品質の作品に仕上げます。",
    coverUrl: "https://placehold.co/400x400?text=Sketch+to+Art",
    promptTemplate:
      "Convert this rough sketch ${linedraft} to a finished illustration in ${style} style with ${quality} quality level.",
    params: [
      { id: "linedraft", label: "ラフスケッチ", type: "image", required: true },
      {
        id: "style",
        label: "スタイル",
        type: "text",
        placeholder: "アニメ風、リアル、水彩画、油絵など",
        required: true,
      },
      {
        id: "quality",
        label: "品質",
        type: "select",
        options: ["draft", "normal", "high"],
        required: true,
      },
    ],
    sampleInputs: {
      style: "アニメ風",
      quality: "high",
    },
  },
  {
    id: "ui-sketch-to-hifi",
    title: "UIスケッチ→ハイファイ",
    tags: ["デザイン", "UI"],
    description:
      "UIの手描きスケッチを高品質なデザインモックアップに変換します。プラットフォームに適したデザインシステムを適用します。",
    coverUrl: "https://placehold.co/400x400?text=UI+Design",
    promptTemplate:
      "Convert this UI sketch to a high-fidelity ${platform} design using ${theme} theme.",
    params: [
      { id: "ui_sketch", label: "UIスケッチ", type: "image", required: true },
      {
        id: "theme",
        label: "テーマ",
        type: "text",
        placeholder: "モダン、ミニマル、ダーク、カラフルなど",
      },
      {
        id: "platform",
        label: "プラットフォーム",
        type: "select",
        options: ["web", "ios", "android"],
        required: true,
      },
    ],
    sampleInputs: {
      theme: "モダン",
      platform: "web",
    },
  },
  {
    id: "lineart-to-colored",
    title: "線画→カラー",
    tags: ["デザイン", "カラー化"],
    description:
      "線画に色を付けて完成されたイラストにします。アニメスタイルからリアルスタイルまで対応可能です。",
    coverUrl: "https://placehold.co/400x400?text=Line+to+Color",
    promptTemplate:
      "Add colors to this line art in a vibrant and appealing style.",
    params: [{ id: "lineart", label: "線画", type: "image", required: true }],
  },

  // 🛍️ プロダクト・モックアップ
  {
    id: "product-bg-replace",
    title: "商品背景置換",
    tags: ["商品", "背景"],
    description:
      "商品写真の背景を指定したものに置き換えます。Eコマース用の美しい商品写真を簡単に作成できます。",
    coverUrl: "https://placehold.co/400x400?text=Product+BG",
    promptTemplate:
      'Replace the background of this product image with "${background_desc}" ${shadows ? "maintaining natural product shadows" : "with clean flat lighting"}.',
    params: [
      { id: "product", label: "商品画像", type: "image", required: true },
      {
        id: "background_desc",
        label: "背景の説明",
        type: "text",
        placeholder: "白背景、木目調、大理石など",
        required: true,
      },
      { id: "shadows", label: "自然な影", type: "switch", default: true },
    ],
    sampleInputs: {
      background_desc: "高級感のある大理石背景",
      shadows: true,
    },
  },
  {
    id: "product-mockup",
    title: "パッケージ写実モック",
    tags: ["商品", "モックアップ"],
    description:
      "平面デザインを実際のパッケージやプロダクトに適用した写実的なモックアップを作成します。",
    coverUrl: "https://placehold.co/400x400?text=Package+Mock",
    promptTemplate:
      'Apply this flat design to a realistic ${surface} mockup ${gloss ? "with glossy finish" : "with matte finish"}.',
    params: [
      {
        id: "flat_design",
        label: "平面デザイン",
        type: "image",
        required: true,
      },
      {
        id: "surface",
        label: "サーフェス",
        type: "select",
        options: ["box", "bottle", "pouch"],
        required: true,
      },
      { id: "gloss", label: "光沢仕上げ", type: "switch", default: false },
    ],
    sampleInputs: {
      surface: "bottle",
      gloss: true,
    },
  },
  {
    id: "ad-visual",
    title: "広告ビジュアル風",
    tags: ["商品", "広告"],
    description:
      "商品画像をプロフェッショナルな広告ビジュアルに変換します。魅力的なライティングと構図で商品を演出します。",
    coverUrl: "https://placehold.co/400x400?text=Ad+Visual",
    promptTemplate:
      "Transform this product image into a professional advertising visual with dramatic lighting and composition.",
    params: [
      { id: "product", label: "商品画像", type: "image", required: true },
    ],
  },

  // 🌍 マップ・シーン生成
  {
    id: "map-to-view",
    title: "地図→一人称視点",
    tags: ["シーン", "変換"],
    description:
      "地図の位置から実際の風景を生成します。指定した時間帯や季節での景色を作成できます。",
    coverUrl: "https://placehold.co/400x400?text=Map+to+View",
    promptTemplate:
      'Generate a first-person view of "${place}" as shown in ${map_with_arrow} during ${time}.',
    params: [
      {
        id: "map_with_arrow",
        label: "矢印付き地図",
        type: "image",
        required: true,
      },
      {
        id: "place",
        label: "場所の説明",
        type: "text",
        placeholder: "公園、駅前、商店街など",
      },
      {
        id: "time",
        label: "時間帯",
        type: "select",
        options: ["day", "sunset", "night"],
        required: true,
      },
    ],
    sampleInputs: {
      place: "桜並木の公園",
      time: "sunset",
    },
  },
  {
    id: "place-to-scene",
    title: "テキスト→風景",
    tags: ["シーン", "生成"],
    description:
      "テキストの説明から美しい風景画像を生成します。詳細な描写に基づいてフォトリアルな景色を作成します。",
    coverUrl: "https://placehold.co/400x400?text=Text+to+Scene",
    promptTemplate: "Generate a photorealistic landscape of ${place_desc}.",
    params: [
      {
        id: "place_desc",
        label: "場所の詳細説明",
        type: "text",
        placeholder: "夕日が沈む海岸線、雪化粧した山々、緑豊かな森林など",
        required: true,
      },
    ],
    sampleInputs: {
      place_desc: "朝霧に包まれた神秘的な竹林",
    },
  },
  {
    id: "scene-style-transfer",
    title: "時間帯/季節違い",
    tags: ["シーン", "変換"],
    description:
      "既存の風景を異なる時間帯や季節に変換します。同じ場所の様々な表情を楽しめます。",
    coverUrl: "https://placehold.co/400x400?text=Time+Season",
    promptTemplate:
      "Transform this scene to show it during ${variant}.",
    params: [
      { id: "scene", label: "風景画像", type: "image", required: true },
      {
        id: "variant",
        label: "バリエーション",
        type: "select",
        options: [
          "day",
          "sunset",
          "night",
          "spring",
          "summer",
          "autumn",
          "winter",
        ],
        required: true,
      },
    ],
    sampleInputs: {
      variant: "autumn",
    },
  },

  // 🎨 アートスタイル・遊び
  {
    id: "art-style-transfer",
    title: "アートスタイル変換",
    tags: ["アート", "変換"],
    description:
      "写真や画像を指定したアーティストの画風に変換します。有名な画家のスタイルを適用できます。",
    coverUrl: "https://placehold.co/400x400?text=Art+Style",
    promptTemplate: "Transform the image in the artistic style of ${art_style}.",
    params: [
      { id: "image", label: "変換する画像", type: "image", required: true },
      {
        id: "art_style",
        label: "アートスタイル",
        type: "text",
        placeholder: "ゴッホ、ピカソ、浮世絵、水彩画など",
        required: true,
      },
    ],
    sampleInputs: {
      art_style: "ゴッホの星月夜風",
    },
  },
  {
    id: "fantasy-variation",
    title: "ファンタジー変換",
    tags: ["アート", "ファンタジー"],
    description:
      "普通の写真をファンタジー世界の幻想的な画像に変換します。魔法的な要素を追加して夢のような作品を作ります。",
    coverUrl: "https://placehold.co/400x400?text=Fantasy",
    promptTemplate:
      "Transform the image into a magical fantasy scene with enchanting elements.",
    params: [
      { id: "image", label: "変換する画像", type: "image", required: true },
    ],
  },
  {
    id: "comic-panel",
    title: "漫画コマ風",
    tags: ["アート", "漫画"],
    description:
      "写真を漫画のコマのようなスタイルに変換します。コミック風の効果と演出を追加します。",
    coverUrl: "https://placehold.co/400x400?text=Comic+Panel",
    promptTemplate:
      "Convert the photo into a comic book panel style with bold lines and dramatic effects.",
    params: [{ id: "photo", label: "写真", type: "image", required: true }],
  },

  // 🎯 高度な画像合成（複数画像）
  {
    id: "face-swap",
    title: "顔交換",
    tags: ["人物", "合成"],
    description:
      "2つの画像から顔を入れ替えます。自然な仕上がりで違和感のない合成を実現。",
    coverUrl: "https://placehold.co/400x400?text=Face+Swap",
    promptTemplate:
      "Take the face from the first image and naturally swap it onto the person in the second image. Ensure natural skin tone matching and proper lighting integration. The facial features from the first image should completely replace those in the second image while maintaining the second image's pose, clothing, and background.",
    params: [
      { id: "source_face", label: "顔の元画像", type: "image", required: true },
      {
        id: "target_body",
        label: "体の対象画像",
        type: "image",
        required: true,
      },
    ],
  },
  {
    id: "object-insertion",
    title: "オブジェクト合成",
    tags: ["合成", "編集"],
    description:
      "一つの画像から特定のオブジェクトを抽出し、別の画像に自然に配置します。",
    coverUrl: "https://placehold.co/400x400?text=Object+Insert",
    promptTemplate:
      "Extract the ${object_desc} from the first image and naturally place it into the second image. Adjust lighting, shadows, and perspective to match the target scene perfectly.",
    params: [
      {
        id: "source_image",
        label: "オブジェクト元画像",
        type: "image",
        required: true,
      },
      {
        id: "target_scene",
        label: "配置先シーン",
        type: "image",
        required: true,
      },
      {
        id: "object_desc",
        label: "抽出するオブジェクト",
        type: "text",
        placeholder: "例：赤い車、青い花瓶、犬など",
        required: true,
      },
    ],
  },
  {
    id: "style-fusion",
    title: "スタイル融合",
    tags: ["アート", "合成"],
    description:
      "複数の画像のスタイルを組み合わせて、ユニークなアート作品を生成します。",
    coverUrl: "https://placehold.co/400x400?text=Style+Fusion",
    promptTemplate:
      "Combine the artistic style from the second image with the content and composition of the first image. The result should maintain the structure and subject of the content image while adopting the colors, brushstrokes, and artistic techniques of the style reference.",
    params: [
      {
        id: "content_image",
        label: "コンテンツ画像",
        type: "image",
        required: true,
      },
      {
        id: "style_reference",
        label: "スタイル参照画像",
        type: "image",
        required: true,
      },
    ],
  },
  {
    id: "outfit-transfer",
    title: "衣装転送",
    tags: ["人物", "ファッション", "合成"],
    description:
      "一人の服装を別の人物に転送します。体型に合わせて自然にフィッティング。",
    coverUrl: "https://placehold.co/400x400?text=Outfit+Transfer",
    promptTemplate:
      "Transfer the complete outfit (clothing, accessories) from the person in the first image to the person in the second image. Adjust the clothing to fit naturally on the target person's body shape and pose. Keep the target person's face, hair, and background unchanged.",
    params: [
      {
        id: "outfit_source",
        label: "衣装の元画像",
        type: "image",
        required: true,
      },
      {
        id: "person_target",
        label: "着せ替え対象の人物",
        type: "image",
        required: true,
      },
    ],
  },
  {
    id: "scene-merge",
    title: "シーン合成",
    tags: ["シーン", "合成"],
    description:
      "複数の画像から要素を抽出して、新しいシーンを作成します。背景、前景、被写体を自由に組み合わせ。",
    coverUrl: "https://placehold.co/400x400?text=Scene+Merge",
    promptTemplate:
      "Create a new scene by taking the background from the first image, the main subject from the second image, and the foreground elements from the third image. Ensure proper depth of field, lighting consistency, and natural perspective throughout the composition.",
    params: [
      { id: "background", label: "背景画像", type: "image", required: true },
      { id: "subject", label: "主要被写体", type: "image", required: true },
      { id: "foreground", label: "前景要素", type: "image", required: true },
    ],
  },
  {
    id: "product-context",
    title: "商品コンテキスト配置",
    tags: ["商品", "合成"],
    description:
      "商品を様々なライフスタイルシーンに自然に配置。使用シーンのビジュアル化。",
    coverUrl: "https://placehold.co/400x400?text=Product+Context",
    promptTemplate:
      "Place the product from ${product} naturally into the lifestyle scene shown in ${scene}. The product should appear as if it belongs in the environment with proper shadows, reflections, and scale. ${placement_hint}",
    params: [
      { id: "product", label: "商品画像", type: "image", required: true },
      { id: "scene", label: "配置シーン", type: "image", required: true },
      {
        id: "placement_hint",
        label: "配置のヒント",
        type: "text",
        placeholder: "テーブルの上に、手に持って、など",
      },
    ],
  },
];

export function getPresetById(id: string) {
  return presets.find((preset) => preset.id === id) ?? null;
}

export function getPresetList() {
  return presets;
}
