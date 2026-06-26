-- ============================================================
-- La Pelukeria PV — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (profiles linked to auth.users) ──────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'peluquero', 'recepcionista')),
  peluquero_id  UUID,    -- set if role = peluquero
  color         TEXT DEFAULT '#C8B89A',
  avatar_url    TEXT,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Clients ────────────────────────────────────────────────
CREATE TABLE public.clients (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  rut            TEXT UNIQUE NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  birth_date     DATE,
  loyalty_points INTEGER DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Services ───────────────────────────────────────────────
CREATE TABLE public.services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK (category IN ('Corte', 'Color', 'Tratamientos', 'Otros')),
  price       INTEGER NOT NULL,   -- CLP
  duration    INTEGER NOT NULL,   -- minutes
  active      BOOLEAN DEFAULT TRUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Peluqueros (team members) ──────────────────────────────
CREATE TABLE public.peluqueros (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES public.users(id),
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#C8B89A',  -- calendar color
  avatar     TEXT,
  bio        TEXT,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Availability config (weekly schedule per peluquero) ────
CREATE TABLE public.availability_config (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  peluquero_id UUID REFERENCES public.peluqueros(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
  open_time    TIME,   -- NULL = day off
  close_time   TIME,
  UNIQUE(peluquero_id, day_of_week)
);

-- ── Blocked slots ──────────────────────────────────────────
CREATE TABLE public.blocked_slots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  peluquero_id UUID REFERENCES public.peluqueros(id) ON DELETE CASCADE,  -- NULL = all
  date         DATE NOT NULL,
  hour_start   INTEGER NOT NULL,
  hour_end     INTEGER NOT NULL,
  reason       TEXT,
  created_by   UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Appointments ───────────────────────────────────────────
CREATE TABLE public.appointments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID REFERENCES public.clients(id),
  client_name   TEXT NOT NULL,       -- denormalized for quick display
  client_phone  TEXT NOT NULL,
  service_id    UUID REFERENCES public.services(id),
  peluquero_id  UUID REFERENCES public.peluqueros(id),
  date          DATE NOT NULL,
  hour          INTEGER NOT NULL,
  minute        INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (status IN ('pendiente','confirmada','en_atencion','completada','cancelada')),
  notes         TEXT,
  price_paid    INTEGER,             -- filled on completion
  payment_method TEXT,
  source        TEXT DEFAULT 'admin' CHECK (source IN ('admin','web')),
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Loyalty transactions ───────────────────────────────────
CREATE TABLE public.loyalty_transactions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id      UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  type           TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'manual')),
  points         INTEGER NOT NULL,   -- positive = earned, negative = redeemed
  description    TEXT,
  created_by     UUID REFERENCES public.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inventory items ────────────────────────────────────────
CREATE TABLE public.inventory_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  brand       TEXT,
  category    TEXT,
  stock       INTEGER DEFAULT 0,
  stock_min   INTEGER DEFAULT 1,
  cost_price  INTEGER,           -- CLP
  unit        TEXT DEFAULT 'unidad',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inventory movements ────────────────────────────────────
CREATE TABLE public.inventory_movements (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id    UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('entrada', 'salida')),
  quantity   INTEGER NOT NULL,
  reason     TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cash register ──────────────────────────────────────────
CREATE TABLE public.cash_register (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  amount         INTEGER NOT NULL,           -- CLP
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo','debito','credito','transferencia')),
  service_name   TEXT,
  client_name    TEXT,
  loyalty_discount INTEGER DEFAULT 0,
  notes          TEXT,
  closed         BOOLEAN DEFAULT FALSE,
  created_by     UUID REFERENCES public.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gallery ────────────────────────────────────────────────
CREATE TABLE public.gallery (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url   TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  category    TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Loyalty config ─────────────────────────────────────────
CREATE TABLE public.loyalty_config (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  points_per_clp NUMERIC DEFAULT 0.001,  -- e.g. 0.001 = 1 point per $1.000 CLP
  levels        JSONB DEFAULT '[
    {"points": 100, "reward": "10% descuento", "type": "discount", "value": 10},
    {"points": 200, "reward": "Servicio gratis hasta $15.000", "type": "free_service", "value": 15000}
  ]'::JSONB,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX idx_appointments_date         ON public.appointments(date);
CREATE INDEX idx_appointments_peluquero    ON public.appointments(peluquero_id);
CREATE INDEX idx_appointments_client       ON public.appointments(client_id);
CREATE INDEX idx_appointments_status       ON public.appointments(status);
CREATE INDEX idx_blocked_slots_date        ON public.blocked_slots(date);
CREATE INDEX idx_cash_register_date        ON public.cash_register(date);
CREATE INDEX idx_loyalty_client            ON public.loyalty_transactions(client_id);
CREATE INDEX idx_inventory_movements_item  ON public.inventory_movements(item_id);
CREATE INDEX idx_clients_rut               ON public.clients(rut);

-- ── Auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peluqueros         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery            ENABLE ROW LEVEL SECURITY;

-- Services and gallery are public-readable (for /servicios and /galeria)
CREATE POLICY "services_public_read"  ON public.services  FOR SELECT USING (active = TRUE);
CREATE POLICY "gallery_public_read"   ON public.gallery   FOR SELECT USING (active = TRUE);
CREATE POLICY "peluqueros_public_read" ON public.peluqueros FOR SELECT USING (active = TRUE);

-- Authenticated users can read their own profile
CREATE POLICY "users_read_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Admin full access helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Appointments: staff can read/write; public insert for /agendar
CREATE POLICY "appointments_staff_all" ON public.appointments FOR ALL USING (is_staff());
CREATE POLICY "appointments_public_insert" ON public.appointments FOR INSERT WITH CHECK (source = 'web');

-- Clients: staff only
CREATE POLICY "clients_staff_all" ON public.clients FOR ALL USING (is_staff());

-- Cash register: admin + recepcionista
CREATE POLICY "cash_staff" ON public.cash_register FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','recepcionista'))
);

-- Inventory: admin only
CREATE POLICY "inventory_admin" ON public.inventory_items     FOR ALL USING (is_admin());
CREATE POLICY "inventory_mov_admin" ON public.inventory_movements FOR ALL USING (is_admin());

-- Loyalty: admin read/write, peluquero/recepcionista read
CREATE POLICY "loyalty_staff_read"  ON public.loyalty_transactions FOR SELECT USING (is_staff());
CREATE POLICY "loyalty_admin_write" ON public.loyalty_transactions FOR INSERT USING (is_admin());

-- Blocked slots: staff read, admin write
CREATE POLICY "blocked_staff_read"  ON public.blocked_slots FOR SELECT USING (is_staff());
CREATE POLICY "blocked_admin_write" ON public.blocked_slots FOR INSERT USING (is_admin());

-- Gallery: admin write, public read (already set above)
CREATE POLICY "gallery_admin_write" ON public.gallery FOR INSERT USING (is_admin());
CREATE POLICY "gallery_admin_update" ON public.gallery FOR UPDATE USING (is_admin());

-- ── Seed data ──────────────────────────────────────────────
INSERT INTO public.services (name, description, category, price, duration) VALUES
  ('Corte Mujer',          'Corte personalizado con lavado y secado',                  'Corte',        14000, 45),
  ('Corte Hombre',         'Corte clásico o moderno con acabado profesional',          'Corte',         9000, 30),
  ('Balayage',             'Iluminación francesa con efecto degradé natural',          'Color',        65000, 180),
  ('Tintado Completo',     'Coloración completa con tinte profesional',               'Color',        35000, 90),
  ('Alisado Diamond Rose', 'Alisado progresivo que hidrata, da vida y movimiento',     'Tratamientos', 75000, 120),
  ('Progresivo',           'Alisado progresivo para un look natural y manejable',      'Tratamientos', 55000, 90),
  ('Hidratación Profunda', 'Tratamiento intensivo de nutrición y brillo',              'Tratamientos', 22000, 45),
  ('Manicure',             'Manicure clásico con esmaltado a elección',               'Otros',        12000, 45),
  ('Peinado para Evento',  'Peinado de fiesta o evento especial',                     'Otros',        30000, 60);

INSERT INTO public.loyalty_config (points_per_clp) VALUES (0.001);
