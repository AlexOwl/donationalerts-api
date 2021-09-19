import { AlertType, Currency, Donation, DonationMessageType, Language, User, UserRole } from ".";

function parseUndefined(data: any, fallback: (x: any) => any) {
    return data === undefined || data === null ? undefined : fallback(data)
}

function parseString(data?: any | null): string | undefined {
    return parseUndefined(data, x => `${x}`)
}

function parseNumber(data?: number | string | null): number | undefined {
    return parseUndefined(data, x => +x)
}

function parseBoolean(data?: boolean | number | null): boolean | undefined {
    return parseUndefined(data, x => !!x)
}

function parseDate(data?: string | null): Date | undefined {
    return parseUndefined(data, x => new Date(x))
}

export function parseDonation({
    id,
    alert_type,
    is_shown,
    additional_data,
    billing_system,
    billing_system_type,
    username,
    amount,
    amount_formatted,
    amount_main,
    currency,
    message,
    header,
    date_created,
    emotes,
    ap_id,
    _is_test_alert,
    message_type,
    preset_id,
    ...raw
}: {
    id: number,
    alert_type: number | string,
    is_shown: null | string,
    additional_data: null | string,
    billing_system: null | string,
    billing_system_type: null | string,
    username: string,
    amount: string,
    amount_formatted: string,
    amount_main: number,
    currency: string,
    message: null | string,
    header: null | string,
    date_created: string,
    emotes: null | string,
    ap_id: null | number,
    _is_test_alert: boolean,
    message_type: null | string,
    preset_id?: number
}): Donation {
    function parseAdditionalData({
        randomness,
        force_variation,
        months_in_a_row,
        is_commission_covered,
        show_nivea,
        event_data,
        payer_data,
        ...raw
    }: {
        randomness?: number,
        force_variation?: number,
        months_in_a_row?: number,
        is_commission_covered?: number,
        show_nivea?: boolean,
        event_data?: any,
        payer_data?: any
    }) { 
        function parseEventData ({
            user_name,
            display_name,
            channel_name,
            user_id,
            channel_id,
            time,
            sub_message,
            sub_plan,
            sub_plan_name,
            months,
            context,

            created_at,
            notifications,
            user,
            ...raw
        }: {
            user_name?: string,
            display_name?: string,
            channel_name?: string,
            user_id?: string,
            channel_id?: string,
            time?: any,
            sub_message?: any,
            sub_plan?: number,
            sub_plan_name?: string,
            months?: number,
            context?: string,

            created_at?: string,
            notifications?: boolean,
            user?: any
        }) {
            function parseSubMessage({
                message,
                emotes,
                ...raw
            } : {
                message: string,
                emotes?: string
            }) {
                return {
                    message,
                    emotes,
                    raw
                }
            }

            function parseUser({
                display_name,
                id,
                name,
                type,
                created_at,
                updated_at,
                ...raw
            }: {
                display_name: string,
                id: string,
                name: string,
                type: string,
                created_at: string,
                updated_at: string
            }) {
                return {
                    displayName: display_name,
                    id: parseNumber(id),
                    name,
                    type,
                    createdAt: parseDate(created_at),
                    updatedAt: parseDate(updated_at),
                    raw
                }
            }

            return {
                userName: user_name,
                displayName: display_name,
                channelName: channel_name,
                userId: user_id,
                channelId: channel_id,
                time: time,
                subMessage: parseUndefined(sub_message, parseSubMessage),
                subPlan: parseNumber(sub_plan),
                subPlanName: sub_plan_name,
                months: parseNumber(months),
                context: context,
                createdAt: parseDate(created_at),
                notifications: parseBoolean(notifications),
                user: parseUndefined(user, parseUser),
                raw
            }
        }

        function parsePayerData({
            id,
            code,
            url,
            service,
            ...raw
        }: {
            id: string,
            code: string,
            url: string,
            service: string
        }) {
            return {
                id,
                code,
                url,
                service, // enum?: twitch
                raw
            }
        }

        return {
            randomness: parseNumber(randomness),
            forceVariation: parseNumber(force_variation),
            monthsInRow: parseNumber(months_in_a_row),
            isCommissionCovered: parseBoolean(is_commission_covered),
            showNivea: parseBoolean(show_nivea),
            eventData: parseUndefined(event_data, parseEventData),
            payerData: parseUndefined(payer_data, parsePayerData),
            raw
        }
    }

    return {
        id: +id,
        type: +alert_type as AlertType, // enum?
        isShown: !!(is_shown && +is_shown),
        additionalData: parseAdditionalData(JSON.parse(additional_data || "{}")),
        billingSystem: parseString(billing_system),
        billingSystemType: parseString(billing_system_type),
        username,
        amount,
        amountFormatted: amount_formatted,
        amountMain: +amount_main,
        currency: currency as Currency,
        message: parseString(message),
        header: parseString(header),
        dateCreated: new Date(date_created.replace(" ", "T")), // Z at the end?
        emotes: parseString(emotes), // Array?
        apId: parseNumber(ap_id),
        isTestAlert: !!_is_test_alert,
        messageType: (message_type || DonationMessageType.Text) as DonationMessageType,
        presetId: parseNumber(preset_id),
        raw
    }
}

export function parseUser({
    id,
    roles,
    code,
    name,
    avatar,
    email,
    language,
    socket_connection_token,
    timezone,
    main_currency,
    token,
    black_list_words,
    balances,
    ...raw    
} : {
    id: string,
    roles: string[],
    code: string,
    name: string,
    avatar: string,
    email: string,
    language: string,
    socket_connection_token: string,
    timezone: string,
    main_currency: string,
    token: string,
    black_list_words: string[]
    adv_brands: any[], // ???
    balances: { balance: number, adv_balance: number, currency: string }[]
}) : User {
    return { 
        id: +id,
        token,
        socketConnectionToken: socket_connection_token,
        roles: [...roles].map(role => role as UserRole),
        email,
        code,
        name,
        avatar,
        timezone,
        language: language as Language,
        mainCurrency: main_currency as Currency,
        blackListWords: [...black_list_words],
        balances: [...balances].map(({
            balance,
            adv_balance,
            currency
        }) => ({ 
            balance: +balance, 
            adv_balance: +adv_balance,
            currency: currency as Currency
        })),
        raw
    }
}