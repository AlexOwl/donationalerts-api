import { Currency } from "../../types";

export enum SocketEvent {
    Connect = "connect",
    Error = "error", 
    ConnectError = "connect_error", 
    ConnectTimeout = "connect_timeout", 
    Disconnect = "disconnect",
    
    Donation = "donation",
    AlertShow = "alert-show",
    Media = "media",
    Stickers = "stickers"
}


export enum AlertType {
    PaidMessage = "1", // Donation
    //        2 ?
    //        3 ?
    TwitchPaidSubscribe = "4",
    //       5 ?
    TwitchFreeSubscribe = "6",
    //        7 ? 
    //        8 ?
     //       9 ?
    //        10 ?
    //        11 ?
    TwitchBits = "11",
    FreeFormatMessage = "12",
    TwitchGiftSubscribe = "13",
    TwitchGiftResubscribe = "14",
    TwitchPrimeSubscribe = "15",
    // TwitchGift = "16", // todo
    TwitchRaid = "17",
    TwitchHost = "18",
    TwitchPoints = "19"
}


export enum PaidMessageType {
    Text = "text",
    Audio = "audio"
}
export interface PaidMessage {
    id: number
    alertType: AlertType
    messageType: PaidMessageType

    isTestAlert: boolean

    dateCreated: string
    isShown: boolean

    additionalData: {
        randomness: number,
        isCommissionCovered: boolean
    }

    billingSystem: string
    billingSystemType: string | null
    
    amount: string
    amountFormatted: string
    amountMain: number
    currency: Currency

    username: string
    message: string
    header: string

    emotes: string | null
    apId: number | null
}


export enum AlertShowAction {
    Start = "start",
    ShowNow = "show-now",
    Skip = "skip",
    End = "end"
}

export type AlertShow = {
    action: AlertShowAction

    alertType: AlertType
    alertId: number

    duration: number | null
    groupId: number | null
} 


export interface Sticker {
    id: number
    left: number
    top: number
    scale: number
    angle: number
    url: string
}

export interface Stickers {
    action: AlertShowAction
    stickers: Sticker[]
}

export enum MediaType {
    Video = "video"
}

export enum MediaSubType {
    YouTube = "youtube"
}

export enum Action {
    Add = "add"
}

export interface Media {
    action: Action.Add
    media: {
        mediaId: number
        userId: number

        type: MediaType
        subType: MediaSubType

        title: string
        additionalData: {
            videoId: string
            alertId: number
            alertType: AlertType
            owner: string,
            url: string
            startFrom: number
            paidAmounts: {
                [key in Currency]: number
            }
        }

        dateCreated: string
        isPlayed: boolean
        datePlayed?: string
    }
}