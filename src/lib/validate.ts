export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function str(
  val: unknown,
  opts: { maxLen?: number; minLen?: number; required?: boolean; label?: string } = {}
): string | null {
  const { maxLen = 500, minLen = 0, required = false, label = 'Campo' } = opts
  if (val === undefined || val === null || val === '') {
    if (required) throw new ValidationError(`${label} es requerido`)
    return null
  }
  if (typeof val !== 'string') throw new ValidationError(`${label} debe ser texto`)
  const trimmed = val.trim()
  if (trimmed.length < minLen) throw new ValidationError(`${label} debe tener al menos ${minLen} caracteres`)
  if (trimmed.length > maxLen) throw new ValidationError(`${label} no puede exceder ${maxLen} caracteres`)
  return trimmed
}

export function num(
  val: unknown,
  opts: { min?: number; max?: number; required?: boolean; label?: string; integer?: boolean } = {}
): number | null {
  const { min, max, required = false, label = 'Campo', integer = false } = opts
  if (val === undefined || val === null || val === '') {
    if (required) throw new ValidationError(`${label} es requerido`)
    return null
  }
  const n = Number(val)
  if (isNaN(n)) throw new ValidationError(`${label} debe ser un número`)
  if (integer && !Number.isInteger(n)) throw new ValidationError(`${label} debe ser entero`)
  if (min !== undefined && n < min) throw new ValidationError(`${label} debe ser mayor o igual a ${min}`)
  if (max !== undefined && n > max) throw new ValidationError(`${label} no puede exceder ${max}`)
  return n
}

export function oneOf<T extends string>(
  val: unknown,
  allowed: readonly T[],
  opts: { required?: boolean; label?: string } = {}
): T | null {
  const { required = false, label = 'Campo' } = opts
  if (val === undefined || val === null || val === '') {
    if (required) throw new ValidationError(`${label} es requerido`)
    return null
  }
  if (!allowed.includes(val as T)) throw new ValidationError(`${label} tiene un valor no permitido`)
  return val as T
}

export function validDate(val: unknown, opts: { required?: boolean; label?: string } = {}): string | null {
  const { required = false, label = 'Fecha' } = opts
  const s = str(val, { required, label, maxLen: 10 })
  if (!s) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ValidationError(`${label} debe tener formato YYYY-MM-DD`)
  if (isNaN(new Date(s).getTime())) throw new ValidationError(`${label} no es válida`)
  return s
}

export function validTime(val: unknown, opts: { required?: boolean; label?: string } = {}): string | null {
  const { required = false, label = 'Hora' } = opts
  const s = str(val, { required, label, maxLen: 8 })
  if (!s) return null
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(s)) throw new ValidationError(`${label} debe tener formato HH:MM`)
  return s.slice(0, 5)
}

export function validEmail(val: unknown, opts: { required?: boolean } = {}): string | null {
  const { required = false } = opts
  const s = str(val, { required, label: 'Email', maxLen: 254 })
  if (!s) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new ValidationError('Email no tiene formato válido')
  return s.toLowerCase()
}

export function bool(val: unknown, opts: { required?: boolean; label?: string } = {}): boolean | null {
  const { required = false, label = 'Campo' } = opts
  if (val === undefined || val === null) {
    if (required) throw new ValidationError(`${label} es requerido`)
    return null
  }
  if (typeof val === 'boolean') return val
  if (val === 'true') return true
  if (val === 'false') return false
  throw new ValidationError(`${label} debe ser verdadero o falso`)
}

export function validationError(err: unknown): Response {
  if (err instanceof ValidationError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
