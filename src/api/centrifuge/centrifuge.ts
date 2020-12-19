import * as either from "fp-ts/lib/Either"
import * as D from 'io-ts/Decoder'
import { pipe } from "fp-ts/lib/pipeable"

import Centrifuge from "centrifuge"
import { EventEmitter } from "events"

import Constants from "../../constants"
import { DonationAlertsApi } from "../api"
import { GoalResponseToGoal } from "./types/internal"

if(!global.XMLHttpRequest) global.XMLHttpRequest = require("xhr2")
if(!global.WebSocket) global.WebSocket = require("ws")

// TODO: use typed EventEmitter
export class DonationAlertsCentrifuge extends EventEmitter {
    private readonly api: DonationAlertsApi
    private centrifuge?: Centrifuge

    constructor(api: DonationAlertsApi) {
        super()

        this.api = api
    }

    public async connect(url: string = Constants.DEFAULT_CENTRIFUGE_URL, subscribeUrl = Constants.DEFAULT_CENTRIFUGE_SUBSCRIBE_URL) {
        this.centrifuge?.disconnect()
    
        const user = await this.api.getUser()

        this.centrifuge = new Centrifuge(url, {
            subscribeEndpoint: subscribeUrl,
            subscribeHeaders: {
                Authorization: `Bearer ${this.api.accessToken}`
            },
            minRetry: Constants.RECONNECTION_DELAY_MIN,
            maxRetry: Constants.RECONNECTION_DELAY_MAX
        })

        this.centrifuge.setToken(user.socketToken)

        for(const event of ["connect", "disconnect", "error"])
            this.centrifuge.on(event, this.emit.bind(this, event))

        this.centrifuge.connect()

        await Promise.all(
            [this.onWidget(user.id), this.onGoal(user.id)].map(sub => 
                new Promise((resolve, reject) => sub.once("subscribe", resolve).once("error", reject))
            )
        )
    }

    private onWidget = (userId: number) => {
        if(!this.centrifuge) throw new Error("centrifuge is not set")

        return this.centrifuge.subscribe(`$widgets:widget_${userId}`, (data: unknown) => {
            // TODO
            /*const result = pipe(
                //GoalResponseToGoal.decode(data),
                either.getOrElseW(errors => {
                    throw new Error(D.draw(errors))
                })
            )

            this.emit("widget", result)*/
        })
    }

    private onGoal = (userId: number) => {
        if(!this.centrifuge) throw new Error("centrifuge is not set")

        return this.centrifuge.subscribe(`$goals:goal_${userId}`, (data: unknown) => {
            const result = pipe(
                GoalResponseToGoal.decode(data),
                either.getOrElseW(errors => {
                    throw new Error(D.draw(errors))
                })
            )

            this.emit("goal", result)
        })
    }
}