import got, { Method } from "got"
import { EventEmitter } from "events" 

import { AlertType, Currency } from "./types";
import { GOT } from "./symbols";
import { parseDonation, parseUser } from "./parsers";

import { DA_URL } from "../constants";

const regexAccessToken = /access_token\s*=\s*('|")(?<token>[\w\.\\-]+)\1/

/*
GET /api/v1/speechsynthesis?alert_id=&alert_type=&text=
POST /api/createsubscriber { "alert_type" : "youtube_membership" | "twitch_follow", "token" : token, "is_shown": 1 || 0, "event_data" : JSON.stringify(value) }
POST /api/createhost { "token" : _0x538a46, "channel_id" : _0x1f9e8e.channel_id, "is_shown" : 0, "event_data" : JSON.stringify({ "channel" : _0x518cd9, "username" : _0x39b86b, "viewers" : _0x1eb2ec, "autohost" : _0x5dfb47 }) }

/api/v1/widgetlog

/api/createraid
/api/createcheer
/api/createreward
/api/creategiftpaidupgrade
/api/getisswidgetdata
/api/createmysterygift

getPayList() {
        return ApiService.get('/payin/systems')
    },

    getCurrencyList() {
        return ApiService.get('/payin/systems/currencies')
    },

    getResult({ amount, system, currency }) {
        return ApiService.get(`/payin/systems/commission?amount=${ amount }&system=${ system }&currency=${ currency }&currency_expected=${ currency }`)
    }


      getLocalization(params = '') {
        return ApiService.post('/localization', params)
    }

     getStickerBalance(userId) {
        return ApiService.get('/sticker/list?user_id=' + userId)
    },

    getStreamPreview(userId) {
        return ApiService.get('/stream?user_id=' + userId)
    },

    getStickers(userId) {
        return ApiService.get('/sticker?user_id=' + userId)
    },

    postStickers(data) {
        return ApiService.post('/sticker', data)
    },

    putSticker({id, is_active}) {
        return ApiService.put(`/sticker/${ id }`, {
            is_active,
        })
    },

    delStickers(id) {
        return ApiService.delete('/sticker/' + id)
    },

    putStickers({stickers_ids, is_active}) {
        return ApiService.put('/sticker', {
            stickers_ids,
            is_active,
        })
    },

    https://www.donationalerts.com/dashboard/send-offers

    emitWidgetEvent: function(e, n) {
                        Object(r["a"])(e);
                        var i = n.event,
                            a = n.eventData,
                            o = void 0 === a ? null : a;
                        t.post("/widgets/emit-event", {
                            event: i,
                            eventData: o
                        })
                    },
                    createCustomAlert: function(e, n) {
                        Object(r["a"])(e);
                        var i = n.header,
                            a = n.message,
                            o = n.isShown,
                            s = void 0 === o ? 1 : o;
                        return t.post("/custom_alert", {
                            header: i,
                            message: a,
                            is_shown: s
                        })

                        this.addTestAlert = function(widget_id) {
		$.ajax({
			url: '/alert-variations/addtestalert',
			type: 'POST',
			data: { widget_id: widget_id },
			cache: false,
			dataType: 'json',
			context: this,
			resultContainer: this.grid_container_id,
			success: function(data, textStatus, jqXHR){
				addStatusMessage(data.status, data.text);
			}
		});
	}

	this.removeAlertQueue = function(alert_type) {
		if (confirm(translateString('alert_variations_clear_queue_warning'))) {
			$.ajax({
				url: '/alert-variations/removealertqueue',
				type: 'POST',
				data: { alert_type: alert_type },
				cache: false,
				dataType: 'json',
				context: this,
				resultContainer: this.grid_container_id,
				success: function(data, textStatus, jqXHR){
					addStatusMessage(data.status, data.text);
				}
			});
		};
	}

*/

export class DAAPI extends EventEmitter {
    readonly token: string;

    private accessToken?: string;

    private [GOT] = got.extend({ 
        prefixUrl: DA_URL
    })

    constructor(token: string, { accessToken } : { accessToken?: string } = {}) {
        super()

        this.token = token
        this.accessToken = accessToken
    }

    async crawlWidget() {
        const body = await this[GOT]("widget/alerts", {
            searchParams: {
                token: this.token
            },
            resolveBodyOnly: true
        })

        const accessToken = regexAccessToken.exec(body)?.groups?.token

        if(!accessToken) throw new Error("Could not parse access token")

        const prev = {
            accessToken: this.accessToken
        }

        this.accessToken = accessToken

        return {
            prev,
            accessToken
        }
    }

    async getUser() {
        const { data } = await this.requestApi("user")

        return parseUser(data)
    }

    async markAlertShown({
        id,
        type
    } : {
        id: number,
        type: AlertType
    }) {
        const { message } = await this.requestInternalApi("markalertshown", { 
            params: {
                alert: id,
                alert_type: type
            } 
        })

        return message
    }

    async repeatAlert({
        id,
        type
    } : {
        id: number,
        type: AlertType
    }) {
        const { message } = await this.requestInternalApi("repeatalert", { 
            params: {
                alert: id,
                alert_type: type
            } 
        })

        return message
    }

    async skipAlert({
        id,
        type
    } : {
        id: number,
        type: AlertType
    }) {
        const { message } = await this.requestInternalApi("skipalert", { 
            params: {
                alert: id,
                alert_type: type
            } 
        })

        return message
    }

    async skipMedia(id: number) {
        const { message } = await this.requestInternalApi("skipmedia", { 
            params: {
                media_id: id
            } 
        })

        return message
    }

    async markMediaPlayed(id: number) {
        const { message } = await this.requestInternalApi("markmediaplayed", { 
            params: {
                media_id: id
            } 
        })

        return message
    }

    async getMedia() {
        const { media } = await this.requestInternalApi("getmediadata")

        return { raw: media } // Array?
    }

    async getPollWidget() {
        const { data } = await this.requestInternalApi("getpollwidgetdata")

        return { raw: data } // boolean?
    }

    async getWidget() {
        const { alerts, settings, tts_mins, ...raw } = await this.requestInternalApi("getwidgetdata")

        return {
            alerts: [...alerts].map(parseDonation),
            settings: {
                raw: settings // TODO: parse
            },
            ttsMins: Object.entries<number>(tts_mins).reduce((prev, [key, value], i) => ({ ...prev, [key as Currency]: +value }), <{[x in Currency]: number}>{ }),
            raw
        }
    }

    async requestApi(endpoint: string, { 
        version = 1,
        method = "GET", 
        data, 
        params 
    }: { version?: number, 
        method?: Method, 
        data?: any, 
        params?: { [x: string]: any } 
    } = {}) {
        if(!this.accessToken) await this.crawlWidget()

        const body = await this[GOT](`api/v${version}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Accept-Language": undefined // set lang
            },
            responseType: "json",
            resolveBodyOnly: true,
            method,
            json: data,
            searchParams: params
        }) as { [x: string]: any }

        return body
    }

    async requestInternalApi(endpoint: string, { 
        method = "GET",
        data,
        params
    }: { 
        method?: Method,
        data?: any,
        params?: { [x: string]: any}
    } = {}) {
        const body = await this[GOT](`api/${endpoint}`, {
            headers: {
                "Accept-Language": undefined // set lang
            },
            responseType: "text",
            resolveBodyOnly: true,
            method,
            json: data,
            searchParams: {
                ...params,
                token: this.token
            }
        })

        const response: {
            status?: "success"
        } | {
            status:  "error",
            message: string
        } = JSON.parse(body.replace(/^\((.+)\)$/, "$1"))

        switch(response.status) {
            case "error":
                throw new Error(response.message)
            default:
            case "success":
                const { status, ...raw } = response
                return raw as { [x: string]: any }

        }
    }
}