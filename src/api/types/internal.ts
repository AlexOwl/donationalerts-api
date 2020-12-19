import * as D from 'io-ts/Decoder'
import * as either from "fp-ts/lib/Either"
import { pipe } from 'fp-ts/function'

import { Currency, User, UserRole, WidgetGoal } from "./types"

export const StringToUserRole = pipe(
    D.string,
    D.parse(response => Object.values(UserRole).some(v => v === response) ? D.success(<UserRole>response) : D.failure(response, "user role"))
) 

export const StringToCurrency = pipe(
    D.string,
    D.parse(response => Object.values(Currency).some(v => v === response) ? D.success(<Currency>response) : D.failure(response, "currency"))
)

const ErrorResponse = D.type({
    message: D.string
})

const checkErrorResponse = D.mapLeftWithInput((input, error) => pipe(
    input,
    ErrorResponse.decode,
    either.fold(
        () => error, 
        errorResponse => D.error(input, errorResponse.message)
    )
))

export const UserResponseToUser: D.Decoder<unknown, User> = pipe(
    D.type({
        data: D.type({
            id: D.number,
            roles: D.array(StringToUserRole),
            code: D.string,
            name: D.string,
            avatar: D.string,
            email: D.string,
            language: D.string,
            socket_connection_token: D.string,
            timezone: D.string,
            main_currency: StringToCurrency,
            token: D.string
        })
    }),
    checkErrorResponse,
    D.parse(response => {
        const user: User = {
            id: response.data.id,
            roles: response.data.roles,
            code: response.data.code,
            name: response.data.name,
            avatar: response.data.avatar,
            email: response.data.email,

            language: response.data.language,
            timezone: response.data.timezone,
            currency: response.data.main_currency,

            token: response.data.token,
            socketToken: response.data.socket_connection_token
        }

        return D.success(user)
    })
)
  
/*export const WidgetGoalInfo = D.type({
    id: D.number,
    preset: D.nullable(D.string),
    //json: D
})
export interface WidgetGoalInfo extends D.TypeOf<typeof WidgetGoalInfo> {}

export const WidgetGoalResponse = D.type({
    data: WidgetGoalInfo
})*/