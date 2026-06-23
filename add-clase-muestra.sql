-- Agregar columna admin_only a la tabla packages
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS admin_only BOOLEAN NOT NULL DEFAULT FALSE;

-- Insertar el paquete "Clase Muestra" (solo visible para admin)
INSERT INTO public.packages (id, nombre, precio, vigencia_dias, clases, activo, destacado, tipo, admin_only, sort_order)
VALUES ('clase-muestra', 'Clase Muestra', 0, 30, 1, TRUE, FALSE, 'regular', TRUE, 999)
ON CONFLICT (id) DO UPDATE SET
  nombre = 'Clase Muestra',
  precio = 0,
  vigencia_dias = 30,
  clases = 1,
  activo = TRUE,
  admin_only = TRUE,
  sort_order = 999;
