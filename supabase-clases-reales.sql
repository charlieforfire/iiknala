-- Borrar clases de ejemplo anteriores
delete from public.bookings;
delete from public.yoga_classes;

-- Insertar clases reales para las próximas 4 semanas (Mayo 2026)
-- LUN May 4, 11, 18, 25
-- MAR May 5, 12, 19, 26
-- MIÉR May 6, 13, 20, 27
-- JUE May 7, 14, 21, 28
-- VIER May 8, 15, 22, 29
-- SÁB May 9, 16, 23, 30

insert into public.yoga_classes (title, description, instructor, date, time, duration_minutes, capacity, price, is_online) values

-- LUN 7:30 AM - On Scale Vinyasa
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga', '2026-05-04', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga', '2026-05-11', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga', '2026-05-18', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga', '2026-05-25', '07:30', 60, 15, 250, false),

-- MAR 7:30 AM - Rocket Yoga
('Rocket Yoga', 'Serie de Ashtanga modificada, intensa y accesible para practicantes intermedios y avanzados.', '@beah.yoga', '2026-05-05', '07:30', 60, 15, 250, false),
('Rocket Yoga', 'Serie de Ashtanga modificada, intensa y accesible para practicantes intermedios y avanzados.', '@beah.yoga', '2026-05-12', '07:30', 60, 15, 250, false),
('Rocket Yoga', 'Serie de Ashtanga modificada, intensa y accesible para practicantes intermedios y avanzados.', '@beah.yoga', '2026-05-19', '07:30', 60, 15, 250, false),
('Rocket Yoga', 'Serie de Ashtanga modificada, intensa y accesible para practicantes intermedios y avanzados.', '@beah.yoga', '2026-05-26', '07:30', 60, 15, 250, false),

-- MIÉR 7:30 AM - Yoga Wheel
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-06', '07:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-13', '07:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-20', '07:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-27', '07:30', 60, 15, 250, false),

-- JUE 7:30 AM - On Scale Vinyasa
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga / @pauparra.yoga', '2026-05-07', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga / @pauparra.yoga', '2026-05-14', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga / @pauparra.yoga', '2026-05-21', '07:30', 60, 15, 250, false),
('On Scale Vinyasa', 'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.', '@beah.yoga / @pauparra.yoga', '2026-05-28', '07:30', 60, 15, 250, false),

-- VIER 7:30 AM - Hand Balance
('Hand Balance', 'Entrenamiento de equilibrio en manos con progresiones para todos los niveles.', '@fernando_diaz_handbalancer', '2026-05-08', '07:30', 60, 15, 250, false),
('Hand Balance', 'Entrenamiento de equilibrio en manos con progresiones para todos los niveles.', '@fernando_diaz_handbalancer', '2026-05-15', '07:30', 60, 15, 250, false),
('Hand Balance', 'Entrenamiento de equilibrio en manos con progresiones para todos los niveles.', '@fernando_diaz_handbalancer', '2026-05-22', '07:30', 60, 15, 250, false),
('Hand Balance', 'Entrenamiento de equilibrio en manos con progresiones para todos los niveles.', '@fernando_diaz_handbalancer', '2026-05-29', '07:30', 60, 15, 250, false),

-- MAR 9:00 AM - Yoga Suave
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-05', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-12', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-19', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-26', '09:00', 60, 15, 250, false),

-- JUE 9:00 AM - Yoga Suave
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-07', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-14', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-21', '09:00', 60, 15, 250, false),
('Yoga Suave y Estiramiento Profundo', 'Clase gentle perfecta para principiantes o para días de recuperación activa.', '@jackie.delag', '2026-05-28', '09:00', 60, 15, 250, false),

-- SÁB 9:30 AM - Vinyasa Flow
('Vinyasa Flow', 'Secuencia fluida que conecta movimiento y respiración. Multinivel.', '@anaraquelgmz', '2026-05-09', '09:30', 60, 15, 250, false),
('Vinyasa Flow', 'Secuencia fluida que conecta movimiento y respiración. Multinivel.', '@anaraquelgmz', '2026-05-16', '09:30', 60, 15, 250, false),
('Vinyasa Flow', 'Secuencia fluida que conecta movimiento y respiración. Multinivel.', '@anaraquelgmz', '2026-05-23', '09:30', 60, 15, 250, false),
('Vinyasa Flow', 'Secuencia fluida que conecta movimiento y respiración. Multinivel.', '@anaraquelgmz', '2026-05-30', '09:30', 60, 15, 250, false),

-- LUN 5:30 PM - Yoga Wheel
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-04', '17:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-11', '17:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-18', '17:30', 60, 15, 250, false),
('Yoga Wheel', 'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.', '@beah.yoga', '2026-05-25', '17:30', 60, 15, 250, false),

-- LUN 7:00 PM - Dharma Yoga
('Dharma Yoga', 'Práctica devocional y meditativa del sistema Dharma Mittra. Avanzado.', '@pauparra.yoga', '2026-05-04', '19:00', 60, 15, 250, false),
('Dharma Yoga', 'Práctica devocional y meditativa del sistema Dharma Mittra. Avanzado.', '@pauparra.yoga', '2026-05-11', '19:00', 60, 15, 250, false),
('Dharma Yoga', 'Práctica devocional y meditativa del sistema Dharma Mittra. Avanzado.', '@pauparra.yoga', '2026-05-18', '19:00', 60, 15, 250, false),
('Dharma Yoga', 'Práctica devocional y meditativa del sistema Dharma Mittra. Avanzado.', '@pauparra.yoga', '2026-05-25', '19:00', 60, 15, 250, false),

-- MAR 7:00 PM - Slow Flow
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@lorebyoga', '2026-05-05', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@lorebyoga', '2026-05-12', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@lorebyoga', '2026-05-19', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@lorebyoga', '2026-05-26', '19:00', 60, 15, 250, false),

-- MIÉR 7:00 PM - Intuitive Flow
('Intuitive Flow', 'Movimiento libre e intuitivo guiado por la sensación interna del cuerpo.', '@beah.yoga', '2026-05-06', '19:00', 60, 15, 250, false),
('Intuitive Flow', 'Movimiento libre e intuitivo guiado por la sensación interna del cuerpo.', '@beah.yoga', '2026-05-13', '19:00', 60, 15, 250, false),
('Intuitive Flow', 'Movimiento libre e intuitivo guiado por la sensación interna del cuerpo.', '@beah.yoga', '2026-05-20', '19:00', 60, 15, 250, false),
('Intuitive Flow', 'Movimiento libre e intuitivo guiado por la sensación interna del cuerpo.', '@beah.yoga', '2026-05-27', '19:00', 60, 15, 250, false),

-- JUE 7:00 PM - Slow Flow
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@pauparra.yoga', '2026-05-07', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@pauparra.yoga', '2026-05-14', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@pauparra.yoga', '2026-05-21', '19:00', 60, 15, 250, false),
('Slow Flow', 'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.', '@pauparra.yoga', '2026-05-28', '19:00', 60, 15, 250, false);
