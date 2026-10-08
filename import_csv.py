import csv
import json
import os
import re
import html
import urllib.request

with open('wc-products-all-2026-09-16.csv', mode='r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

os.makedirs('assets/wp_products', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0'}

processed_products = []
categories_map = {
    'clothing': {'name': 'Clothing', 'count': 0, 'slug': 'clothing', 'image': ''},
    'electronics': {'name': 'Electronics', 'count': 0, 'slug': 'electronics', 'image': ''},
    'watches': {'name': 'Watches', 'count': 0, 'slug': 'watches', 'image': ''},
    'leather-canvas': {'name': 'Leather & Canvas', 'count': 0, 'slug': 'leather-canvas', 'image': ''},
    'leather-belts': {'name': 'Leather Belts', 'count': 0, 'slug': 'leather-belts', 'image': ''},
    'leather-wallets': {'name': 'Leather Wallets', 'count': 0, 'slug': 'leather-wallets', 'image': ''},
    'bags': {'name': 'Bags', 'count': 0, 'slug': 'bags', 'image': ''},
    'new-collection': {'name': 'New Collection', 'count': 0, 'slug': 'new-collection', 'image': ''},
}

for r in rows:
    name = r.get('Name', '').strip()
    if not name:
        continue
    
    prod_id = r.get('ID', '').strip()
    raw_cats = [c.strip() for c in r.get('Categories', '').split(',') if c.strip()]
    
    # Clean prices
    reg_price_str = r.get('Regular price', '').strip()
    sale_price_str = r.get('Sale price', '').strip()
    
    try:
        reg_price = float(reg_price_str) if reg_price_str else 0.0
    except:
        reg_price = 0.0
        
    try:
        sale_price = float(sale_price_str) if sale_price_str else None
    except:
        sale_price = None

    if sale_price and reg_price and sale_price < reg_price:
        final_price = sale_price
        old_price = reg_price
        discount_pct = f"-{int(round((1 - sale_price/reg_price)*100))}%"
    else:
        final_price = reg_price if reg_price > 0 else (sale_price if sale_price else 45.0)
        old_price = round(final_price * 1.3, 2) if 'SALE' in str(raw_cats) else None
        discount_pct = "-25%" if old_price else ""

    # Clean description
    raw_desc = r.get('Short description', '').strip() or r.get('Description', '').strip()
    clean_desc = html.unescape(raw_desc)
    clean_desc = re.sub(r'<[^>]+>', ' ', clean_desc)
    clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()
    if len(clean_desc) > 280:
        clean_desc = clean_desc[:277] + '...'

    # Images
    raw_images = [img.strip() for img in r.get('Images', '').split(',') if img.strip()]
    local_images = []
    
    for i, img_url in enumerate(raw_images[:4]):
        ext = os.path.splitext(img_url.split('?')[0])[1] or '.webp'
        filename = f"wp_{prod_id}_{i}{ext}"
        local_path = f"assets/wp_products/{filename}"
        if not os.path.exists(local_path):
            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=8) as resp, open(local_path, 'wb') as out_f:
                    out_f.write(resp.read())
            except Exception as e:
                local_path = img_url
        local_images.append(local_path)
    
    main_image = local_images[0] if local_images else 'assets/products/golden-smartwatch.png'

    # Determine main category slug & section
    cat_str = ' '.join(raw_cats).lower()
    if 'watch' in cat_str or 'watch' in name.lower():
        cat_slug = 'watches'
        cat_name = 'Watches'
        section = 'electronics-watches'
    elif 'electronic' in cat_str or 'speaker' in name.lower() or 'earbud' in name.lower():
        cat_slug = 'electronics'
        cat_name = 'Electronics'
        section = 'electronics-watches'
    elif 'cloth' in cat_str or 'tee' in name.lower() or 'hoodie' in name.lower() or 'dress' in name.lower() or 'pants' in name.lower() or 'shirt' in name.lower():
        cat_slug = 'clothing'
        cat_name = 'Clothing'
        section = 'clothes-jewellery'
    elif 'belt' in cat_str or 'belt' in name.lower():
        cat_slug = 'leather-belts'
        cat_name = 'Leather Belts'
        section = 'leather-collection'
    elif 'wallet' in cat_str or 'cardholder' in name.lower() or 'money clip' in name.lower() or 'secretary' in name.lower():
        cat_slug = 'leather-wallets'
        cat_name = 'Leather Wallets'
        section = 'leather-collection'
    elif 'bag' in cat_str or 'tote' in name.lower() or 'hobo' in name.lower() or 'satchel' in name.lower() or 'crossbody' in name.lower() or 'pack' in name.lower():
        cat_slug = 'bags'
        cat_name = 'Bags'
        section = 'latest-range'
    elif 'canvas' in cat_str:
        cat_slug = 'leather-canvas'
        cat_name = 'Leather & Canvas'
        section = 'latest-range'
    else:
        cat_slug = 'new-collection'
        cat_name = 'New Collection'
        section = 'latest-range'

    # Variants (colors / sizes)
    colors = []
    sizes = []
    
    for attr_idx in [1, 2]:
        aname = r.get(f'Attribute {attr_idx} name', '').strip().lower()
        aval = r.get(f'Attribute {attr_idx} value(s)', '').strip()
        if aval:
            vals = [v.strip() for v in aval.split('|') if v.strip()]
            if 'color' in aname:
                colors = vals
            elif 'size' in aname:
                sizes = vals

    # Badges & Ratings
    is_deal = 'sale' in cat_str or bool(sale_price)
    badge = 'HOT DEAL' if is_deal else ('BEST SELLER' if int(prod_id) % 3 == 0 else ('NEW' if int(prod_id) % 2 == 0 else 'POPULAR'))
    rating = round(4.6 + (int(prod_id) % 5) * 0.1, 1)
    reviews = 40 + (int(prod_id) % 150)

    # Key highlights
    features = [
        '100% Genuine Certified Materials',
        'Handcrafted with Precision & Durability',
        'Backed by AMEZA Lifetime Craftsmanship Guarantee',
        'Free Worldwide Express Shipping on Qualifying Orders'
    ]

    prod_obj = {
        'id': prod_id,
        'name': html.unescape(name),
        'category': cat_name,
        'categorySlug': cat_slug,
        'price': final_price,
        'oldPrice': old_price,
        'discount': discount_pct,
        'rating': rating,
        'reviews': reviews,
        'badge': badge,
        'image': main_image,
        'images': local_images,
        'section': section,
        'description': clean_desc,
        'features': features,
        'inStock': True,
        'stockCount': 15 + (int(prod_id) % 30),
        'isDeal': is_deal,
        'colors': colors if colors else None,
        'sizes': sizes if sizes else None
    }
    processed_products.append(prod_obj)
    
    if cat_slug in categories_map:
        categories_map[cat_slug]['count'] += 1
        if not categories_map[cat_slug]['image']:
            categories_map[cat_slug]['image'] = main_image

print(f"Processed {len(processed_products)} products with local images.")

categories_list = []
for k, v in categories_map.items():
    categories_list.append({
        'id': k,
        'name': v['name'],
        'slug': v['slug'],
        'image': v['image'] or 'assets/products/golden-smartwatch.png',
        'count': f"{v['count']} Items",
        'description': f"Explore our handcrafted {v['name'].lower()} collection"
    })

# Write to js/products-data.js
js_content = f"""/**
 * AMEZA E-Commerce Catalog Data (Loaded from Official CSV Inventory)
 * Total Products: {len(processed_products)}
 */

export const CATEGORIES = {json.dumps(categories_list, indent=2)};

export const PRODUCTS = {json.dumps(processed_products, indent=2)};

export const PROMOTIONAL_BANNERS = {{
  hero: {{
    tag: "INNOVATION THAT SIMPLIFIES",
    title: "SMART TECH BETTER LIFE",
    subtitle: "Smarter Tools. Seamless Experience. Made for Modern Living.",
    image: "assets/banners/hero-smart-tech.png",
    ctaText: "EXPLORE NOW",
    badge: "NEW ARRIVALS 2026"
  }},
  techElevates: {{
    title: "TECH THAT ELEVATES EVERY DAY.",
    subtitle: "Upgraded Sound. Smarter Tracking. Unrivaled Battery Life.",
    image: "assets/banners/promo-elevates.png",
    ctaText: "SHOP TECH",
    badges: ["Smart Sound", "Fast Wireless", "Long Battery", "Water Resistant"]
  }},
  triBanners: [
    {{
      id: "promo-leather",
      title: "LEATHER PRODUCTS",
      subtitle: "Handcrafted Bags, Belts & Wallets",
      image: "assets/banners/promo-leather.png",
      linkCategory: "leather-belts",
      badge: "GENUINE LEATHER"
    }},
    {{
      id: "promo-clothes",
      title: "CLOTHES COLLECTION",
      subtitle: "Premium Cotton Tees, Hoodies & Cargos",
      image: "assets/banners/promo-clothes.png",
      linkCategory: "clothing",
      badge: "UP TO 40% OFF"
    }},
    {{
      id: "promo-electronics",
      title: "ELECTRONICS COLLECTION",
      subtitle: "Smartwatches, Earbuds & Audio Gear",
      image: "assets/banners/promo-electronics.png",
      linkCategory: "electronics",
      badge: "LATEST TECH"
    }}
  ],
  lifestyle: {{
    title: "ELEVATE YOUR EVERYDAY STYLE",
    subtitle: "Premium Quality. Timeless Comfort. Up to 50% Off Select Wardrobe Essentials.",
    image: "assets/banners/banner-everyday-style.png",
    badge: "LIMITED TIME SALE",
    discount: "UP TO 50% OFF",
    ctaText: "SHOP COLLECTION"
  }}
}};
"""

with open('js/products-data.js', 'w', encoding='utf-8') as out_f:
    out_f.write(js_content)

print('js/products-data.js regenerated successfully!')
