# Nano Banana Lab MVP データベース設計

## 概要

シンプルで実装しやすい MVP 版のデータベース設計。
必要最小限の機能に絞り、後から拡張可能な構造にしています。

## コアテーブル（5 つだけ）

### 1. users（ユーザー）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  credits INTEGER DEFAULT 10,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
```

### 2. generations（画像生成履歴）

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- 生成データ
  prompt TEXT NOT NULL,
  preset_id TEXT, -- プリセットのslug（静的管理）
  inputs JSONB NOT NULL, -- パラメータとImageData

  -- 結果
  image_url TEXT, -- 生成された画像のURL
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT,

  -- メタデータ
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
```

### 3. payments（支払い履歴）

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Stripe情報
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,

  -- 支払い詳細
  amount INTEGER NOT NULL, -- 円単位
  credits INTEGER NOT NULL, -- 購入したクレジット数
  status TEXT DEFAULT 'pending', -- pending, succeeded, failed

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
```

### 4. credit_transactions（クレジット履歴）

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- purchase, usage, bonus
  amount INTEGER NOT NULL, -- 正の値は加算、負の値は減算
  balance_after INTEGER NOT NULL,

  -- 参照
  reference_id UUID, -- generation_idまたはpayment_id
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
```

### 5. user_settings（ユーザー設定）

```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- 同意フラグ
  consent_terms BOOLEAN DEFAULT false,
  consent_privacy BOOLEAN DEFAULT false,

  -- 設定
  email_notifications BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## RLS（Row Level Security）設定

```sql
-- ユーザーは自分のデータのみアクセス可能
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self_policy ON users
  FOR ALL USING (auth.uid() = id);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY generations_policy ON generations
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_policy ON payments
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_transactions_policy ON credit_transactions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_policy ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

## データベース関数

```sql
-- クレジット使用（トランザクション保証）
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_generation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- 残高確認と更新（アトミック）
  UPDATE users
  SET credits = credits - p_amount
  WHERE id = p_user_id AND credits >= p_amount
  RETURNING credits INTO v_balance;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- 履歴記録
  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, reference_id
  ) VALUES (
    p_user_id, 'usage', -p_amount, v_balance, p_generation_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- クレジット追加（購入後）
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id UUID
) RETURNS void AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  UPDATE users
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_balance;

  INSERT INTO credit_transactions (
    user_id, type, amount, balance_after, reference_id
  ) VALUES (
    p_user_id, 'purchase', p_amount, v_balance, p_payment_id
  );
END;
$$ LANGUAGE plpgsql;

-- updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Stripe Webhook 処理

```typescript
// Stripe Webhookイベント処理例
async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // 支払い記録を更新
      await supabase
        .from("payments")
        .update({
          status: "succeeded",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      // クレジットを追加
      const payment = await getPaymentByStripeId(paymentIntent.id);
      if (payment) {
        await supabase.rpc("add_credits", {
          p_user_id: payment.user_id,
          p_amount: payment.credits,
          p_payment_id: payment.id,
        });
      }
      break;

    case "customer.created":
      const customer = event.data.object as Stripe.Customer;

      // ユーザーにStripe顧客IDを紐付け
      await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("email", customer.email);
      break;
  }
}
```

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

## 画像保存方針

1. **生成画像**: Supabase Storage に保存
2. **入力画像**: 保存しない（メモリ上で処理のみ）
3. **プリセット画像**: 静的ファイルとして public フォルダに配置

```typescript
// Supabase Storage設定
const { data, error } = await supabase.storage
  .from("generated-images")
  .upload(`${userId}/${generationId}.png`, imageBlob, {
    contentType: "image/png",
    upsert: false,
  });

// 公開URL取得
const {
  data: { publicUrl },
} = supabase.storage
  .from("generated-images")
  .getPublicUrl(`${userId}/${generationId}.png`);
```

## 初期マイグレーション

```sql
-- 1_create_users.sql
CREATE TABLE users (...);

-- 2_create_generations.sql
CREATE TABLE generations (...);

-- 3_create_payments.sql
CREATE TABLE payments (...);

-- 4_create_credit_transactions.sql
CREATE TABLE credit_transactions (...);

-- 5_create_user_settings.sql
CREATE TABLE user_settings (...);

-- 6_create_functions.sql
CREATE FUNCTION use_credits(...);
CREATE FUNCTION add_credits(...);
CREATE FUNCTION update_updated_at(...);

-- 7_create_triggers.sql
CREATE TRIGGER update_users_updated_at...;
CREATE TRIGGER update_user_settings_updated_at...;

-- 8_enable_rls.sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... 他のRLSポリシー
```

## クレジットパック料金（Stripe Products）

```javascript
const creditPacks = [
  {
    id: "pack_10",
    credits: 10,
    price: 500, // 500円
    stripe_price_id: "price_xxx",
  },
  {
    id: "pack_30",
    credits: 30,
    price: 1200, // 1,200円（お得）
    stripe_price_id: "price_yyy",
  },
  {
    id: "pack_100",
    credits: 100,
    price: 3500, // 3,500円（さらにお得）
    stripe_price_id: "price_zzz",
  },
];
```

## 実装の優先順位

### Phase 1（最初の 1 週間）

1. Supabase Auth 設定
2. users テーブル作成
3. generations テーブルと基本的な生成機能

### Phase 2（2 週目）

4. Stripe 決済統合
5. payments、credit_transactions テーブル
6. クレジット管理機能

### Phase 3（3 週目）

7. user_settings テーブル
8. RLS ポリシー強化
9. 画像ストレージ最適化

## メモ

- プリセットはデータベースではなくコードで管理（`/lib/presets.ts`）
- 複雑な機能（お気に入り、共有、API 使用統計など）は後回し
- まずは「生成できて、課金できる」を目指す
- Supabase Realtime 機能は当面使わない（ポーリングで十分）
