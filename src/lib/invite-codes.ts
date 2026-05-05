import { SupabaseClient } from '@supabase/supabase-js'

// Cuántos códigos de invitado genera cada paquete
const CODES_BY_PACKAGE: Record<string, number> = {
  // Slugs de Stripe (paqueteId en metadata)
  'pack-8': 1,
  'pack-12': 2,
  'pack-16': 2,
  // Slugs del admin (package_name.toLowerCase().replace(/\s+/g, '-'))
  'pack-8-clases': 1,
  'pack-12-clases': 2,
  'pack-16-clases': 2,
}

export function inviteCodesForPackage(packageId: string): number {
  return CODES_BY_PACKAGE[packageId] ?? 0
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export async function createInviteCodes(
  adminDb: SupabaseClient,
  userPackageId: string,
  ownerUserId: string,
  count: number,
  expiresAt: string | null,
): Promise<void> {
  if (count <= 0) return
  const rows = Array.from({ length: count }, () => ({
    code: generateCode(),
    user_package_id: userPackageId,
    owner_user_id: ownerUserId,
    expires_at: expiresAt,
  }))
  await adminDb.from('invite_codes').insert(rows)
}
