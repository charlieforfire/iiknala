import data from './horarios.json'

export type Nivel = 'avanzado' | 'multinivel' | 'principiantes'

export interface Horario {
  dia: string
  hora: string
  clase: string
  maestro: string
  nivel: Nivel[]
}

export const horarios = data as Horario[]
