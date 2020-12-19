import * as D from 'io-ts/Decoder'
import * as either from "fp-ts/lib/Either"
import { pipe } from 'fp-ts/function'

import { AlertShow, AlertShowAction, AlertType, PaidMessage, PaidMessageType } from './types'
import { StringToCurrency } from '../../types/internal'

const ParseJSON = D.parse<string, either.Json>(result => either.parseJSON(result, err => D.error(err, "valid json object")))

export enum AddUserType {
    AlertWidget = "alert_widget",
    Minor = "minor"
}

export const StringToAlertType = pipe(
    D.string,
    D.parse(result => Object.values(AlertType).some(v => v === result) ? D.success(<AlertType>result) : D.failure(result, "alert type") )
)

export const StringToPaidMessageType = pipe(
    D.string,
    D.parse(result => Object.values(PaidMessageType).some(v => v === result) ? D.success(<PaidMessageType>result) : D.failure(result, "paid message type") )
)

export const StringToIsShow = pipe(
    D.string,
    D.parse(result => D.success(result == "1"))
)

export const StringToAdditionalData = pipe(
    D.string,
    ParseJSON,
    D.parse(result => pipe(
        D.type({
            randomness: D.number,
            is_commission_covered: D.boolean
        }),
        D.parse(result => {
            const additionalData: PaidMessage["additionalData"] = {
                randomness: result.randomness,
                isCommissionCovered: result.is_commission_covered
            }

            return D.success(additionalData)
        })
    ).decode(result))
)

export const StringToPaidMessage: D.Decoder<unknown, PaidMessage> = pipe(
    D.string,
    ParseJSON,
    D.parse(result => pipe(
        D.type({
            id: D.number,
            alert_type: StringToAlertType,
            message_type: StringToPaidMessageType,
            _is_test_alert: D.boolean,
    
            date_created: D.string,
            is_shown: StringToIsShow,
            additional_data: StringToAdditionalData,
    
            billing_system: D.string,
            billing_system_type: D.nullable(D.string),
            
            amount: D.string,
            amount_formatted: D.string,
            amount_main: D.number,
            currency: StringToCurrency,
    
            username: D.string,
            message: D.string,
            header: D.string,
    
            emotes: D.nullable(D.string),
            ap_id: D.nullable(D.number)
        }),
        D.parse(result => {
            const paidMessage: PaidMessage = {
                id: result.id,
                alertType: result.alert_type,
                messageType: result.message_type,
                isTestAlert: result._is_test_alert,
                dateCreated: result.date_created,
                isShown: result.is_shown,
                additionalData: result.additional_data,
                billingSystem: result.billing_system,
                billingSystemType: result.billing_system_type,
                amount: result.amount,
                amountFormatted: result.amount_formatted,
                amountMain: result.amount_main,
                currency: result.currency,
                username: result.username,
                message: result.message,
                header: result.header,
                emotes: result.emotes,
                apId: result.ap_id,
            } 

            return D.success(paidMessage)
        })
    ).decode(result))
)

export const StringToAlertShowAction = pipe(
    D.string,
    D.parse(result => Object.values(AlertShowAction).some(v => v === result) ? D.success(<AlertShowAction>result) : D.failure(result, "alert show action") )
)

export const StringToAlertShow: D.Decoder<unknown, AlertShow> = pipe(
    D.string,
    ParseJSON,
    D.parse(result => pipe(
        D.type({
            action: StringToAlertShowAction,
            alert_type: StringToAlertType,
            alert_id: D.number,
            duration: D.nullable(D.number),
            group_id: D.nullable(D.number)
        }),
        D.parse(result => {
            const alertShow: AlertShow = {
                action: result.action,
                alertType: result.alert_type,
                alertId: result.alert_id,
                duration: result.duration,
                groupId: result.group_id
            }

            return D.success(alertShow)
        })
    ).decode(result))
)