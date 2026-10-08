-- =====================================================================
-- AMEZA Multi-Vendor Marketplace: Initial Database Schema (Phase 1)
-- Target: PostgreSQL 14+ / Supabase
-- All monetary amounts stored as INTEGER/BIGINT in minor units (cents).
-- =====================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. PROFILES & ROLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE public.app_role AS ENUM ('guest', 'customer', 'seller', 'admin_staff', 'super_admin');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- =====================================================================
-- 2. SELLERS & APPLICATIONS
-- =====================================================================

CREATE TYPE public.seller_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended');

CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
    store_name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    status public.seller_status NOT NULL DEFAULT 'submitted',
    commission_override_pct NUMERIC(5,2) DEFAULT NULL, -- NULL = fallback to category/global
    is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
    country TEXT NOT NULL DEFAULT 'US',
    city TEXT,
    policies JSONB DEFAULT '{"shipping": "", "refund": ""}'::jsonb,
    settings JSONB DEFAULT '{"accentColor": "#7FB73C", "vacationMode": false}'::jsonb,
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.seller_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL DEFAULT 'individual', -- 'individual' | 'company'
    tax_id TEXT,
    id_document_url TEXT,
    status public.seller_status NOT NULL DEFAULT 'under_review',
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.seller_payout_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL, -- 'bank', 'jazzcash', 'easypaisa', 'paypal', 'stripe'
    account_title TEXT NOT NULL,
    details_encrypted TEXT NOT NULL, -- PII encrypted at rest
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 3. CATEGORIES & CATALOG
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- e.g. 'clothing', 'electronics'
    parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    commission_rate_pct NUMERIC(5,2) DEFAULT NULL, -- Category override
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE public.product_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'archived');

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE, -- e.g. '549', '536' for backward compat with CSV
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT,
    description_html TEXT,
    base_price BIGINT NOT NULL, -- Cents (e.g. 5700 = $57.00)
    compare_at_price BIGINT,     -- Cents
    cost_price BIGINT,           -- Cents (Private to seller)
    badge TEXT,                  -- 'BEST SELLER', 'NEW', 'HOT DEAL'
    section TEXT,                -- 'electronics-watches', 'clothes-jewellery', etc.
    features JSONB DEFAULT '[]'::jsonb,
    commission_override_pct NUMERIC(5,2) DEFAULT NULL, -- Highest priority
    rating_avg NUMERIC(3,2) DEFAULT 0.00,
    rating_count INTEGER NOT NULL DEFAULT 0,
    status public.product_status NOT NULL DEFAULT 'published',
    is_deal BOOLEAN NOT NULL DEFAULT FALSE,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    stock_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    options JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"color": "Red", "size": "M"}
    price_adjustment BIGINT NOT NULL DEFAULT 0,  -- Cents adjustment from base_price
    stock_count INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. ORDERS & MULTI-VENDOR SPLITTING
-- =====================================================================

CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'partially_fulfilled', 'fulfilled', 'cancelled', 'refunded');

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status public.order_status NOT NULL DEFAULT 'pending',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    subtotal BIGINT NOT NULL,       -- Cents
    discount_total BIGINT NOT NULL DEFAULT 0,
    shipping_total BIGINT NOT NULL DEFAULT 0,
    grand_total BIGINT NOT NULL,    -- Cents
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment_method TEXT NOT NULL DEFAULT 'card', -- 'card', 'cod'
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE public.sub_order_status AS ENUM (
    'pending', 'confirmed', 'packed', 'shipped', 'delivered', 
    'completed', 'cancelled', 'return_requested', 'returned', 'refunded', 'disputed'
);

CREATE TABLE IF NOT EXISTS public.seller_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    sub_order_number TEXT NOT NULL UNIQUE,
    status public.sub_order_status NOT NULL DEFAULT 'pending',
    subtotal BIGINT NOT NULL,          -- Cents
    shipping_amount BIGINT NOT NULL DEFAULT 0,
    commission_total BIGINT NOT NULL,  -- Cents platform commission
    seller_net_earnings BIGINT NOT NULL, -- Cents subtotal - commission + shipping
    payout_status TEXT NOT NULL DEFAULT 'on_hold', -- 'on_hold', 'available', 'paid_out'
    delivered_at TIMESTAMPTZ,
    hold_until TIMESTAMPTZ,
    tracking_carrier TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_order_id UUID NOT NULL REFERENCES public.seller_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    variant_title TEXT,
    unit_price BIGINT NOT NULL,        -- Cents snapshot
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal BIGINT NOT NULL,          -- Cents snapshot
    commission_rate_pct NUMERIC(5,2) NOT NULL, -- Snapshot at order time
    commission_amount BIGINT NOT NULL, -- Cents snapshot
    seller_earnings BIGINT NOT NULL,   -- Cents snapshot
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 5. DOUBLE-ENTRY WALLET & LEDGER (APPEND-ONLY)
-- =====================================================================

CREATE TYPE public.ledger_entry_type AS ENUM (
    'sale', 'commission', 'shipping_income', 'gateway_fee', 
    'refund', 'commission_reversal', 'payout', 'adjustment', 'cod_commission_due'
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    seller_order_id UUID REFERENCES public.seller_orders(id) ON DELETE SET NULL,
    payout_id UUID,
    entry_type public.ledger_entry_type NOT NULL,
    amount BIGINT NOT NULL, -- Positive = credit, Negative = debit (Cents)
    bucket TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'available', 'paid_out'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE RESTRICT,
    amount BIGINT NOT NULL, -- Cents
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payout_method_id UUID NOT NULL REFERENCES public.seller_payout_methods(id),
    status TEXT NOT NULL DEFAULT 'requested', -- 'requested', 'approved', 'processing', 'paid', 'rejected'
    admin_reference TEXT,
    proof_file_url TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.profiles(id)
);

-- =====================================================================
-- 6. CUSTOMER DATA: ADDRESSES, WISHLIST, REVIEWS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'US',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seller_order_id UUID REFERENCES public.seller_orders(id) ON DELETE SET NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb,
    seller_reply TEXT,
    seller_replied_at TIMESTAMPTZ,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 7. COUPONS, CMS & SETTINGS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE, -- NULL = platform coupon
    discount_type TEXT NOT NULL DEFAULT 'percent', -- 'percent', 'fixed'
    discount_value BIGINT NOT NULL, -- e.g. 20 for 20% or 1000 for $10.00
    min_spend BIGINT NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    layout_name TEXT NOT NULL DEFAULT 'Default',
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role, layout_name)
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_seller_orders_parent ON public.seller_orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_seller_orders_seller ON public.seller_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_ledger_seller ON public.ledger_entries(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
