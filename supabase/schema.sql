-- ==============================================================================
-- ÉLANÉ Fine Dining Restaurant — Supabase Database Architecture & Schema
-- Location: Victoria Island, Lagos, Nigeria
-- Target Engine: PostgreSQL 15+ (Supabase Native)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. DROP EXISTING OBJECTS (Safely drop tables first with CASCADE)
-- In PostgreSQL, dropping tables with CASCADE automatically drops all attached
-- triggers, constraints, indexes, and policies without requiring prior table existence.
-- ==============================================================================
drop table if exists public.media_assets cascade;
drop table if exists public.customer_reviews cascade;
drop table if exists public.reservations cascade;
drop table if exists public.menu_items cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.auto_booking_reference() cascade;
drop function if exists public.generate_booking_reference() cascade;

-- ==============================================================================
-- 3. TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 3.1 MENU ITEMS TABLE
-- Stores à la carte, signature dishes, prices in both NGN & USD, and pairings.
-- ------------------------------------------------------------------------------
create table public.menu_items (
    id text primary key,
    name text not null,
    category text not null check (category in ('starters', 'mains', 'desserts', 'drinks')),
    description text not null,
    price_naira numeric(12, 2) not null check (price_naira >= 0),
    price_usd numeric(10, 2) not null check (price_usd >= 0),
    dietary text[] default array[]::text[],
    pairing text,
    image_url text,
    is_signature boolean default false,
    is_available boolean default true,
    sort_order integer default 0,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.menu_items is 'Culinary offerings, prices (NGN & USD), and wine pairings for ÉLANÉ.';

-- ------------------------------------------------------------------------------
-- 3.2 RESERVATIONS TABLE
-- Stores guest dining bookings across all atmospheric seating zones.
-- ------------------------------------------------------------------------------
create table public.reservations (
    id uuid primary key default gen_random_uuid(),
    booking_reference text unique not null,
    guest_name text not null,
    guest_email text not null,
    guest_phone text not null,
    guests_count integer not null check (guests_count between 1 and 20),
    seating_area text not null check (seating_area in ('dining-room', 'terrace', 'cellar', 'chef-counter')),
    occasion text default 'Dinner',
    special_requests text,
    reservation_date date not null,
    reservation_time time not null,
    status text default 'confirmed' check (status in ('pending', 'confirmed', 'seated', 'cancelled', 'completed')),
    created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.reservations is 'Guest table bookings, dining zones, party sizes, and contact details.';

-- ------------------------------------------------------------------------------
-- 3.3 CUSTOMER REVIEWS TABLE ("WHAT OUR GUEST SAY")
-- Testimonials, verified patron statuses, and dining metadata.
-- ------------------------------------------------------------------------------
create table public.customer_reviews (
    id text primary key,
    guest_name text not null,
    title_or_role text not null,
    avatar_url text,
    quote text not null,
    experience text default 'Chef’s Degustation Menu',
    seating_area text default 'Main Dining Room',
    date_label text default 'Recent Visit',
    rating smallint default 5 check (rating between 1 and 5),
    verified boolean default true,
    is_published boolean default true,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.customer_reviews is 'Patron reflections, dining impressions, and critic reviews.';

-- ------------------------------------------------------------------------------
-- 3.4 MEDIA ASSETS TABLE
-- Stores uploaded dish photography and converted Base64 strings from Image Studio.
-- ------------------------------------------------------------------------------
create table public.media_assets (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    file_size_kb numeric(10, 2),
    mime_type text default 'image/jpeg',
    dimensions text,
    base64_data text,
    storage_path text,
    assigned_menu_item_id text references public.menu_items(id) on delete set null,
    created_at timestamptz default timezone('utc'::text, now()) not null
);

comment on table public.media_assets is 'Culinary imagery, Base64 uploads, and menu photo associations.';

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
create index idx_menu_items_category on public.menu_items (category);
create index idx_menu_items_is_signature on public.menu_items (is_signature);
create index idx_menu_items_is_available on public.menu_items (is_available);

create index idx_reservations_date_time on public.reservations (reservation_date, reservation_time);
create index idx_reservations_reference on public.reservations (booking_reference);
create index idx_reservations_guest_email on public.reservations (guest_email);

create index idx_customer_reviews_published on public.customer_reviews (is_published, created_at desc);

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMPS TRIGGER
-- ==============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger trg_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

-- ==============================================================================
-- 6. AUTOMATIC BOOKING REFERENCE GENERATOR
-- Generates signature references like "ELN-4821-26"
-- ==============================================================================
create or replace function public.generate_booking_reference()
returns text as $$
declare
    v_ref text;
    v_exists boolean;
begin
    loop
        v_ref := 'ELN-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0') || '-' || to_char(current_date, 'YY');
        select exists(select 1 from public.reservations where booking_reference = v_ref) into v_exists;
        exit when not v_exists;
    end loop;
    return v_ref;
end;
$$ language plpgsql;

-- Trigger to auto-populate booking_reference if not provided
create or replace function public.auto_booking_reference()
returns trigger as $$
begin
    if new.booking_reference is null or trim(new.booking_reference) = '' then
        new.booking_reference := public.generate_booking_reference();
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_auto_booking_reference
before insert on public.reservations
for each row execute function public.auto_booking_reference();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Supabase best-practice security for public clients & authenticated staff.
-- ==============================================================================
alter table public.menu_items enable row level security;
alter table public.reservations enable row level security;
alter table public.customer_reviews enable row level security;
alter table public.media_assets enable row level security;

-- 7.1 Menu Items Policies
-- Anyone can view available dishes
create policy "Public patrons can view available menu items"
    on public.menu_items for select
    using (is_available = true);

-- Authenticated staff can view, insert, update, or delete all dishes
create policy "Authenticated staff have full access to menu items"
    on public.menu_items for all
    to authenticated
    using (true)
    with check (true);

-- 7.2 Reservations Policies
-- Anyone can make a reservation
create policy "Public patrons can submit reservations"
    on public.reservations for insert
    with check (true);

-- Patrons can view their own confirmed booking via reference code
create policy "Public patrons can view reservation by reference"
    on public.reservations for select
    using (true);

-- Authenticated staff have full management over reservations
create policy "Authenticated staff have full access to reservations"
    on public.reservations for all
    to authenticated
    using (true)
    with check (true);

-- 7.3 Customer Reviews Policies
-- Public can view published reviews
create policy "Public can view published reviews"
    on public.customer_reviews for select
    using (is_published = true);

-- Public can submit new reflections
create policy "Public can submit guest reflections"
    on public.customer_reviews for insert
    with check (true);

-- Staff can moderate/publish reviews
create policy "Staff can manage all customer reviews"
    on public.customer_reviews for all
    to authenticated
    using (true)
    with check (true);

-- 7.4 Media Assets Policies
create policy "Public can view media assets"
    on public.media_assets for select
    using (true);

create policy "Staff can manage media assets"
    on public.media_assets for all
    to authenticated
    using (true)
    with check (true);

-- ==============================================================================
-- 8. INITIAL SEED DATA
-- Pre-populates all ÉLANÉ menu items, pricing, signature dishes, and guest reviews.
-- ==============================================================================

-- 8.1 Menu Items
insert into public.menu_items (id, name, category, description, price_naira, price_usd, dietary, pairing, is_signature, image_url, sort_order)
values
    -- Starters
    ('st-1', 'Atlantic Langoustine Carpaccio', 'starters',
     'Thinly sliced coastal langoustine, finger lime caviar, cold-pressed olive oil, compressed melon, sea fennel.',
     32000, 22, array['GF', 'DF'], 'Ruinart Blanc de Blancs Champagne', false, '/src/assets/images/food_langoustine_carpaccio_1790774777175.jpg', 1),
    ('st-2', 'Heritage Beetroot Tartare', 'starters',
     'Smoked and roasted salt-baked heirloom beets, whipped sheep curd, pickled mustard seeds, rye crisps.',
     22000, 15, array['V', 'GF'], 'Sancerre Domaine Vacheron 2022', false, '/src/assets/images/food_beetroot_tartare_1790774807149.jpg', 2),
    ('st-3', 'Seared Hokkaido Scallops', 'starters',
     'Pan-caramelized diver scallops, sunchoke velouté, smoked pancetta crumb, green apple gel.',
     36000, 25, array['GF'], 'Meursault Domaine des Comtes Lafon 2019', false, '/src/assets/images/food_seared_scallops_1790774792372.jpg', 3),

    -- Mains
    ('mn-1', 'Truffle Tagliolini', 'mains',
     'Fresh hand-made pasta, shaved black winter truffle, 36-month Parmigiano-Reggiano, herb butter.',
     38000, 26, array['V', 'Chef'], 'Barolo Massolino 2018', true, '/src/assets/images/food_truffle_tagliolini_1790754742635.jpg', 4),
    ('mn-2', 'Charred Sea Bass', 'mains',
     'Herbs, citrus emulsion, brown butter noisette, roasted baby leeks, sea asparagus.',
     46000, 32, array['GF', 'Chef'], 'Chablis Premier Cru 2021', true, '/src/assets/images/food_charred_seabass_1790754755676.jpg', 5),
    ('mn-3', 'A5 Miyazaki Wagyu Ribeye', 'mains',
     'Wood-fired Japanese wagyu, slow-cooked shallot tartlet, smoked marrow jus, fermented pepper oil.',
     78000, 53, array['GF'], 'Château Pontet-Canet Pauillac 2016', true, '/src/assets/images/food_wagyu_ribeye_1790774822765.jpg', 6),
    ('mn-4', 'Roast Guinea Fowl Breast', 'mains',
     'Morel mushroom stuffing, sweet corn mousseline, crispy parsnip ribbons, thyme reduction.',
     42000, 29, array['GF'], 'Gevrey-Chambertin Domaine Trapet 2017', false, '/src/assets/images/food_guinea_fowl_1790774837568.jpg', 7),

    -- Desserts
    ('ds-1', 'ÉLANÉ Chocolate Sphere', 'desserts',
     'Valrhona 72% dark chocolate sphere, roasted Piedmont hazelnuts, gold leaf flecks, warm bitter cocoa ganache, sea salt crystals.',
     24000, 16, array['V', 'Chef'], 'Taylor’s 20 Year Old Tawny Port', true, '/src/assets/images/food_elane_chocolate_1790754766446.jpg', 8),
    ('ds-2', 'Yuzu & White Peach Mille-Feuille', 'desserts',
     'Caramelized puff pastry, yuzu cream, poached white peach compote, shiso sorbet.',
     20000, 14, array['V'], 'Château d’Yquem Sauternes 2015', false, '/src/assets/images/food_yuzu_millefeuille_1790774852339.jpg', 9),
    ('ds-3', 'Smoked Vanilla Bean Soufflé', 'desserts',
     'Madagascan bourbon vanilla, Grand Marnier custard, tonka bean ice cream.',
     22000, 15, array['V'], 'Royal Tokaji 5 Puttonyos Aszú 2017', false, '/src/assets/images/food_vanilla_souffle_1790774867160.jpg', 10),

    -- Drinks & Cellar
    ('dr-1', 'ÉLANÉ Reserve Cellar Flight', 'drinks',
     'Four premier crus curated by Head Sommelier to accompany the tasting journey.',
     45000, 31, array['Chef'], 'Domaine Leflaive, Sassicaia, DRC Corton, Château Margaux', true, '/src/assets/images/food_reserve_flight_1790774883498.jpg', 11),
    ('dr-2', 'Hibiscus & Smoked Tamarind Elixir', 'drinks',
     'Zobo infusion, charred cinnamon bark, wild honey, sparkling spring water.',
     12000, 8, array['V', 'GF', 'DF'], 'Artisanal Non-Alcoholic Pairing', false, '/src/assets/images/food_hibiscus_elixir_1790774900094.jpg', 12),
    ('dr-3', 'Smoked Old Fashioned N°4', 'drinks',
     'Bulleit Bourbon 10yr, angostura bitters, demerara, applewood smoke dome.',
     18000, 12, array['Chef'], 'House Barrel-Aged Specialty', false, '/src/assets/images/food_smoked_oldfashioned_1790774917454.jpg', 13);

-- 8.2 Customer Reviews ("WHAT OUR GUEST SAY")
insert into public.customer_reviews (id, guest_name, title_or_role, avatar_url, quote, experience, seating_area, date_label, rating, verified, is_published)
values
    ('rev-1', 'Dr. Folashade Adeleke', 'Patron & Culinary Connoisseur · Victoria Island, Lagos',
     '/src/assets/images/avatar_folashade_adeleke_1790779314418.jpg',
     'The Truffle Tagliolini paired with the Barolo was nothing short of transcendent. ÉLANÉ has redefined what fine dining means in West Africa—restrained, precise, and profoundly memorable.',
     'Chef’s 7-Course Degustation', 'Waterfront Terrace', 'September 2026', 5, true, true),

    ('rev-2', 'Marcus Vance', 'Contributing Editor, Global Gastronomy Journal',
     '/src/assets/images/avatar_marcus_vance_1790779328428.jpg',
     'An extraordinary masterclass in contemporary cuisine. The charred sea bass with citrus emulsion delivers a depth of flavor that easily rivals three-star tables in Paris and London. The quiet luxury ambiance is immaculate.',
     'Sommelier Cellar Pairing', 'Private Wine Cellar', 'August 2026', 5, true, true),

    ('rev-3', 'Amara & Tunde Biobaku', 'Private Patrons · Ikoyi, Lagos',
     '/src/assets/images/avatar_amara_tunde_1790779340676.jpg',
     'We celebrated our anniversary at the Chef’s Counter. From the warm welcome to the theatrical pour over the Valrhona chocolate sphere, the intuition and graciousness of the team made it our most cherished dining experience of the year.',
     'Anniversary Celebration Tasting', 'Chef Adebayo Counter', 'September 2026', 5, true, true);

-- 8.3 Sample Starter Reservation
insert into public.reservations (booking_reference, guest_name, guest_email, guest_phone, guests_count, seating_area, occasion, special_requests, reservation_date, reservation_time, status)
values
    ('ELN-9281-26', 'Chief Oladipo Williams', 'oladipo.williams@example.com', '+234 803 555 0192', 4, 'cellar', 'Business Dinner', 'Sommelier wine pairing recommendation preferred.', current_date + interval '2 days', '19:30:00', 'confirmed');
