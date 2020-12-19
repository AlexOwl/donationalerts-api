export interface Goal {
    id: number
    isActive: boolean
    title: string
    currency: string

    startAmount: number
    raisedAmount: number
    goalAmount: number

    startedAt: string
    startedAtTs: number | null
    
    expiresAt: string
    expiresAtTs: number | null

    reason: string // TODO: possible enum - "default"
}