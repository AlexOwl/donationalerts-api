export interface RawData { 
    raw: { [x: string]: any } 
}

export enum UserRole {
    Streamer = "streamer"
}

export enum ServerEventName {
    Donation = "donation",
    AlertShow = "alert-show",
    Media = "media",
    Stickers = "stickers"
}

export enum EventName {
    Donation = "donation",
    AlertStart = "alert-show-start",
    AlertEnd = "alert-show-end",
    AlertSkip = "alert-show-skip",
    Media = "media",
    Stickers = "stickers"
}

export enum AlertShowAction {
    Start = "start",
    End = "end",
    Skip = "skip"
}

export enum AlertType {
    Donation = 1,
    TwitchSubscription = 4,
    TwitchFollow = 6,
    TwitchBits = 11,
    CustomAlert = 12,
    TwitchGiftedSubscription = 13,
    TwitchGiftedSubscriptionsPaidUpgrade = 14,
    TwitchPrimeSubscription = 15,
    TwitchChannelGiftedSubscription = 16,
    TwitchRaid = 17,
    TwitchHost = 18,
    TwitchChannelPoints = 19
}

export enum ClientType {
    AlertWidget = "alert_widget",
    Minor =  "minor" // последние сообщения
}

export enum Currency { // ISO 4217
    Euro = "EUR",
    Dollar = "USD",
    Ruble = "RUB",
    BelarusianRuble = "BYN", // ?????
    BelarusianRuble2 = "BYR", // ?????
    Tenge = "KZT",
    Hryvnia = "UAH",
    Real = "BRL",
    Lira = "TRY"
}

export enum Language {
    Belarusian = "be_BY",
    German = "de_DE",
    English = "en_US",
    Spanish = "es_ES",
    SpanishUSA = "es_US",
    Estonian = "et_EE",
    French = "fr_FR",
    Hebrew = "he_HE",
    Italian = "it_IT",
    Georgian = "ka_GE",
    Kazakh = "kk_KZ",
    Korean = "ko_KR",
    Latvian = "lv_LV",
    Polish = "pl_PL",
    Portuguese = "pt_BR",
    Russian = "ru_RU",
    Swedish = "sv_SE",
    Turkish = "tr_TR",
    Ukrainian = "uk_UA",
    Chinese = "zh_CN"
}

export enum DonationMessageType {
    Text = "text",
    Audio = "audio"
}

export interface User extends RawData { 
    id: number,
    token: string,
    socketConnectionToken: string,
    roles: UserRole[],
    code: string,
    name: string,
    avatar: string,
    email: string,
    language: string,
    timezone: string,
    mainCurrency: Currency,
    blackListWords: string[],
    balances: {
        balance: number, adv_balance: number, currency: Currency
    }[]
}

export interface Donation extends RawData {
    id: number,
    type: AlertType,
    isShown: boolean,
    additionalData: { 
        randomness?: number
        forceVariation?: number,
        monthsInRow?: number,
        isCommissionCovered?: boolean
        eventData?: {
            userName?: string,
            displayName?: string,
            channelName?: string,
            userId?: string,
            channelId?: string,
            time?: number, // ?
            subMessage?: {
                message: string,
                emotes?: string // Array?
            } & RawData,
            subPlan?: number,
            subPlanName?: string,
            months?: number,
            context?: string, // enum?
            createdAt?: Date,
            notifications?: boolean,
            user?: {
                displayName: string,
                id: number,
                name: string,
                type: string, // enum?
                createdAt: Date,
                updatedAt: Date
            } & RawData
        } & RawData,
        payerData?: {
            id: string,
            code: string,
            url: string,
            service: string // enum?
        } & RawData,
        showNivea?: boolean
    } & RawData,
    billingSystem?: string,
    billingSystemType?: string,
    username?: string,
    amount: string,
    amountFormatted: string,
    amountMain: number,
    currency: Currency,
    message?: string,
    header?: string,
    dateCreated: Date,
    emotes?: string, // Array?
    apId?: number,
    isTestAlert: boolean,
    messageType: DonationMessageType,
    presetId?: number
}

export interface AlertShowEvent extends RawData {
    id: number,
    type: AlertType
}

export interface AlertShowStartEvent extends AlertShowEvent {
    duration: number,
    groupId?: number
}