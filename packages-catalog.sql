-- Tabla catálogo de paquetes
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.packages (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INTEGER NOT NULL,
  vigencia_dias INTEGER,
  clases INTEGER,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  tipo TEXT NOT NULL DEFAULT 'regular' CHECK (tipo IN ('regular', 'ilimitado-multimes', 'rocket', 'summer')),
  extras TEXT[] DEFAULT '{}',
  is_shareable BOOLEAN NOT NULL DEFAULT FALSE,
  nota TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_public_read" ON public.packages
  FOR SELECT USING (TRUE);

INSERT INTO public.packages
  (id, nombre, precio, vigencia_dias, clases, activo, destacado, tipo, extras, is_shareable, sort_order)
VALUES
  ('primera-clase',            'Primera Clase',               200,   NULL, 1,    TRUE,  FALSE, 'regular',           '{}',                                 FALSE, 1),
  ('clase-suelta',             'Clase Suelta',                250,   NULL, 1,    TRUE,  FALSE, 'regular',           '{}',                                 FALSE, 2),
  ('pack-4',                   '4 Clases',                    900,   30,   4,    TRUE,  FALSE, 'regular',           '{}',                                 FALSE, 3),
  ('pack-8',                   '8 Clases',                    1500,  30,   8,    TRUE,  FALSE, 'regular',           ARRAY['+1 invitado'],                 TRUE,  4),
  ('pack-12',                  '12 Clases',                   1800,  30,   12,   TRUE,  TRUE,  'regular',           ARRAY['+1 clase extra o invitado'],   TRUE,  5),
  ('pack-16',                  '16 Clases',                   2050,  30,   16,   TRUE,  FALSE, 'regular',           ARRAY['+2 invitados'],                TRUE,  6),
  ('ilimitado',                'Ilimitado',                   2400,  30,   NULL, TRUE,  FALSE, 'regular',           ARRAY['+2 invitados'],                TRUE,  7),
  ('ilimitado-3m',             'Ilimitado 3 meses',           7200,  90,   NULL, TRUE,  FALSE, 'ilimitado-multimes','{}',                                 TRUE,  8),
  ('ilimitado-6m',             'Ilimitado 6 meses',           14400, 180,  NULL, TRUE,  FALSE, 'ilimitado-multimes','{}',                                 TRUE,  9),
  ('ilimitado-12m',            'Ilimitado 12 meses',          28800, 365,  NULL, TRUE,  FALSE, 'ilimitado-multimes','{}',                                 TRUE,  10),
  ('rocket-suelta',            'Clase Suelta Rocket',         300,   NULL, 1,    TRUE,  FALSE, 'rocket',            '{}',                                 FALSE, 11),
  ('rocket-pack',              'Paquete Rocket',              1000,  30,   4,    TRUE,  FALSE, 'rocket',            '{}',                                 FALSE, 12),
  ('summer-ilimitado-verano',  'Ilimitado Verano',            5500,  92,   NULL, TRUE,  FALSE, 'summer',            '{}',                                 FALSE, 13),
  ('summer-ilimitado-jul-ago', 'Ilimitado Jul + Ago',         3800,  62,   NULL, TRUE,  FALSE, 'summer',            '{}',                                 FALSE, 14),
  ('summer-30-clases',         '30 clases / 2 meses',         3500,  60,   30,   TRUE,  FALSE, 'summer',            '{}',                                 TRUE,  15),
  ('summer-15-clases',         '15 clases al precio de 12',   1800,  30,   15,   TRUE,  FALSE, 'summer',            '{}',                                 TRUE,  16)
ON CONFLICT (id) DO NOTHING;
