-- Ejecuta este SQL en el editor de Supabase (SQL Editor)

create table if not exists public.yoga_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text not null,
  date date not null,
  time time not null,
  duration_minutes int not null default 60,
  capacity int not null default 15,
  enrolled int not null default 0,
  price numeric(10,2) not null default 0,
  is_online boolean not null default false,
  zoom_link text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  class_id uuid references public.yoga_classes(id) on delete cascade not null,
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','pending')),
  stripe_payment_intent text,
  created_at timestamptz default now(),
  unique(user_id, class_id)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  formation_id text not null,
  stripe_session_id text unique not null,
  status text not null default 'pending' check (status in ('pending','completed','refunded')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.yoga_classes enable row level security;
alter table public.bookings enable row level security;
alter table public.purchases enable row level security;

-- Políticas: clases son públicas para leer
create policy "Clases publicas" on public.yoga_classes for select using (true);

-- Políticas: reservas solo las ve el usuario propietario
create policy "Ver mis reservas" on public.bookings for select using (auth.uid() = user_id);
create policy "Crear reserva" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Actualizar mi reserva" on public.bookings for update using (auth.uid() = user_id);

-- Políticas: compras solo las ve el usuario propietario
create policy "Ver mis compras" on public.purchases for select using (auth.uid() = user_id);

-- Datos de ejemplo para empezar
insert into public.yoga_classes (title, description, instructor, date, time, duration_minutes, capacity, price, is_online)
values
  ('Hatha Yoga — Nivel básico', 'Clase perfecta para comenzar tu práctica. Trabajamos posturas fundamentales y respiración consciente.', 'Iiknala', '2026-05-10', '10:00', 75, 12, 15.00, false),
  ('Vinyasa Flow', 'Secuencia dinámica que conecta movimiento y respiración. Nivel medio.', 'Iiknala', '2026-05-12', '18:30', 60, 10, 15.00, false),
  ('Yoga Online — Yin & Relajación', 'Clase online de yoga restaurativo para liberar tensiones. Link de Zoom se envía al reservar.', 'Iiknala', '2026-05-14', '20:00', 60, 20, 10.00, true),
  ('Ashtanga Mysore', 'Práctica guiada de la serie primaria de Ashtanga. Nivel avanzado.', 'Iiknala', '2026-05-15', '07:30', 90, 8, 18.00, false);
