# Supabase MVP データベース設計

## 最小限のテーブル構造（5テーブルのみ）

### 1. profiles（ユーザープロファイル）
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. jobs（生成ジョブ）
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preset_id TEXT NOT NULL, -- プリセットのslug
  status TEXT DEFAULT 'queued', -- queued, running, succeeded, failed
  inputs JSONB NOT NULL,
  result_urls TEXT[], -- 生成画像のURL配列
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### 3. purchases（購入履歴）
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL, -- 円単位
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. images（画像管理）
```sql
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. user_settings（ユーザー設定）
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  consent_personal_images BOOLEAN DEFAULT false,
  consent_exif_removal BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 必要最小限のRLSポリシー

```sql
-- profiles: 自分のデータのみアクセス可能
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_policy ON profiles
  FOR ALL USING (auth.uid() = id);

-- jobs: 自分のジョブのみアクセス可能
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_policy ON jobs
  FOR ALL USING (auth.uid() = user_id);

-- purchases: 自分の購入履歴のみ
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY purchases_policy ON purchases
  FOR ALL USING (auth.uid() = user_id);

-- images: 自分の画像のみ
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
CREATE POLICY images_policy ON images
  FOR ALL USING (auth.uid() = user_id);

-- user_settings: 自分の設定のみ
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_policy ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

## シンプルなクレジット処理関数

```sql
-- クレジット消費
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT credits INTO v_balance FROM profiles
  WHERE id = p_user_id FOR UPDATE;

  IF v_balance >= p_amount THEN
    UPDATE profiles SET credits = credits - p_amount
    WHERE id = p_user_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 購入完了時のクレジット追加
CREATE OR REPLACE FUNCTION add_credits_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    UPDATE profiles
    SET credits = credits + NEW.credits
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_completed_trigger
AFTER UPDATE ON purchases
FOR EACH ROW EXECUTE FUNCTION add_credits_on_purchase();
```

## Cloudflare R2 設定（シンプル版）

```yaml
buckets:
  - name: nanobana-images    # 全画像を1つのバケットで管理
    public: true              # CDN経由で公開配信
```

## 環境変数（必要最小限）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Gemini API
GEMINI_API_KEY=
```

## 実装の優先順位

### Phase 1（最優先）
1. Supabase Auth でのユーザー認証
2. クレジットシステム
3. ジョブ実行と画像生成

### Phase 2
1. Stripe決済統合
2. 画像のR2アップロード
3. 履歴機能

### Phase 3（後回し可）
1. 共有機能
2. お気に入り
3. 詳細な分析

## プリセットデータ

プリセットは最初はコード内にハードコーディング（`lib/presets.ts`）。
必要になったらDBに移行。

## 注意点

- **認証**: Supabase Authの基本機能のみ使用（メール/パスワード）
- **画像保存**: R2に直接アップロード、URLをDBに保存
- **決済**: Stripeの単発決済のみ（サブスクなし）
- **クレジット**: シンプルな加算・減算のみ（履歴なし）