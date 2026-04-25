-- ============================================================
-- Saree Store — Supabase / PostgreSQL schema
-- Run inside Supabase SQL editor (or psql) to provision tables.
-- IDs are text (not uuid) so app-generated IDs (p_001, ORD-XYZ,
-- chat_xxx, msg_xxx) work end-to-end.
-- Idempotent: safe to re-run.
-- ============================================================

-- ----------------- Products -----------------
create table if not exists products (
  id                     text primary key,
  slug                   text unique not null,
  name                   text not null,
  description            text not null default '',
  -- Pricing
  price_inr              integer not null,
  mrp_inr                integer,
  -- Color
  color                  text not null default '',
  secondary_color        text,
  -- Classification
  fabric                 text not null,
  category               text not null,
  occasion_tags          text[] not null default '{}',
  -- Construction / craft
  weave_pattern          text,
  work_type              text[] default '{}',
  border_type            text,
  motif_pattern          text,
  transparency           text,
  -- Origin / authenticity
  weave_region           text,
  weaver_name            text,
  is_handloom            boolean default false,
  silk_mark_certified    boolean default false,
  -- Dimensions
  length_meters          numeric(3,1) default 5.5,
  weight_grams           integer,
  blouse_included        boolean default true,
  -- Wearability
  season                 text,
  -- Inventory + media
  image_url              text not null default '',
  gallery_urls           text[] default '{}',
  stock_quantity         integer not null default 0,
  status                 text not null default 'active'
                            check (status in ('active','draft','archived')),
  care                   text,
  created_at             timestamptz not null default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_fabric_idx on products(fabric);
create index if not exists products_status_idx on products(status);

-- ----------------- Orders -----------------
create table if not exists orders (
  id                text primary key,
  customer_email    text not null,
  customer_name     text not null,
  customer_phone    text,
  status            text not null default 'pending'
                       check (status in ('pending','confirmed','shipped','delivered','cancelled','returned')),
  total_inr         integer not null,
  currency          text not null default 'INR',
  total_display     numeric(10,2) not null,
  shipping_address  jsonb not null,
  items             jsonb not null,
  tracking_number   text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_email_idx on orders(customer_email);
create index if not exists orders_status_idx on orders(status);

-- ----------------- Chat sessions -----------------
create table if not exists chat_sessions (
  id                  text primary key,
  guest_session_id    text,
  started_at          timestamptz not null default now(),
  last_message_at     timestamptz not null default now(),
  ended_at            timestamptz,
  escalated_to_human  boolean not null default false,
  led_to_purchase     boolean not null default false,
  order_id            text references orders(id) on delete set null
);

create index if not exists chat_sessions_guest_idx on chat_sessions(guest_session_id);

create table if not exists chat_messages (
  id                       text primary key,
  session_id               text not null references chat_sessions(id) on delete cascade,
  role                     text not null check (role in ('user','assistant','system','tool')),
  content                  text not null,
  product_ids_recommended  text[],
  metadata                 jsonb,
  created_at               timestamptz not null default now()
);

create index if not exists chat_messages_session_idx on chat_messages(session_id);

-- ============================================================
-- Seed: 12 sample sarees (run once after creating the table)
-- ============================================================
insert into products (
  id, slug, name, description, price_inr, fabric, color, category,
  occasion_tags, image_url, stock_quantity, status, weave_region,
  blouse_included, length_meters, care
) values
  ('p_001','banarasi-royal-maroon','Royal Maroon Banarasi Silk',
    'Handwoven pure Banarasi silk saree in deep maroon with intricate gold zari work. Features the classic kadhua weave with floral motifs across the body and a heavily ornamented pallu. Comes with an unstitched matching blouse piece.',
    18500,'Banarasi Silk','Maroon','bridal',
    array['wedding','reception','festive'],
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    4,'active','Varanasi, UP',true,5.5,'Dry clean only. Store wrapped in muslin.'),

  ('p_002','kanjivaram-temple-green','Temple Green Kanjivaram',
    'Authentic Kanjivaram silk saree in jewel-tone green with traditional temple borders and a contrasting mustard pallu. Pure mulberry silk with real zari. A timeless heirloom piece from the looms of Kanchipuram.',
    24000,'Kanjivaram Silk','Green','bridal',
    array['wedding','reception','festive'],
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
    2,'active','Kanchipuram, TN',true,6.3,'Dry clean only.'),

  ('p_003','chanderi-pastel-pink','Pastel Pink Chanderi',
    'Lightweight Chanderi silk-cotton saree in soft blush pink with delicate silver butis throughout. Perfect for daytime functions and office wear. Breathable and easy to drape.',
    4200,'Chanderi','Pink','office',
    array['daily','office','festive'],
    'https://images.unsplash.com/photo-1594387303040-a3b6e7b2eb45?w=800&q=80',
    12,'active','Chanderi, MP',true,5.5,'Hand wash with mild detergent.'),

  ('p_004','patola-double-ikat-red','Patola Double Ikat — Crimson',
    'Authentic Patan Patola double-ikat silk saree in crimson red with geometric elephant and parrot motifs. A masterpiece that takes 6 months to weave. Each piece is one-of-a-kind.',
    65000,'Patola Silk','Red','bridal',
    array['wedding','reception','festive'],
    'https://images.unsplash.com/photo-1623891024931-bbf7d97e9b9e?w=800&q=80',
    1,'active','Patan, Gujarat',true,6.0,'Dry clean only. Avoid direct sunlight.'),

  ('p_005','georgette-floral-navy','Navy Floral Georgette',
    'Flowy georgette saree in midnight navy with hand-printed floral motifs and a sequined border. Light, easy to drape, and perfect for cocktail parties and receptions.',
    5800,'Georgette','Navy Blue','party',
    array['party','cocktail','reception'],
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    8,'active',null,true,5.5,'Dry clean recommended.'),

  ('p_006','cotton-jamdani-mustard','Mustard Jamdani Cotton',
    'Handwoven Bengal cotton Jamdani in sunny mustard yellow with white floral motifs. Soft, breathable, and perfect for everyday elegance.',
    2800,'Cotton','Mustard','casual',
    array['daily','office'],
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80',
    15,'active','West Bengal',false,5.5,'Hand wash separately in cold water.'),

  ('p_007','tussar-ivory-zardozi','Ivory Tussar with Zardozi',
    'Pure Tussar silk saree in warm ivory with delicate hand-done zardozi embroidery on the border and pallu. Subtle, elegant, and ideal for daytime weddings or pujas.',
    12500,'Tussar Silk','Ivory','festive',
    array['festive','puja'],
    'https://images.unsplash.com/photo-1606293459260-d4c63c4e3b9b?w=800&q=80',
    6,'active','Bhagalpur, Bihar',true,5.5,'Dry clean only.'),

  ('p_008','bandhani-rani-pink','Rani Pink Bandhani',
    'Vibrant Gujarati Bandhani saree in striking rani pink, hand-tied and dyed in the traditional method. Features a contrast yellow border. Festive and full of life.',
    6500,'Bandhani','Pink','festive',
    array['festive','navratri','haldi'],
    'https://images.unsplash.com/photo-1610189351316-eb74ad9f6c8e?w=800&q=80',
    9,'active','Kutch, Gujarat',true,5.5,'Dry clean only to preserve the dye.'),

  ('p_009','organza-sky-blue-embroidered','Sky Blue Organza Embroidered',
    'Sheer organza saree in sky blue with delicate thread embroidery and a sequined border. Light, ethereal, and perfect for engagement or sangeet.',
    8900,'Organza','Sky Blue','party',
    array['sangeet','engagement','cocktail'],
    'https://images.unsplash.com/photo-1629639898812-a7eaba9712a6?w=800&q=80',
    7,'active',null,true,5.5,'Dry clean only.'),

  ('p_010','linen-stripe-beige','Beige Linen Stripe',
    'Soft linen saree in beige with subtle vertical stripes and a contrasting black border. Effortlessly chic for the modern professional.',
    3200,'Linen','Beige','office',
    array['office','daily'],
    'https://images.unsplash.com/photo-1583391733991-9bbf8e3ba81e?w=800&q=80',
    18,'active',null,false,5.5,'Machine wash gentle.'),

  ('p_011','kalamkari-cotton-indigo','Indigo Kalamkari Cotton',
    'Hand-painted Kalamkari saree on natural cotton in deep indigo with mythological motifs along the pallu. A wearable piece of art from Andhra Pradesh.',
    4500,'Kalamkari','Indigo','casual',
    array['daily','office','festive'],
    'https://images.unsplash.com/photo-1600985949041-3c6ec1c1cc97?w=800&q=80',
    11,'active','Srikalahasti, AP',false,5.5,'Hand wash, dry in shade.'),

  ('p_012','chiffon-blush-sequin','Blush Chiffon with Sequins',
    'Romantic blush-pink chiffon saree with all-over sequin work. Drapes like a dream, perfect for evening receptions and cocktail parties.',
    7200,'Chiffon','Blush','reception',
    array['reception','cocktail','engagement'],
    'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&q=80',
    5,'active',null,true,5.5,'Dry clean only.')
on conflict (id) do nothing;

-- ============================================================
-- Row Level Security (recommended for production — left disabled
-- for the demo since the app uses service_role on the server)
-- ============================================================
-- alter table products      enable row level security;
-- alter table orders        enable row level security;
-- alter table chat_sessions enable row level security;
-- alter table chat_messages enable row level security;
--
-- create policy "products are public" on products for select using (true);
-- create policy "own orders" on orders for select
--   using (customer_email = auth.email());
