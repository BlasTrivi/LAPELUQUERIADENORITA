-- ============================================================
-- Coquetas — Database Schema
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   text,
    role        text        NOT NULL DEFAULT 'owner',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner can read own row"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "profiles: owner can insert own row"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: owner can update own row"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. CLIENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name  text        NOT NULL,
    last_name   text,
    phone       text,
    email       text,
    notes       text,
    photo_url   text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

CREATE POLICY "clients: owner sees own clients"
    ON public.clients FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "clients: owner inserts own clients"
    ON public.clients FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients: owner updates own clients"
    ON public.clients FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients: owner deletes own clients"
    ON public.clients FOR DELETE
    USING (user_id = auth.uid());

CREATE TRIGGER clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 3. SERVICES (catalog)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.services (
    id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name          text          NOT NULL,
    default_price numeric(10,2),
    is_active     boolean       NOT NULL DEFAULT true,
    created_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services(user_id);

CREATE POLICY "services: owner sees own services"
    ON public.services FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "services: owner inserts own services"
    ON public.services FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "services: owner updates own services"
    ON public.services FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "services: owner deletes own services"
    ON public.services FOR DELETE
    USING (user_id = auth.uid());


-- ============================================================
-- 4. VISITS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visits (
    id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   uuid          NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id     uuid          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id  uuid          REFERENCES public.services(id) ON DELETE SET NULL,
    visit_date  timestamptz   NOT NULL DEFAULT now(),
    price       numeric(10,2),
    notes       text,
    photo_url   text,
    created_at  timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_visits_client_id ON public.visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id   ON public.visits(user_id);

CREATE POLICY "visits: owner sees own visits"
    ON public.visits FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "visits: owner inserts own visits"
    ON public.visits FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "visits: owner updates own visits"
    ON public.visits FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "visits: owner deletes own visits"
    ON public.visits FOR DELETE
    USING (user_id = auth.uid());


-- ============================================================
-- 5. COLOR FORMULAS (one per visit, optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.color_formulas (
    id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id            uuid    NOT NULL UNIQUE REFERENCES public.visits(id) ON DELETE CASCADE,
    brand               text,
    color_number        text,
    developer_volume    text,
    mix_details         text,
    application_notes   text
);

ALTER TABLE public.color_formulas ENABLE ROW LEVEL SECURITY;

-- Access through the visit's user_id
CREATE POLICY "color_formulas: owner sees own formulas"
    ON public.color_formulas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.visits v
            WHERE v.id = visit_id
              AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "color_formulas: owner inserts own formulas"
    ON public.color_formulas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.visits v
            WHERE v.id = visit_id
              AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "color_formulas: owner updates own formulas"
    ON public.color_formulas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.visits v
            WHERE v.id = visit_id
              AND v.user_id = auth.uid()
        )
    );

CREATE POLICY "color_formulas: owner deletes own formulas"
    ON public.color_formulas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.visits v
            WHERE v.id = visit_id
              AND v.user_id = auth.uid()
        )
    );


-- ============================================================
-- 6. DEFAULT SERVICES SEED
-- NOTE: These are inserted for the first authenticated user.
--       In production, run this after the salon owner signs up
--       replacing the uuid with auth.uid() or the real user id.
--
--       Alternatively, you can seed them inside the app on
--       first login if services count = 0 for that user_id.
-- ============================================================

-- Seed function: call once per new owner to bootstrap their catalog
CREATE OR REPLACE FUNCTION public.seed_default_services(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.services (user_id, name) VALUES
        (p_user_id, 'Corte'),
        (p_user_id, 'Color'),
        (p_user_id, 'Mechas'),
        (p_user_id, 'Alisado'),
        (p_user_id, 'Brushing'),
        (p_user_id, 'Tratamiento capilar'),
        (p_user_id, 'Peinado')
    ON CONFLICT DO NOTHING;
END;
$$;
