# Nano Banana Lab データベース設計書

## 概要

Nano Banana Lab の画像生成プラットフォーム用データベーススキーマ設計。
画像保存には Cloudflare R2 を使用し、メタデータは Supabase に保存します。

## テーブル設計

### 1. users（ユーザー管理）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT, -- R2に保存
  credits INTEGER DEFAULT 25,
  total_credits_purchased INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 2. generations（画像生成履歴）

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES presets(id),

  -- 生成パラメータ
  prompt TEXT NOT NULL,
  inputs JSONB NOT NULL, -- パラメータ値（ImageDataを含む、入力画像は保存しない）
  model TEXT DEFAULT 'gemini-2.5-flash-image-preview',

  -- ステータス管理
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,

  -- リソース使用
  credits_used INTEGER DEFAULT 1,
  processing_time_ms INTEGER,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- メタデータ
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
```

### 3. generated_images（生成された画像）

```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- 画像ファイルパス（絶対パス）
  file_path TEXT NOT NULL, -- 生成された画像の絶対パス
  public_url TEXT NOT NULL, -- 公開アクセス用URL
  thumbnail_path TEXT, -- サムネイルの絶対パス
  thumbnail_url TEXT, -- サムネイル公開URL

  -- 画像情報
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  file_size INTEGER NOT NULL, -- バイト単位
  mime_type TEXT DEFAULT 'image/png',
  variant_index INTEGER DEFAULT 0, -- 複数バリアント生成時のインデックス

  -- 公開設定
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- 自動削除用

  -- メタデータ
  metadata JSONB DEFAULT '{}'::jsonb -- EXIF、生成パラメータなど
);

CREATE INDEX idx_generated_images_generation_id ON generated_images(generation_id);
CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_share_token ON generated_images(share_token);
```


### 5. presets（プリセットテンプレート）

```sql
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- fashion, product, art, etc.
  tags TEXT[] DEFAULT '{}',

  -- カバー画像
  cover_path TEXT, -- カバー画像の絶対パス
  cover_url TEXT, -- カバー画像の公開URL

  -- プロンプトとパラメータ
  prompt_template TEXT NOT NULL,
  params JSONB NOT NULL, -- PresetParam[]の定義
  sample_inputs JSONB, -- サンプル入力値
  default_values JSONB, -- デフォルト値

  -- 統計
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2),
  avg_generation_time_ms INTEGER,

  -- 公開設定
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- 所有者
  created_by UUID REFERENCES users(id),

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_presets_slug ON presets(slug);
CREATE INDEX idx_presets_category ON presets(category);
CREATE INDEX idx_presets_tags ON presets USING gin(tags);
```

### 6. user_favorites（お気に入り）

```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES presets(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('preset', 'generation')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preset_id),
  UNIQUE(user_id, generation_id)
);
```

### 7. credit_transactions（クレジット取引履歴）

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- 取引タイプ
  type TEXT CHECK (type IN (
    'purchase',      -- 購入
    'usage',         -- 使用
    'refund',        -- 返金
    'bonus',         -- ボーナス
    'subscription',  -- サブスクリプション
    'admin_grant'    -- 管理者付与
  )) NOT NULL,

  -- 金額
  amount INTEGER NOT NULL, -- 正の値は加算、負の値は減算
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- 参照
  reference_type TEXT, -- generation, purchase, subscription
  reference_id UUID,

  -- 詳細
  description TEXT,
  payment_method TEXT,
  payment_id TEXT, -- Stripe等の決済ID

  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

### 8. user_settings（ユーザー設定）

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- プライバシー設定
  consent_personal_images BOOLEAN DEFAULT false,
  consent_exif_removal BOOLEAN DEFAULT true,
  consent_generation_label BOOLEAN DEFAULT true,
  consent_data_training BOOLEAN DEFAULT false,

  -- 通知設定
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,

  -- UI設定
  theme TEXT DEFAULT 'system', -- light, dark, system
  language TEXT DEFAULT 'ja',
  default_quality TEXT DEFAULT 'balanced', -- fast, balanced, quality

  -- 同意記録
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. api_usage（API 使用状況）

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- API情報
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,

  -- レート制限
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMPTZ,

  -- パフォーマンス
  response_time_ms INTEGER,
  tokens_used INTEGER,

  -- エラー情報
  error_type TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at DESC);
```

## ストレージ構造（ファイルシステム）

```
/var/www/banana-lab/storage/
├── generated/           # 生成された画像
│   ├── {user_id}/
│   │   ├── {year}/{month}/
│   │   │   ├── {generation_id}_v{index}.png
│   │   │   └── {generation_id}_v{index}_thumb.jpg
├── presets/            # プリセットカバー画像
│   └── covers/
│       └── {preset_id}.jpg
└── avatars/            # ユーザーアバター
    └── {user_id}/
        └── avatar.jpg
```

**注**: 入力画像は保存せず、生成時のみメモリ上で処理

## セキュリティポリシー（RLS）

```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY generations_policy ON generations
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY generated_images_select ON generated_images
  FOR SELECT USING (
    auth.uid() = user_id
    OR is_public = true
    OR share_token IS NOT NULL
  );
CREATE POLICY generated_images_insert ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY generated_images_update ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY generated_images_delete ON generated_images
  FOR DELETE USING (auth.uid() = user_id);
```

## データベース関数

```sql
-- クレジット使用関数
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_generation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 現在の残高を取得（行ロック）
  SELECT credits INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- 残高チェック
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- 残高更新
  v_new_balance := v_current_balance - p_amount;
  UPDATE users
  SET credits = v_new_balance
  WHERE id = p_user_id;

  -- 取引記録
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    reference_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    'usage',
    -p_amount,
    v_current_balance,
    v_new_balance,
    'generation',
    p_generation_id,
    '画像生成'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 画像自動削除関数（30日後）
CREATE OR REPLACE FUNCTION cleanup_expired_images()
RETURNS void AS $$
BEGIN
  -- 期限切れ画像を削除
  DELETE FROM generated_images
  WHERE expires_at < NOW();

  -- ファイルシステムからも削除（外部スクリプトで処理）
  -- Note: 実際のファイル削除は別途cronジョブで実行
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_presets_updated_at
  BEFORE UPDATE ON presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## マイグレーション計画

### Phase 1: 基本テーブル作成

1. users, user_settings
2. presets
3. RLS ポリシー設定

### Phase 2: 生成機能

1. generations, generated_images
2. credit_transactions

### Phase 3: 拡張機能

1. user_favorites
2. api_usage
3. バッチ処理・定期タスク設定

## パフォーマンス考慮事項

1. **インデックス**: 頻繁に検索されるカラムにインデックスを追加
2. **パーティショニング**: generated_images テーブルを月単位でパーティション化（将来）
3. **キャッシュ**: Redis/Memcached でプリセット情報をキャッシュ
4. **CDN**: CloudflareやCloudFront等のCDNで画像配信を高速化
5. **バックグラウンドジョブ**: 画像処理はワーカーで非同期実行

## セキュリティ考慮事項

1. **RLS**: 全テーブルで Row Level Security を有効化
2. **API Key管理**: 環境変数で管理、定期的なローテーション
3. **画像アクセス**: Nginxでパス制御、認証が必要な画像は動的配信
4. **レート制限**: API使用状況を監視し、異常なアクセスをブロック
5. **監査ログ**: 重要な操作は全て api_usage テーブルに記録

## バックアップ戦略

1. **データベース**: 日次でフルバックアップ、1時間ごとに増分バックアップ
2. **ファイルシステム**: rsyncで別サーバーに日次バックアップ
3. **保持期間**: バックアップは30日間保持
4. **災害復旧**: 別リージョンにスタンバイ環境を構築
