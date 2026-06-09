-- Sube todos los precios del catálogo 2.9% + $3 MXN (comisión Stripe)
-- Ejecutar UNA sola vez en el SQL Editor de Supabase

UPDATE public.packages
SET precio = ROUND(precio * 1.029 + 3);
