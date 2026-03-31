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
  duration: string
  ipAddress?: string
  ipBan: boolean
  staffRollbackId?: string
  revokedById?: string
  revokedByName?: string
  revokedAt?: string
  expiresAt: string
}

export function isPermanent(punishment: Punishment): boolean {
  return punishment.duration === 'Permanent'
}

export interface PunishmentsPage {
  content: Punishment[]
  last: boolean
  totalElements?: number
}
