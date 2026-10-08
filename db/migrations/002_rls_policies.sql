-- =====================================================================
-- AMEZA Multi-Vendor Marketplace: Row Level Security (RLS) Policies (Phase 1)
-- Target: PostgreSQL 14+ / Supabase
-- Ensures strict tenant isolation and role separation.
-- =====================================================================

-- Helper functions to check roles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY CASE role 
    WHEN 'super_admin' THEN 1 
    WHEN 'admin_staff' THEN 2 
    WHEN 'seller' THEN 3 
    WHEN 'customer' THEN 4 
    ELSE 5 
  END
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_staff', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_seller_id()
RETURNS UUID AS $$
  SELECT id FROM public.sellers 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================================
-- 1. PROFILES RLS
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner or admin"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be updated by owner"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- =====================================================================
-- 2. SELLERS RLS
-- =====================================================================
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved sellers are publicly viewable"
ON public.sellers FOR SELECT
USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Sellers can update their own store settings"
ON public.sellers FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- 3. PRODUCTS & VARIANTS RLS
-- =====================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are viewable by everyone"
ON public.products FOR SELECT
USING (status = 'published' OR seller_id = public.current_seller_id() OR public.is_admin());

CREATE POLICY "Sellers can insert their own products"
ON public.products FOR INSERT
WITH CHECK (seller_id = public.current_seller_id() OR public.is_admin());

CREATE POLICY "Sellers can update their own products"
ON public.products FOR UPDATE
USING (seller_id = public.current_seller_id() OR public.is_admin());

CREATE POLICY "Sellers can delete their own products"
ON public.products FOR DELETE
USING (seller_id = public.current_seller_id() OR public.is_admin());

-- Images & Variants inherit product ownership
CREATE POLICY "Product images viewable by all"
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Product variants viewable by all"
ON public.product_variants FOR SELECT USING (true);

-- =====================================================================
-- 4. ORDERS & SUB-ORDERS RLS
-- =====================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers see only their own parent orders
CREATE POLICY "Customers see own orders"
ON public.orders FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Customers can create orders"
ON public.orders FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Sellers see ONLY sub-orders for their store; customers see sub-orders of their parent orders
CREATE POLICY "Sellers and customers see relevant seller_orders"
ON public.seller_orders FOR SELECT
USING (
  seller_id = public.current_seller_id() 
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = parent_order_id AND o.customer_id = auth.uid())
  OR public.is_admin()
);

CREATE POLICY "Sellers can update their sub-order status"
ON public.seller_orders FOR UPDATE
USING (seller_id = public.current_seller_id() OR public.is_admin());

-- Order items follow sub-orders
CREATE POLICY "Order items access"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.seller_orders so 
    WHERE so.id = seller_order_id 
    AND (so.seller_id = public.current_seller_id() OR public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = so.parent_order_id AND o.customer_id = auth.uid()
    ))
  )
);

-- =====================================================================
-- 5. LEDGER ENTRIES & PAYOUTS RLS (Double-entry security)
-- =====================================================================
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers view own ledger"
ON public.ledger_entries FOR SELECT
USING (seller_id = public.current_seller_id() OR public.is_admin());

CREATE POLICY "Only system or admin can insert ledger entries"
ON public.ledger_entries FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Sellers view and request own payouts"
ON public.payout_requests FOR SELECT
USING (seller_id = public.current_seller_id() OR public.is_admin());

CREATE POLICY "Sellers can submit payout requests"
ON public.payout_requests FOR INSERT
WITH CHECK (seller_id = public.current_seller_id());

-- =====================================================================
-- 6. ADDRESSES & WISHLISTS RLS
-- =====================================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their addresses"
ON public.addresses FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users own their wishlists"
ON public.wishlists FOR ALL
USING (user_id = auth.uid());
