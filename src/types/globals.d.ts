export {}

declare global {
    interface CustomJwtSessionClaims {
        discordUsername?: string
        discordId?: string
        discordId2?: string
    }
}