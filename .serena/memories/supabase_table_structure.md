# Supabase データベース設計書

## 概要
Nano Banana Lab は AI 画像生成・編集プラットフォームで、ユーザーが様々なプリセットを使用して画像を生成・編集できるサービスです。

## テーブル構造

### 1. users（ユーザー）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 25,
  total_credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 2. presets（プリセット）
```sql
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_url TEXT,
  prompt_template TEXT NOT NULL,
  params JSONB NOT NULL, -- PresetParam[] の JSON
  sample_inputs JSONB,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. jobs（生成ジョブ）
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES presets(id),
  status TEXT CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')) DEFAULT 'queued',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  inputs JSONB NOT NULL,
  prompt TEXT,
  credits_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 4. generated_images（生成画像）
```sql
CREATE TABLE generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  storage_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb -- EXIF情報、AI生成パラメータなど
);
```

### 5. user_consents（ユーザー同意）
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  personal_images BOOLEAN DEFAULT false,
  exif_removal BOOLEAN DEFAULT true,
  generation_label BOOLEAN DEFAULT true,
  data_training BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### 6. credit_transactions（クレジット取引）
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'admin_adjustment')) NOT NULL,
  amount INTEGER NOT NULL, -- 正の値は加算、負の値は減算
  balance_after INTEGER NOT NULL,
  reference_type TEXT, -- 'job', 'purchase', etc.
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 7. purchases（購入履歴）
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  pack_name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_jpy INTEGER NOT NULL,
  payment_method TEXT,
  payment_id TEXT, -- Stripe等の決済ID
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 8. shared_results（共有結果）
```sql
CREATE TABLE shared_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 9. user_favorites（お気に入り）
```sql
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES presets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preset_id)
);
```

### 10. image_upload_sessions（画像アップロードセッション）
```sql
CREATE TABLE image_upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  upload_token TEXT UNIQUE NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  storage_url TEXT,
  status TEXT CHECK (status IN ('pending', 'uploaded', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  metadata JSONB DEFAULT '{}'::jsonb
);
```

## インデックス

```sql
-- ユーザー検索用
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ジョブ検索用
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- 画像検索用
CREATE INDEX idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX idx_generated_images_job_id ON generated_images(job_id);
CREATE INDEX idx_generated_images_is_public ON generated_images(is_public);

-- プリセット検索用
CREATE INDEX idx_presets_slug ON presets(slug);
CREATE INDEX idx_presets_tags ON presets USING gin(tags);
CREATE INDEX idx_presets_is_public ON presets(is_public);

-- 取引履歴検索用
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

## Row Level Security (RLS) ポリシー

```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_policy ON users
  FOR ALL USING (auth.uid() = id);

-- ジョブは所有者のみアクセス可能
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_policy ON jobs
  FOR ALL USING (auth.uid() = user_id);

-- 画像は所有者のみアクセス可能（publicを除く）
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY images_policy ON generated_images
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY images_insert_policy ON generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY images_update_policy ON generated_images
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY images_delete_policy ON generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- プリセットは全員閲覧可能、作成者のみ編集可能
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY presets_select_policy ON presets
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY presets_insert_policy ON presets
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY presets_update_policy ON presets
  FOR UPDATE USING (auth.uid() = created_by);
```

## Storage バケット設計

```sql
-- Supabase Storage バケット
-- 1. generated-images: 生成された画像
-- 2. user-uploads: ユーザーがアップロードした画像
-- 3. preset-covers: プリセットのカバー画像
-- 4. user-avatars: ユーザーアバター
```

## 関数とトリガー

```sql
-- クレジット使用時の自動記録
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_job_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT credits INTO v_current_balance FROM users WHERE id = p_user_id FOR UPDATE;
  
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  v_new_balance := v_current_balance - p_amount;
  
  UPDATE users SET credits = v_new_balance WHERE id = p_user_id;
  
  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, reference_type, reference_id
  ) VALUES (
    p_user_id, 'usage', -p_amount, v_new_balance, 'job', p_job_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## 実装上の注意点

1. **認証**: Supabase Auth を使用してユーザー認証を実装
2. **画像保存**: Supabase Storage を使用して画像を保存
3. **リアルタイム更新**: Supabase Realtime でジョブ状態を監視
4. **バックアップ**: 定期的なデータベースバックアップを設定
5. **監視**: ジョブキューと画像生成の監視システムを実装
6. **セキュリティ**: RLS ポリシーを適切に設定し、APIキーを環境変数で管理

## マイグレーション戦略

1. 既存のプリセットデータを `presets` テーブルに移行
2. ローカルストレージの同意データを `user_consents` に移行
3. 既存のジョブ履歴を `jobs` テーブルに移行
4. クレジット残高を `users` テーブルに統合