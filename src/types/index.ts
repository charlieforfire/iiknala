export type UserRole = 'student' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  created_at: string
}

export interface YogaClass {
  id: string
  title: string
  description: string
  instructor: string
  date: string
  time: string
  duration_minutes: number
  capacity: number
  enrolled: number
  price: number
  is_online: boolean
  zoom_link?: string
  image_url?: string
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  class_id: string
  status: 'confirmed' | 'cancelled' | 'pending'
  stripe_payment_intent?: string
  created_at: string
  yoga_class?: YogaClass
}

export interface Formation {
  id: string
  title: string
  description: string
  price: number
  duration_weeks: number
  level: string
  includes: string[]
  image_url?: string
  stripe_price_id: string
}

export interface Purchase {
  id: string
  user_id: string
  formation_id: string
  stripe_session_id: string
  status: 'pending' | 'completed' | 'refunded'
  created_at: string
  formation?: Formation
}
