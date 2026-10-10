# AMEZA Retired Files Archive Manifest (`_trash/`)

This directory stores archived, completed, or deprecated files that are no longer actively loaded or referenced in the production codebase. **Nothing is permanently deleted.**

All moves preserve original sub-paths. Direct HTTP access to `_trash/` is blocked by `server.js` (returns 404) and excluded from production deployments in `.vercelignore`.

---

## Archived Files Register

| Original Path | Archived Location (`_trash/`) | Reason | Date | Replaced By | How to Restore |
|---|---|---|---|---|---|
| `assets/amezashopify logo.png` | `_trash/assets/amezashopify logo.png` | Unused 1.1 MB logo file containing legacy platform name | 2026-10-10 | `assets/brand/ameza-logo.svg` & `assets/brand/ameza-logo.png` | `Move-Item "_trash/assets/amezashopify logo.png" "assets/amezashopify logo.png"` |
| `scripts/generate_placeholders.js` | `_trash/scripts/generate_placeholders.js` | One-off asset generation script that has already run | 2026-10-10 | Real product imagery & SVG assets | `Move-Item "_trash/scripts/generate_placeholders.js" "scripts/generate_placeholders.js"` |
| `scripts/clean_legacy_references.js` | `_trash/scripts/clean_legacy_references.js` | One-off sanitization script that has already completed | 2026-10-10 | `scripts/check_usa.js` | `Move-Item "_trash/scripts/clean_legacy_references.js" "scripts/clean_legacy_references.js"` |
| `scripts/fix_travel_content.js` | `_trash/scripts/fix_travel_content.js` | One-off content patcher that already executed | 2026-10-10 | Verified travel pages (`travel/*.html`) | `Move-Item "_trash/scripts/fix_travel_content.js" "scripts/fix_travel_content.js"` |
| `scripts/extract_travel_files.ps1` | `_trash/scripts/extract_travel_files.ps1` | One-off extraction PowerShell script | 2026-10-10 | Direct repository tracking in `travel/` | `Move-Item "_trash/scripts/extract_travel_files.ps1" "scripts/extract_travel_files.ps1"` |
| `scripts/apply_unified_layout.js` | `_trash/scripts/apply_unified_layout.js` | Initial migration script; superseded by modular engines | 2026-10-10 | `shared/js/core/layout.js` & `server.js` | `Move-Item "_trash/scripts/apply_unified_layout.js" "scripts/apply_unified_layout.js"` |
| `scripts/fix_all_banned_terms.js` | `_trash/scripts/fix_all_banned_terms.js` | One-off regex replacement script that already completed | 2026-10-10 | Automated CI guard: `scripts/check_usa.js` | `Move-Item "_trash/scripts/fix_all_banned_terms.js" "scripts/fix_all_banned_terms.js"` |
| `scripts/apply_pricing_to_products_data.js` | `_trash/scripts/apply_pricing_to_products_data.js` | One-off catalog price normalizer that has already run | 2026-10-10 | `shared/js/core/pricing.js` & unit minor units | `Move-Item "_trash/scripts/apply_pricing_to_products_data.js" "scripts/apply_pricing_to_products_data.js"` |
| `scripts/update_stays_nav.js` | `_trash/scripts/update_stays_nav.js` | One-off navigation updater script | 2026-10-10 | Static HTML & layout engine updates | `Move-Item "_trash/scripts/update_stays_nav.js" "scripts/update_stays_nav.js"` |
| `shared/js/core/currency.js` | `_trash/shared/js/core/currency.js` | Duplicate currency engine | 2026-10-10 | `shared/js/currency.js` | `git mv "_trash/shared/js/core/currency.js" "shared/js/core/currency.js"` |

---

## Strict Invariants
1. **Never Trashed**: `db/`, `shared/data/mock/`, `js/api/` (all API clients), 8 category images, travel suite files, active test suite (`tests/` & `scripts/test_*.js`), and documentation (`docs/`).
2. **Dev Pages Reserved**: Development test harnesses (`prototype-index.html`, `selftest.html`, `ui-kit.html`, `mail-outbox.html`) reside in `/dev/`, never trashed.
