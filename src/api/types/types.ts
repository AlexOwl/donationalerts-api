export enum Currency {
    USD = "USD",
    RUB = "RUB",
    EUR = "EUR",
    BYR = "BYR",
    KZT = "KZT",
    UAH = "UAH",
    BYN = "BYN",
    BRL = "BRL",
    TRY = "TRY"
}

export enum UserRole {
    Streamer = "streamer"
}

export interface User {
    id: number
    roles: UserRole[]
    code: string
    name: string
    avatar: string
    email: string

    language: string
    timezone: string
    currency: Currency

    token: string
    socketToken: string
}

export interface WidgetGradientStyle {
    colors: string[]
    direction: string // TODO: possible enum
}

export interface WidgetTextStyle {
    color: string
    fontSize: number
    fontStyle: string
    textDecoration: string
    textAlign: string
    fontFamily: string
    fontWeight: string
    textTransform: string
    textShadow: string
}

export interface WidgetProgressBarStyle {
    backgroundColor: string
    gradient?: WidgetGradientStyle
    borderColor?: string
    borderWidth: number
    borderRadius: number
    minHeight: number
}

export interface WidgetFilterStyle {
    backgroundColor?: string
    gradient?: WidgetGradientStyle
}

export interface WidgetGoal {
    scheme: string // TODO: possible enum
    settings: {
        positions: {
            title?: string // TODO: possible enum
            progressText?: string // TODO: possible enum
            timeLeft?: string // TODO: possible enum
        }
        framesEnabled: boolean
        backgroundEnabled: boolean
        pageBackgroundColor: string
        progressTextTemplate: string
    }
    styles: {
        title: WidgetTextStyle
        progress: WidgetTextStyle
        frames: WidgetTextStyle
        filler: WidgetFilterStyle
        progressBar: WidgetProgressBarStyle
    }
}