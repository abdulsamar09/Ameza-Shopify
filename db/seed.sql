-- =====================================================================
-- AMEZA Multi-Vendor Marketplace: Catalog Seed
-- Loads House Seller "AMEZA Official" (0% commission) and 51 Products
-- =====================================================================

-- 1. Create Placeholder Profile & House Seller
INSERT INTO public.profiles (id, first_name, last_name, email, phone, role)
VALUES ('00000000-0000-0000-0000-000000000002', 'AMEZA', 'Official', 'official@example.com', '+15550100100', 'super_admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sellers (id, user_id, store_name, slug, description, status, commission_override_pct, is_trusted, country)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'AMEZA Official',
    'ameza-official',
    'Official AMEZA Flagship Collection. 100% Genuine Certified Luxury & Lifestyle Goods.',
    'approved',
    0.00,
    TRUE,
    'US'
)
ON CONFLICT (slug) DO UPDATE SET 
    commission_override_pct = 0.00,
    is_trusted = TRUE,
    status = 'approved';

-- 2. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('clothing', 'Clothing', 'clothing', 'Explore our handcrafted clothing collection across the United States', 'assets/wp_products/wp_250_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('electronics', 'Electronics', 'electronics', 'Explore our handcrafted electronics collection across the United States', 'assets/wp_products/wp_281_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('watches', 'Watches', 'watches', 'Explore our handcrafted watches collection across the United States', 'assets/wp_products/wp_284_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('leather-canvas', 'Leather & Canvas', 'leather-canvas', 'Explore our handcrafted leather & canvas collection across the United States', 'assets/wp_products/wp_52_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('leather-belts', 'Leather Belts', 'leather-belts', 'Explore our handcrafted leather belts collection across the United States', 'assets/wp_products/wp_500_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('leather-wallets', 'Leather Wallets', 'leather-wallets', 'Explore our handcrafted leather wallets collection across the United States', 'assets/wp_products/wp_115_0.jpg', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('bags', 'Bags', 'bags', 'Explore our handcrafted bags collection across the United States', 'assets/wp_products/wp_549_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order)
VALUES ('new-collection', 'New Collection', 'new-collection', 'Explore our handcrafted new collection collection across the United States', 'assets/wp_products/wp_149_0.webp', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- 3. Insert 51 Products
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '549',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Small Driftwood Tote',
    'small-driftwood-tote-549',
    'The perfect daily carryall, the Small Driftwood Tote seamlessly transitions from dockside mornings to farmers market afternoons. Handcrafted from heavy, industrial-grade 18oz cotto...',
    'The perfect daily carryall, the Small Driftwood Tote seamlessly transitions from dockside mornings to farmers market afternoons. Handcrafted from heavy, industrial-grade 18oz cotton canvas and premium full-grain, vegetable-tanned leather, it is built for exceptional durability...',
    5999,
    7999,
    'BEST SELLER',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    139,
    'published',
    FALSE,
    TRUE,
    24
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '536',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Simple Mini Hobo Shoulder',
    'simple-mini-hobo-shoulder-536',
    'Crafted from smooth, waxy full-grain leather that softens and develops a rich patina with use, the Simple Mini Hobo Shoulder bag features a relaxed, lightweight, and unlined silhou...',
    'Crafted from smooth, waxy full-grain leather that softens and develops a rich patina with use, the Simple Mini Hobo Shoulder bag features a relaxed, lightweight, and unlined silhouette. A secure top YKK zipper opens to a streamlined interior with a single slip pocket for easy ...',
    14999,
    18999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    126,
    'published',
    FALSE,
    TRUE,
    41
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '530',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    '365 All Leather Tote',
    '365-all-leather-tote-530',
    'Our 365 Signature Leather Tote is handcrafted from a soft and supple full-grain, vegetable-tanned leather. Featuring large exterior pockets and a detachable 100% cotton herringbone...',
    'Our 365 Signature Leather Tote is handcrafted from a soft and supple full-grain, vegetable-tanned leather. Featuring large exterior pockets and a detachable 100% cotton herringbone adjustable crossbody strap with a removable gel shoulder pad for convenient carrying and easy ac...',
    22999,
    27999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    120,
    'published',
    FALSE,
    TRUE,
    35
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '520',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Simple Mini Satchel',
    'simple-mini-satchel-520',
    'Crafted from smooth, waxy full-grain leather that beautifully softens with age, the Simple Mini Satchel features a lightweight, unlined construction that celebrates its natural mat...',
    'Crafted from smooth, waxy full-grain leather that beautifully softens with age, the Simple Mini Satchel features a lightweight, unlined construction that celebrates its natural materials. A secure top YKK zipper opens to a streamlined interior with a single slip pocket, while ...',
    13999,
    16999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    110,
    'published',
    FALSE,
    TRUE,
    25
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '510',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Everyday Double Zip Leather Crossbody',
    'everyday-double-zip-leather-crossbody-510',
    'Handcrafted from premium full-grain, vegetable-tanned leather, the Everyday Double Zip Crossbody is the ultimate hands-free companion. It features two spacious zippered compartment...',
    'Handcrafted from premium full-grain, vegetable-tanned leather, the Everyday Double Zip Crossbody is the ultimate hands-free companion. It features two spacious zippered compartments for effortless organization, a quick-access exterior snap pocket, and a detachable, highly adju...',
    16999,
    21999,
    'BEST SELLER',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    100,
    'published',
    FALSE,
    TRUE,
    15
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '500',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Hand Painted Color Block Belt',
    'hand-painted-color-block-belt-500',
    'Handcrafted from heavyweight, full-grain, vegetable-tanned leather, each Hand-Painted Color-Block Belt is an individual work of art. Artisans meticulously hand-paint the leather an...',
    'Handcrafted from heavyweight, full-grain, vegetable-tanned leather, each Hand-Painted Color-Block Belt is an individual work of art. Artisans meticulously hand-paint the leather and add intentional creases to deliver a beautifully rich, time-worn vintage effect. Completed with...',
    5999,
    7999,
    'NEW',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    90,
    'published',
    FALSE,
    TRUE,
    35
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '490',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Baez Wild Ones Belt',
    'baez-wild-ones-belt-490',
    'Rooted in a spirit of artistry and independence, the Baez Wild Ones Belt features premium antiqued, full-grain vegetable-tanned leather beautifully adorned with western filigree em...',
    'Rooted in a spirit of artistry and independence, the Baez Wild Ones Belt features premium antiqued, full-grain vegetable-tanned leather beautifully adorned with western filigree embossing, antique brass circular studs, and central antique silver diamond studs. Complete with a ...',
    6499,
    8499,
    'NEW',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    80,
    'published',
    FALSE,
    TRUE,
    25
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '456',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Western Lace Belts',
    'western-lace-belts-456',
    'Handcrafted for ultimate rugged durability, this belt is built from heavyweight, full-grain, vegetable-tanned American bison leather with a distinctive shrunken texture. It feature...',
    'Handcrafted for ultimate rugged durability, this belt is built from heavyweight, full-grain, vegetable-tanned American bison leather with a distinctive shrunken texture. It features a steel-molded antiqued buckle attached via custom-engraved Chicago screws, allowing you to eas...',
    6499,
    8499,
    'BEST SELLER',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    46,
    'published',
    FALSE,
    TRUE,
    21
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '435',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Shrunken American Bison Belt',
    'shrunken-american-bison-belt-435',
    'Handcrafted for ultimate rugged durability, this belt is built from heavyweight, full-grain, vegetable-tanned American bison leather with a distinctive shrunken texture. It feature...',
    'Handcrafted for ultimate rugged durability, this belt is built from heavyweight, full-grain, vegetable-tanned American bison leather with a distinctive shrunken texture. It features a steel-molded antiqued buckle attached via custom-engraved Chicago screws, allowing you to eas...',
    5499,
    6999,
    'BEST SELLER',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    175,
    'published',
    FALSE,
    TRUE,
    30
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '407',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Saddle Belt',
    'saddle-belt-407',
    'Reimagined from a cherished family heirloom, this classic 35mm jean and khaki belt is crafted from premium, full-grain vegetable-tanned leather—the same resilient grade used for eq...',
    'Reimagined from a cherished family heirloom, this classic 35mm jean and khaki belt is crafted from premium, full-grain vegetable-tanned leather—the same resilient grade used for equestrian saddles and harnesses. Infused with natural oils and waxes for a stunning, durable finis...',
    4999,
    6499,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    147,
    'published',
    FALSE,
    TRUE,
    32
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '284',
    '00000000-0000-0000-0000-000000000001',
    'watches',
    'CASIO Enticer Men Analog Watch',
    'casio-enticer-men-analog-watch-284',
    'The Casio Enticer Men Analog Watch blends classic styling with dependable Japanese quartz precision, making it a reliable everyday companion....',
    'The Casio Enticer Men Analog Watch blends classic styling with dependable Japanese quartz precision, making it a reliable everyday companion.',
    4999,
    6999,
    'NEW',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    174,
    'published',
    FALSE,
    TRUE,
    29
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '281',
    '00000000-0000-0000-0000-000000000001',
    'electronics',
    'Compact Portable Speaker',
    'compact-portable-speaker-281',
    'Affordable Bluetooth speaker with balanced sound....',
    'Affordable Bluetooth speaker with balanced sound.',
    2999,
    3999,
    'POPULAR',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    171,
    'published',
    FALSE,
    TRUE,
    26
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '278',
    '00000000-0000-0000-0000-000000000001',
    'electronics',
    'Wireless Party Speaker',
    'wireless-party-speaker-278',
    'Loud sound output suitable for indoor and outdoor use....',
    'Loud sound output suitable for indoor and outdoor use.',
    6999,
    8999,
    'NEW',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    168,
    'published',
    FALSE,
    TRUE,
    23
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '274',
    '00000000-0000-0000-0000-000000000001',
    'electronics',
    'Portable Bluetooth Speaker',
    'portable-bluetooth-speaker-274',
    'Compact speaker with punchy bass and long playback...',
    'Compact speaker with punchy bass and long playback',
    2499,
    3499,
    'NEW',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    164,
    'published',
    FALSE,
    TRUE,
    19
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '270',
    '00000000-0000-0000-0000-000000000001',
    'watches',
    'Premium Smartwatch',
    'premium-smartwatch-270',
    'Modern design with multiple sports and calling features...',
    'Modern design with multiple sports and calling features',
    8999,
    11999,
    'BEST SELLER',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    160,
    'published',
    FALSE,
    TRUE,
    15
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '267',
    '00000000-0000-0000-0000-000000000001',
    'watches',
    'Everyday Smartwatch',
    'everyday-smartwatch-267',
    'Lightweight smartwatch with health monitoring tools....',
    'Lightweight smartwatch with health monitoring tools.',
    6999,
    8999,
    'BEST SELLER',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    157,
    'published',
    FALSE,
    TRUE,
    42
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '264',
    '00000000-0000-0000-0000-000000000001',
    'watches',
    'Bluetooth Calling Smartwatch',
    'bluetooth-calling-smartwatch-264',
    'Stylish smartwatch with fitness tracking features....',
    'Stylish smartwatch with fitness tracking features.',
    9999,
    12999,
    'BEST SELLER',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    154,
    'published',
    FALSE,
    TRUE,
    39
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '260',
    '00000000-0000-0000-0000-000000000001',
    'watches',
    'Fitness Smartwatch',
    'fitness-smartwatch-260',
    'Tracks heart rate, sleep, and activity efficiently....',
    'Tracks heart rate, sleep, and activity efficiently.',
    4999,
    6499,
    'NEW',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    150,
    'published',
    FALSE,
    TRUE,
    35
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '257',
    '00000000-0000-0000-0000-000000000001',
    'electronics',
    'True Wireless Earbuds',
    'true-wireless-earbuds-257',
    'Comfortable fit with clear calling and deep bass....',
    'Comfortable fit with clear calling and deep bass.',
    3499,
    4999,
    'POPULAR',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    147,
    'published',
    FALSE,
    TRUE,
    32
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '254',
    '00000000-0000-0000-0000-000000000001',
    'electronics',
    'Budget Wireless Earbuds',
    'budget-wireless-earbuds-254',
    'Long battery backup with immersive sound quality....',
    'Long battery backup with immersive sound quality.',
    2499,
    3499,
    'NEW',
    'electronics-watches',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    144,
    'published',
    FALSE,
    TRUE,
    29
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '250',
    '00000000-0000-0000-0000-000000000001',
    'clothing',
    'Men’s Utility Cargo Pants',
    'men-s-utility-cargo-pants-250',
    'Comfortable loose-fit cargo trousers with multiple pockets....',
    'Comfortable loose-fit cargo trousers with multiple pockets.',
    4999,
    6499,
    'NEW',
    'clothes-jewellery',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    140,
    'published',
    FALSE,
    TRUE,
    25
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '246',
    '00000000-0000-0000-0000-000000000001',
    'clothing',
    'Graphic Printed Cotton Tee',
    'graphic-printed-cotton-tee-246',
    'Breathable 100% cotton t-shirt with trendy graphic print....',
    'Breathable 100% cotton t-shirt with trendy graphic print.',
    2499,
    3499,
    'BEST SELLER',
    'clothes-jewellery',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    136,
    'published',
    FALSE,
    TRUE,
    21
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '239',
    '00000000-0000-0000-0000-000000000001',
    'clothing',
    'Unisex Winter Hoodie',
    'unisex-winter-hoodie-239',
    'Cozy fleece hoodie with modern oversized design for casual wear....',
    'Cozy fleece hoodie with modern oversized design for casual wear.',
    4999,
    6499,
    'POPULAR',
    'clothes-jewellery',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    129,
    'published',
    FALSE,
    TRUE,
    44
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '236',
    '00000000-0000-0000-0000-000000000001',
    'clothing',
    'Savana Apricot Ruffle A-Line Dress',
    'savana-apricot-ruffle-a-line-dress-236',
    'Lightweight floral dress with ruffle detailing and comfortable fit....',
    'Lightweight floral dress with ruffle detailing and comfortable fit.',
    4499,
    5999,
    'NEW',
    'clothes-jewellery',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    126,
    'published',
    FALSE,
    TRUE,
    41
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '233',
    '00000000-0000-0000-0000-000000000001',
    'clothing',
    'Oversized Casual Cotton T-Shirt',
    'oversized-casual-cotton-t-shirt-233',
    'Soft cotton fabric with relaxed fit for everyday streetwear styling....',
    'Soft cotton fabric with relaxed fit for everyday streetwear styling.',
    2499,
    3499,
    'POPULAR',
    'clothes-jewellery',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    123,
    'published',
    FALSE,
    TRUE,
    38
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '208',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'English Bevel Edge Jean Belt',
    'english-bevel-edge-jean-belt-208',
    'Our English Bevel Edge Jean Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather...',
    'Our English Bevel Edge Jean Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather',
    3999,
    5499,
    'HOT DEAL',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    98,
    'published',
    TRUE,
    TRUE,
    43
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '204',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Two-Tone Five Strand Braided Belt',
    'two-tone-five-strand-braided-belt-204',
    'Crafted from glossy and burnished, full grain, vegetable tanned leather, this two tone design brings added depth and character to a classic silhouette...',
    'Crafted from glossy and burnished, full grain, vegetable tanned leather, this two tone design brings added depth and character to a classic silhouette',
    2999,
    3999,
    'HOT DEAL',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    94,
    'published',
    TRUE,
    TRUE,
    39
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '201',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Twelve Strand Luxe Crafted Braided Belt',
    'twelve-strand-luxe-crafted-braided-belt-201',
    'Crafted from matte and burnished, full-grain, vegetable-tanned leather, this belt showcases the depth and dimension that only true hand braiding can achieve....',
    'Crafted from matte and burnished, full-grain, vegetable-tanned leather, this belt showcases the depth and dimension that only true hand braiding can achieve.',
    3499,
    4499,
    'HOT DEAL',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    91,
    'published',
    TRUE,
    TRUE,
    36
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '196',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Everyday Pack Canvas & Leather',
    'everyday-pack-canvas-leather-196',
    'Our Canvas & Leather Everyday Pack is handcrafted with industrial-grade 18-ounce 100% cotton canvas (or 14-ounce cotton denim) and trimmed with full-grain, vegetable-tanned leather...',
    'Our Canvas & Leather Everyday Pack is handcrafted with industrial-grade 18-ounce 100% cotton canvas (or 14-ounce cotton denim) and trimmed with full-grain, vegetable-tanned leather.',
    8999,
    11999,
    'HOT DEAL',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    86,
    'published',
    TRUE,
    TRUE,
    31
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '154',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Twenty Four Seven Canvas & Leather Tote',
    'twenty-four-seven-canvas-leather-tote-154',
    'Our Twenty-Four Seven Canvas and Leather Tote is handcrafted with industrial-grade 18-ounce 100% cotton canvas (or 14-ounce denim) and full-grain vegetable-tanned leather trim...',
    'Our Twenty-Four Seven Canvas and Leather Tote is handcrafted with industrial-grade 18-ounce 100% cotton canvas (or 14-ounce denim) and full-grain vegetable-tanned leather trim',
    13999,
    17999,
    'HOT DEAL',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    44,
    'published',
    TRUE,
    TRUE,
    19
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '149',
    '00000000-0000-0000-0000-000000000001',
    'new-collection',
    'OVAL KEY FOB',
    'oval-key-fob-149',
    'Handcrafted in a small Florentine workshop, the Oval Shaped Key Fob honors true heritage craft—built for durability and designed for easy use....',
    'Handcrafted in a small Florentine workshop, the Oval Shaped Key Fob honors true heritage craft—built for durability and designed for easy use.',
    1999,
    2499,
    'POPULAR',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    189,
    'published',
    FALSE,
    TRUE,
    44
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '146',
    '00000000-0000-0000-0000-000000000001',
    'new-collection',
    'Golden Age Mini Basketball',
    'golden-age-mini-basketball-146',
    'This vintage mini leather basketball embodies the rugged charm and craftsmanship of an earlier era...',
    'This vintage mini leather basketball embodies the rugged charm and craftsmanship of an earlier era',
    2999,
    3999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    186,
    'published',
    FALSE,
    TRUE,
    41
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '144',
    '00000000-0000-0000-0000-000000000001',
    'new-collection',
    'ITALIAN CARD CASE',
    'italian-card-case-144',
    'Minimal by design and timeless by nature, the Italian Card Case is handcrafted from premium vegetable-tanned leather sourced in Italy....',
    'Minimal by design and timeless by nature, the Italian Card Case is handcrafted from premium vegetable-tanned leather sourced in Italy.',
    3999,
    4999,
    'BEST SELLER',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    184,
    'published',
    FALSE,
    TRUE,
    39
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '139',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Simple Mini “V” Hobo',
    'simple-mini-v-hobo-139',
    'The Simple “V” Hobo is crafted from smooth, waxy full-grain leather that softens and gains character with every day of use....',
    'The Simple “V” Hobo is crafted from smooth, waxy full-grain leather that softens and gains character with every day of use.',
    13999,
    17499,
    'POPULAR',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    179,
    'published',
    FALSE,
    TRUE,
    34
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '133',
    '00000000-0000-0000-0000-000000000001',
    'new-collection',
    'Simple Mini Double Handle Shoulder',
    'simple-mini-double-handle-shoulder-133',
    'The Simple Double Handle Shoulder is crafted from smooth, waxy full-grain leather that softens and develops character with every mile....',
    'The Simple Double Handle Shoulder is crafted from smooth, waxy full-grain leather that softens and develops character with every mile.',
    14999,
    18999,
    'POPULAR',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    173,
    'published',
    FALSE,
    TRUE,
    28
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '115',
    '00000000-0000-0000-0000-000000000001',
    'leather-wallets',
    'William Pocket Secretary',
    'william-pocket-secretary-115',
    'The William Pocket Secretary is handcrafted from certified full-grain, glazed, vegetable-tanned Italian leather, and features corner elbows in antique brass to ensure a lifetime of...',
    'The William Pocket Secretary is handcrafted from certified full-grain, glazed, vegetable-tanned Italian leather, and features corner elbows in antique brass to ensure a lifetime of use',
    7999,
    9999,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.6,
    155,
    'published',
    FALSE,
    TRUE,
    40
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '112',
    '00000000-0000-0000-0000-000000000001',
    'leather-wallets',
    'Signature Women’s Cardholder Wallet',
    'signature-women-s-cardholder-wallet-112',
    'Soft, organized, and designed for everyday carry....',
    'Soft, organized, and designed for everyday carry.',
    4499,
    5999,
    'NEW',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    152,
    'published',
    FALSE,
    TRUE,
    37
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '107',
    '00000000-0000-0000-0000-000000000001',
    'leather-wallets',
    'Classic Money Clip',
    'classic-money-clip-107',
    'The Classic Money Clip is handcrafted from full-grain, vegetable-tanned leather....',
    'The Classic Money Clip is handcrafted from full-grain, vegetable-tanned leather.',
    2999,
    3999,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    147,
    'published',
    FALSE,
    TRUE,
    32
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '103',
    '00000000-0000-0000-0000-000000000001',
    'leather-wallets',
    'Tradesman Slim Wallet',
    'tradesman-slim-wallet-103',
    'The William Tradesman Slim Wallet is handcrafted from certified full-grain, vegetable-tanned Italian leather....',
    'The William Tradesman Slim Wallet is handcrafted from certified full-grain, vegetable-tanned Italian leather.',
    5999,
    7999,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    143,
    'published',
    FALSE,
    TRUE,
    28
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '99',
    '00000000-0000-0000-0000-000000000001',
    'leather-wallets',
    'Classic Billfold',
    'classic-billfold-99',
    'Our Classic Billfold is handcrafted from full-grain, vegetable-tanned leather....',
    'Our Classic Billfold is handcrafted from full-grain, vegetable-tanned leather.',
    4999,
    6499,
    'BEST SELLER',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    139,
    'published',
    FALSE,
    TRUE,
    24
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '97',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Leather Braided Wax Cord Belt',
    'leather-braided-wax-cord-belt-97',
    'Our Leather Braided Wax Cord Belt is handcrafted from full-grain, vegetable-tanned, heavy-gauge 100% cotton waxed cord...',
    'Our Leather Braided Wax Cord Belt is handcrafted from full-grain, vegetable-tanned, heavy-gauge 100% cotton waxed cord',
    4999,
    6499,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    137,
    'published',
    FALSE,
    TRUE,
    22
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '94',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Western Lace Belt',
    'western-lace-belt-94',
    'Our Western Lace Belt is handcrafted with full-grain, vegetable-tanned leather....',
    'Our Western Lace Belt is handcrafted with full-grain, vegetable-tanned leather.',
    5999,
    7999,
    'NEW',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    134,
    'published',
    FALSE,
    TRUE,
    19
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '88',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'VINTAGE WASHED BELT',
    'vintage-washed-belt-88',
    'Our Vintage Washed Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather...',
    'Our Vintage Washed Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather',
    4499,
    5999,
    'NEW',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    128,
    'published',
    FALSE,
    TRUE,
    43
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '83',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Leather Buckle Belt',
    'leather-buckle-belt-83',
    'Our Leather Buckle Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather....',
    'Our Leather Buckle Belt is handcrafted with heavyweight, full-grain, vegetable-tanned leather.',
    5499,
    6999,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.9,
    123,
    'published',
    FALSE,
    TRUE,
    38
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '79',
    '00000000-0000-0000-0000-000000000001',
    'leather-belts',
    'Saddle Belt',
    'saddle-belt-79',
    'Reimagined from a cherished belt inherited by Will from his grandfather, this classic jean belt is crafted from the same premium leather used for harnesses, bridles, and saddles...',
    'Reimagined from a cherished belt inherited by Will from his grandfather, this classic jean belt is crafted from the same premium leather used for harnesses, bridles, and saddles',
    4999,
    6499,
    'POPULAR',
    'leather-collection',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    119,
    'published',
    FALSE,
    TRUE,
    34
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '76',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Otto Crossbody',
    'otto-crossbody-76',
    'The Otto Crossbody Bag is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather....',
    'The Otto Crossbody Bag is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather.',
    19999,
    24999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    116,
    'published',
    FALSE,
    TRUE,
    31
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '56',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Phone Crossbody Mini',
    'phone-crossbody-mini-56',
    'The Mini Phone Crossbody is handcrafted from full-grain, vegetable-tanned leather. An exterior pocket keeps your phone at the ready, while three tab-closure credit card slots keep ...',
    'The Mini Phone Crossbody is handcrafted from full-grain, vegetable-tanned leather. An exterior pocket keeps your phone at the ready, while three tab-closure credit card slots keep you organized.',
    7999,
    9999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.7,
    96,
    'published',
    FALSE,
    TRUE,
    41
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '54',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Rainier Leather Backpack',
    'rainier-leather-backpack-54',
    'The Rainier Backpack is handcrafted with full-grain, vegetable-tanned leather. Three exterior pockets feature leather loop and tab closures to secure your belongings...',
    'The Rainier Backpack is handcrafted with full-grain, vegetable-tanned leather. Three exterior pockets feature leather loop and tab closures to secure your belongings',
    22999,
    28999,
    'BEST SELLER',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    94,
    'published',
    FALSE,
    TRUE,
    39
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '52',
    '00000000-0000-0000-0000-000000000001',
    'leather-canvas',
    'Wallace Messenger Bag',
    'wallace-messenger-bag-52',
    'The Wallace Messenger Bag is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather....',
    'The Wallace Messenger Bag is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather.',
    18999,
    23999,
    'NEW',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    92,
    'published',
    FALSE,
    TRUE,
    37
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '49',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Simple Tote',
    'simple-tote-49',
    'Our Simple Tote is handcrafted from full-grain, vegetable-tanned leather....',
    'Our Simple Tote is handcrafted from full-grain, vegetable-tanned leather.',
    12999,
    15999,
    'POPULAR',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    5,
    89,
    'published',
    FALSE,
    TRUE,
    34
) ON CONFLICT (legacy_id) DO NOTHING;
INSERT INTO public.products (
    legacy_id, seller_id, category_id, title, slug, short_description, description_html,
    base_price, compare_at_price, badge, section, features, commission_override_pct,
    rating_avg, rating_count, status, is_deal, in_stock, stock_count
) VALUES (
    '47',
    '00000000-0000-0000-0000-000000000001',
    'bags',
    'Lennon Canvas & Leather Backpack',
    'lennon-canvas-leather-backpack-47',
    'The Lennon Backpack is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather. A large leather flap secures with leather straps and ...',
    'The Lennon Backpack is handcrafted with industrial-grade 18-ounce 100% cotton canvas and full-grain, vegetable-tanned leather. A large leather flap secures with leather straps and steel snaps, and a leather drawstring keeps your belongings secure.',
    19999,
    24999,
    'POPULAR',
    'latest-range',
    '["100% Genuine Certified Materials","Handcrafted with Precision & Durability","Backed by AMEZA Lifetime Craftsmanship Guarantee","Free U.S. Standard Shipping on orders over $100"]'::jsonb,
    0.00,
    4.8,
    87,
    'published',
    FALSE,
    TRUE,
    32
) ON CONFLICT (legacy_id) DO NOTHING;
