-- ============================================================
-- MarshallToday.com — Seed Sample Businesses
-- Run AFTER 001_initial_schema.sql
-- These are real Marshall, MI businesses to get the directory started
-- ============================================================

-- Helper: Get category IDs
-- We'll use a DO block to insert businesses with their categories

DO $$
DECLARE
  cat_restaurants uuid;
  cat_shopping uuid;
  cat_entertainment uuid;
  cat_lodging uuid;
  cat_home uuid;
  cat_auto uuid;
  cat_health uuid;
  cat_professional uuid;
  cat_beauty uuid;
  cat_faith uuid;
  cat_education uuid;
  biz_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_restaurants FROM categories WHERE slug = 'restaurants';
  SELECT id INTO cat_shopping FROM categories WHERE slug = 'shopping';
  SELECT id INTO cat_entertainment FROM categories WHERE slug = 'entertainment';
  SELECT id INTO cat_lodging FROM categories WHERE slug = 'lodging';
  SELECT id INTO cat_home FROM categories WHERE slug = 'home-services';
  SELECT id INTO cat_auto FROM categories WHERE slug = 'auto';
  SELECT id INTO cat_health FROM categories WHERE slug = 'health';
  SELECT id INTO cat_professional FROM categories WHERE slug = 'professional';
  SELECT id INTO cat_beauty FROM categories WHERE slug = 'beauty';
  SELECT id INTO cat_faith FROM categories WHERE slug = 'faith-community';
  SELECT id INTO cat_education FROM categories WHERE slug = 'education';

  -- ==========================================
  -- RESTAURANTS & DINING
  -- ==========================================

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_featured, is_published)
  VALUES ('Schuler''s Restaurant & Pub', 'schulers-restaurant', 'Iconic Marshall dining since 1909', 'A Marshall landmark since 1909, Schuler''s Restaurant & Pub is known for its prime rib, famous bar cheese, and warm hospitality. Located in the heart of downtown Marshall, it''s a destination for locals and visitors alike.', '115 S Eagle St', 'Marshall', 'MI', '49068', '(269) 781-0600', true, true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_restaurants);

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Louie''s Bakery & Cafe', 'louies-bakery', 'Fresh-baked goods and breakfast favorites', 'A beloved local spot for fresh donuts, pastries, sandwiches, and coffee. A Marshall morning tradition.', '141 W Michigan Ave', 'Marshall', 'MI', '49068', '(269) 781-3542', true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_restaurants);

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Dark Horse Brewing Company', 'dark-horse-brewing', 'Craft brewery with a loyal following', 'Dark Horse Brewing Company is a craft brewery known for its creative beers and lively atmosphere. A favorite gathering spot in Marshall.', '511 S Kalamazoo Ave', 'Marshall', 'MI', '49068', '(269) 781-9940', true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_restaurants);
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

  -- ==========================================
  -- ARTS & ENTERTAINMENT
  -- ==========================================

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_featured, is_published)
  VALUES ('American Museum of Magic', 'american-museum-of-magic', 'The world''s largest magic collection on display', 'Home to the largest collection of magic artifacts on public display anywhere in the world. Explore the treasures of Houdini, Thurston, Blackstone, and hundreds more.', '107 E Michigan Ave', 'Marshall', 'MI', '49068', '(269) 781-7570', true, true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Honolulu House Museum', 'honolulu-house-museum', 'Historic 1860 architectural gem', 'Built in 1860 by Abner Pratt, a former U.S. consul to Hawaii, the Honolulu House is one of Marshall''s most iconic historic sites, blending Gothic Revival, Italianate, and Polynesian influences.', '107 N Kalamazoo Ave', 'Marshall', 'MI', '49068', '(269) 781-8544', true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Bogar Theatre', 'bogar-theatre', 'Family-owned historic movie theater', 'A family-owned historic movie theater in the heart of downtown Marshall, featuring current films and a bar area. Part of the Marshall Social District.', '223 E Michigan Ave', 'Marshall', 'MI', '49068', '(269) 781-3511', true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

  -- ==========================================
  -- LODGING
  -- ==========================================

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Villa on Verona', 'villa-on-verona', 'Boutique hotel near downtown Marshall', 'A luxurious boutique hotel in Marshall, pairing modern comfort with classic elegance. Located just a short walk from downtown, it''s the perfect base for exploring Marshall.', '229 Verona Rd', 'Marshall', 'MI', '49068', '(269) 781-7374', true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_lodging);

  -- ==========================================
  -- SHOPPING
  -- ==========================================

  INSERT INTO businesses (name, slug, short_description, description, address, city, state, zip, phone, is_published)
  VALUES ('Walters Gasoline Museum', 'walters-gasoline-museum', 'Automotive and service station memorabilia', 'A fascinating collection of memorabilia related to Midwestern cars, service stations, and the history of Marshall, housed in the old Marshall Interurban Railway Depot.', '220 W Michigan Ave', 'Marshall', 'MI', '49068', NULL, true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_shopping);

  -- ==========================================
  -- More placeholder businesses for variety
  -- ==========================================

  INSERT INTO businesses (name, slug, short_description, address, city, state, zip, phone, is_published)
  VALUES ('U.S. Postal Service Museum', 'us-postal-museum', 'Largest postal collection outside the Smithsonian', '202 E Michigan Ave', 'Marshall', 'MI', '49068', NULL, true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

  INSERT INTO businesses (name, slug, short_description, address, city, state, zip, phone, is_published)
  VALUES ('Marshall Historical Museum', 'marshall-historical-museum', 'Civil War and local history at GAR Hall', '402 E Michigan Ave', 'Marshall', 'MI', '49068', NULL, true)
  RETURNING id INTO biz_id;
  INSERT INTO business_categories (business_id, category_id) VALUES (biz_id, cat_entertainment);

END $$;
