import * as either from "fp-ts/lib/Either"
import * as D from 'io-ts/Decoder'
import { pipe } from "fp-ts/lib/pipeable"

import got from "got"

import { DonationAlertsCentrifuge } from "./centrifuge"
import { DonationAlertsSocket } from "./socket"
import { UserResponseToUser } from "./types/internal"
import { User} from "./types"

export class DonationAlertsApi {
    /**
     * The streamer token
     * 
     * @readonly
     */
    public readonly token: string
    public readonly socket: DonationAlertsSocket
    public readonly centrifuge: DonationAlertsCentrifuge

    /**
     * The access token of the Donation Alerts
     * 
     * @description Must be used as the bearer token to access API/v1
     */
    public accessToken?: string
    
    private readonly gotInstance = got.extend({ 
        prefixUrl: "https://www.donationalerts.com/" 
    })

    constructor(token: string) {
        this.token = token

        this.socket = new DonationAlertsSocket(this)
        this.centrifuge = new DonationAlertsCentrifuge(this)
    }

    /**
     * Initializes the API
     * 
     * @description Must be used before accessing another features
     * @async
     */
    public async connect() {
        const { body } = await this.gotInstance("widget/alerts", {
            searchParams: {
                token: this.token
            }
        })

        const regexResult = /access_token\s*=\s*('|")(?<token>[\w\.\\-]+)\1/.exec(body)

        if(!regexResult || !regexResult.groups) throw new Error("Could not parse accessToken")

        this.accessToken = regexResult.groups.token
    }

    /**
     * Fetches info about the logged in user
     * 
     * @returns the user's info
     * @async
     */
    public async getUser(): Promise<User> {
        if(!this.accessToken) throw new Error("accessToken is not defined")

        const { body } = await this.gotInstance("api/v1/user", {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            responseType: "json"
        })

        return pipe(
            UserResponseToUser.decode(body),
            either.getOrElseW(errors => {
                throw new Error(D.draw(errors))
            })
        )
    }

    /*private async getGoalsWidget(): Promise<WidgetGoal> {
        const user = await this.getUser()

        const { body } = await this.gotInstance(`api/v1/widgets/goal/${user.id}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            responseType: "json"
        })

        const response = <WidgetGoalResponse>body
        if(isErrorResponse(response)) throw new Error(response.message)

        return response.data.json
    }*/

    /**
     * @todo
     */
    private async getPollWidget() { // old api
        // load  https://www.donationalerts.com/api/getpollwidgetdata?token=${this.token}&callback=callback
    }

    /**
     * @todo
     */
    private async getAlertsWidget() { // old api
        // load  https://www.donationalerts.com/api/getwidgetdata?token=${this.token}&error=&callback=callbacks
    }
    
    /**
     * @todo
     */
    private async getIssWidget(widgetId: number) { // old api
        // load  https://www.donationalerts.com/api/getisswidgetdata?widget_id=${widgetId}&token=${this.token}&callback=callbacks
    }
}