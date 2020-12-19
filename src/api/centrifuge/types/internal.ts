import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

import { Goal } from './types'

export const GoalResponseToGoal: D.Decoder<unknown, Goal> = pipe(
    D.type({
        data: D.type({
            id: D.number,
            is_active: D.number,
            title: D.string,
            currency: D.string,
            start_amount: D.number,
            raised_amount: D.number,
            goal_amount: D.number,
            started_at: D.string,
            started_at_ts: D.number,
            expires_at: D.string,
            expires_at_ts: D.number,
            reason: D.string
        })
    }),
    D.parse(response => {
        const goal: Goal = {
            id: response.data.id,
            isActive: response.data.is_active === 1,
            title: response.data.title,
            currency: response.data.currency,
            startAmount: response.data.start_amount,
            raisedAmount: response.data.raised_amount,
            goalAmount: response.data.goal_amount,
            startedAt: response.data.started_at,
            startedAtTs: response.data.started_at_ts,
            expiresAt: response.data.expires_at,
            expiresAtTs: response.data.expires_at_ts,
            reason: response.data.reason
        }

        return D.success(goal)
    })
)