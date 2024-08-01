export type Ticket = {
    guildId: string
    channelId: string
    userId: string
    ticketId: string
    type: string
    status: TicketStatus
    createdAt: number
    closedAt: number
    closedBy: string
    closedReason: string
}

export enum TicketStatus {
    Open = 1,
    Closed = 0
}