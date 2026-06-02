#!/usr/bin/env node
/**
 * Genera el SQL de clases para un mes dado.
 *
 * Uso:
 *   node scripts/generar-clases.mjs 2026 7   → Julio 2026
 *   node scripts/generar-clases.mjs 2026 8   → Agosto 2026
 *
 * Luego copia el output y pégalo en Supabase > SQL Editor.
 * Es seguro correrlo varias veces: borra primero las clases sin reservas del mes.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const horarios = JSON.parse(readFileSync(join(__dir, '../src/lib/horarios.json'), 'utf8'))

const DESCRIPCIONES = {
  'On Scale Vinyasa':                   'Práctica dinámica de vinyasa con énfasis en escalas de dificultad progresiva.',
  'Rocket Yoga':                        'Serie de Ashtanga modificada, intensa y accesible para practicantes intermedios y avanzados.',
  'Yoga Wheel':                         'Clase con rueda de yoga para abrir el pecho, espalda y hombros. Multinivel.',
  'Hand Balance':                       'Entrenamiento de equilibrio en manos con progresiones para todos los niveles.',
  'Yoga Suave y Estiramiento Profundo': 'Clase gentle perfecta para principiantes o para días de recuperación activa.',
  'Vinyasa Flow':                       'Secuencia fluida que conecta movimiento y respiración. Multinivel.',
  'Hatha Yoga':                         'Práctica de posturas clásicas con énfasis en alineación y respiración.',
  'Dharma Yoga':                        'Práctica devocional y meditativa del sistema Dharma Mittra.',
  'Slow Flow':                          'Flujo lento y consciente. Ideal para desacelerar y conectar con la respiración.',
  'Intuitive Flow':                     'Movimiento libre e intuitivo guiado por la sensación interna del cuerpo.',
  'Hatha Principiantes':                'Introducción al Hatha Yoga, ideal para quienes inician su práctica.',
}

const DIAS_NUM = {
  'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3,
  'Jueves': 4, 'Viernes': 5, 'Sábado': 6,
}

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// ── Args ────────────────────────────────────────────────────────────────────
const [,, yearStr, monthStr] = process.argv
if (!yearStr || !monthStr) {
  console.error('Uso: node scripts/generar-clases.mjs YYYY MM')
  console.error('Ej:  node scripts/generar-clases.mjs 2026 7')
  process.exit(1)
}

const year  = parseInt(yearStr)
const month = parseInt(monthStr)
const pad   = n => String(n).padStart(2, '0')
const mm    = pad(month)
const first = `${year}-${mm}-01`
const last  = `${year}-${mm}-${pad(new Date(year, month, 0).getDate())}`

// ── Helpers ─────────────────────────────────────────────────────────────────
function getDatesForDay(dayOfWeek) {
  const dates = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    if (d.getDay() === dayOfWeek) {
      dates.push(`${year}-${mm}-${pad(d.getDate())}`)
    }
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function timeToSQL(hora) {
  const m = hora.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let h = parseInt(m[1])
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
  if (m[3].toUpperCase() === 'AM' && h === 12)  h = 0
  return `${pad(h)}:${m[2]}`
}

function esc(s) { return s.replace(/'/g, "''") }

// ── Build rows ───────────────────────────────────────────────────────────────
const rows = []
for (const h of horarios) {
  const dayNum = DIAS_NUM[h.dia]
  if (dayNum === undefined) continue
  const timeSQL = timeToSQL(h.hora)
  const desc    = DESCRIPCIONES[h.clase] ?? 'Clase de yoga.'
  for (const date of getDatesForDay(dayNum)) {
    rows.push(
      `  ('${esc(h.clase)}', '${esc(desc)}', '${esc(h.maestro)}', '${date}', '${timeSQL}', 15, 0, 250, false)`
    )
  }
}

rows.sort() // por fecha

// ── Output ───────────────────────────────────────────────────────────────────
console.log(`-- ============================================================`)
console.log(`-- Clases ${MESES[month]} ${year}`)
console.log(`-- Generado con: node scripts/generar-clases.mjs ${year} ${month}`)
console.log(`-- ============================================================`)
console.log(``)
console.log(`-- Borra clases sin reservas de este mes (seguro re-correr)`)
console.log(`DELETE FROM yoga_classes`)
console.log(`WHERE date >= '${first}' AND date <= '${last}' AND enrolled = 0;`)
console.log(``)
console.log(`INSERT INTO yoga_classes (title, description, instructor, date, time, capacity, enrolled, price, is_online)`)
console.log(`VALUES`)
console.log(rows.join(',\n') + ';')
console.log(``)
console.log(`-- ${rows.length} clases insertadas para ${MESES[month]} ${year}`)
