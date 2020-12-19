import * as either from "fp-ts/lib/Either"
import * as D from 'io-ts/Decoder'
import { pipe } from "fp-ts/lib/pipeable"

import { EventEmitter } from "events"
import io from "socket.io-client" // v2 cause of DA

import Constants from "../../constants"
import { DonationAlertsApi } from "../api"
import { AddUserType, StringToAlertShow, StringToPaidMessage } from "./types/internal"
import { SocketEvent } from "./types"

// TODO: use typed EventEmitter
export class DonationAlertsSocket extends EventEmitter {
    private readonly api: DonationAlertsApi
    private socket?: SocketIOClient.Socket

    constructor(api: DonationAlertsApi) {
        super()

        this.api = api
    }

    private addUser(type: AddUserType = AddUserType.AlertWidget) {
        this.socket?.emit("add-user", {
            token: this.api.token,
            type
        })
    }

    private addSocketListeners() {
        for(const event of [SocketEvent.Connect, SocketEvent.Error, SocketEvent.ConnectError, SocketEvent.ConnectTimeout, SocketEvent.Disconnect])
            this.socket?.on(event, this.emit.bind(this, event))

        for(const [event, callback] of Object.entries({
            [SocketEvent.Donation]: this.onDonation,
            [SocketEvent.AlertShow]: this.onAlertShow,
            [SocketEvent.Media]: this.onMedia,
            [SocketEvent.Stickers]: this.onStikers
        }))
            this.socket?.on(event, callback)
    }

    public async connect(url: string = Constants.DEFAULT_SOCKET_URL) {
        this.socket?.disconnect()

        this.socket = io(url, {
            reconnection: true,
            reconnectionDelay: Constants.RECONNECTION_DELAY_MIN,
            reconnectionDelayMax: Constants.RECONNECTION_DELAY_MAX,
            autoConnect: false
        })

        this.addSocketListeners()

        this.socket.connect()

        this.addUser()

        await new Promise((resolve, reject) => this.socket?.once(SocketEvent.Connect, resolve).once(SocketEvent.ConnectError, reject).once(SocketEvent.ConnectTimeout, reject))

        // TODO: handle additional info
        /*//this.socket.on("update-iss_data", )

        this.socket.on("update-dg_data", (data: string) => {
            const info: {
                goal_id?: number
            } = JSON.parse(data)

            //console.log("update-dg_data", info)
        })

        this.socket.on("update-alert_widget", (data: string) => {
            const info: {
                _additional?: {
                    reload?: boolean
                }
            } = JSON.parse(data)

            //console.log("update-alert_widget", info)
        })

        this.socket.on("update-user_general_widget_settings'", (data: string) => {
            //console.log("update-user_general_widget_settings'", data)
        })*/
    }

    private onDonation = (data: string) => {
        const result = pipe(
            StringToPaidMessage.decode(data),
            either.getOrElseW(errors => {
                throw new Error(D.draw(errors))
            })
        )
        this.emit(SocketEvent.Donation, result)
    }

    private onAlertShow = (data: string) => {
        const result = pipe(
            StringToAlertShow.decode(data),
            either.getOrElseW(errors => {
                throw new Error(D.draw(errors))
            })
        )
        this.emit(SocketEvent.AlertShow, result)
    }

    /**
     * @todo
     */
    private onMedia = (data: string) => {
        /*const info: {
            action: string
            media?: {
                media_id: number
                user_id: number

                type: string
                sub_type: string

                title: string
                additional_data?: {
                    video_id: string
                    alert_id: number
                    alert_type: number
                    owner: string,
                    url: string
                    start_from: number
                    paid_amounts: {
                        [key: string]: number
                    }
                }

                date_created: string
                is_played: boolean
                date_played?: string
            }
        } = JSON.parse(data)

        console.log("media debug")
        console.dir(info)

        if(!(info.media && info.media.additional_data)) {
            console.log("bad media")
            return
        }

        const result : Media = {
            action: <Action>info.action,
            media: {
                mediaId: info.media.media_id,
                userId: info.media.user_id,
                type: <MediaType>info.media.type,
                subType: <MediaSubType>info.media.sub_type,
                title: info.media.title,
                additionalData: {
                    videoId: info.media.additional_data.video_id,
                    alertId: info.media.additional_data.alert_id,
                    alertType: <AlertType>info.media.additional_data.alert_type.toString(),
                    owner: info.media.additional_data.owner,
                    url: info.media.additional_data.url,
                    startFrom: info.media.additional_data.start_from,
                    paidAmounts: <{ [key in Currency]: number }>info.media.additional_data.paid_amounts
                },
                dateCreated: info.media.date_created,
                isPlayed: info.media.is_played,
                datePlayed: info.media.date_played
            }
        }

        this.emit(SocketEvent.Media, result)*/
    }

    /**
     * @todo
     */
    private onStikers = (data: string) => {
        /*const info: {
            action: string
            stickers: {
                id: number
                left: number
                top: number
                scale: number
                angle: number
                url: string
            }[]
        } = JSON.parse(data)

        const result: Stickers = {
            action: <AlertShowAction>info.action,
            stickers: info.stickers.map(info => {
                const result: Sticker = {
                    id: info.id,
                    left: info.left,
                    top: info.top,
                    scale: info.scale,
                    angle: info.angle,
                    url: info.url
                }
                return result
            })
        }

        this.emit(SocketEvent.Stickers, result)*/
    }
}