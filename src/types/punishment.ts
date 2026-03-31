export type PunishmentType = 'ban' | 'ip_ban' | 'warn' | 'mute' | 'kick'

export interface Punishment {
  id: string | number
  targetId: string
  targetName: string
  type: PunishmentType
  reason: string
  issuedAt: string
  issuerId: string
  issuerName: string
  revoked: boolean
  duration: string | number
  ipAddress?: string
  ipBan: boolean
  staffRollbackId?: string
  revokedById?: string
  revokedByName?: string
  revokedAt?: string
}

export function isPermanent(punishment: Punishment): boolean {
  return punishment.duration === 'Permanent'
}

export function expiresAt(punishment: Punishment): string {
  console.log(punishment)
  if (isPermanent(punishment)) return '-'
  const issuedAt = new Date(punishment.issuedAt)
  console.log(issuedAt.getTime())
  console.log(Number(punishment.duration))
  const expiry = new Date(issuedAt.getTime() + Number(punishment.duration))
  console.log(expiry)
  return expiry.toISOString()
}

export interface PunishmentsPage {
  content: Punishment[]
  last: boolean
  totalElements?: number
}
