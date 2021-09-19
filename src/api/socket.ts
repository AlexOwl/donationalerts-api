import got from "got"
import io from "socket.io-client" // DA->v2
import Emittery from "emittery" 

import { AlertShowAction, AlertShowEvent, AlertShowStartEvent, AlertType, ServerEventName, RawData, ClientType, EventName, Donation } from "./types";
import { GOT } from "./symbols";
import { parseDonation } from "./parsers";

import { DA_URL, RECONNECTION_DELAY_MAX, RECONNECTION_DELAY_MIN } from "../constants";

const regexSocketUrl = /io\(('|")(?<url>[\w\.\:\/]+)\1/

export class DASocket extends Emittery<{
    [EventName.Donation]: Donation,
    [EventName.AlertStart]: AlertShowStartEvent,
    [EventName.AlertEnd]: AlertShowEvent,
    [EventName.AlertSkip]: AlertShowEvent,
    [EventName.Media]: RawData,
    [EventName.Stickers]: RawData
}> {
    readonly token: string;
    private socketUrl?: string;

    private socket?: SocketIOClient.Socket

    constructor(token: string, { socketUrl, autoConnect = true } : { socketUrl?: number | string, autoConnect?: boolean } = {}) {
        super()

        this.token = token

        this.socketUrl = typeof socketUrl === "number" ? `wss://socket${socketUrl}.donationalerts.ru` : socketUrl

        if(autoConnect) this.connect()
    }

    get connected() {
        return this.socket?.connected || false
    }

    private [GOT] = got.extend({ 
        prefixUrl: DA_URL
    })

    async crawlWidget() {
        const body = await this[GOT]("widget/alerts", {
            searchParams: {
                token: this.token
            },
            resolveBodyOnly: true
        })

        const socketUrl = regexSocketUrl.exec(body)?.groups?.url

        if(!socketUrl) throw new Error("Could not parse socket url")

        const prev = {
            socketUrl: this.socketUrl
        }

        this.socketUrl = socketUrl

        return {
            prev,
            socketUrl
        }
    }

    async connect({ addUser = true, clientType = ClientType.Minor } = {}) {
        if(!this.socketUrl) await this.crawlWidget()

        this.socket?.disconnect()
        this.socket?.removeAllListeners()

        this.socket = io(`${this.socketUrl}`, {
            reconnection: true,
            reconnectionDelay: RECONNECTION_DELAY_MIN,
            reconnectionDelayMax: RECONNECTION_DELAY_MAX
        })

        const callbacks = {
            [ServerEventName.Donation]: (data: any) => this.emit(EventName.Donation, parseDonation(data)), 
            [ServerEventName.AlertShow]: ({
                action,
                duration,
                group_id,
                alert_id,
                alert_type,
                ...raw
            } : {
                action: string,
                duration?: number | string,
                group_id?: number | string,
                alert_id: number | string,
                alert_type: number | string
            }) => {
                const eventData: AlertShowEvent = {
                    id: +alert_id,
                    type: +alert_type as AlertType,
                    raw
                }

                switch(action as AlertShowAction) {
                    case AlertShowAction.Start:
                        const startEventData: AlertShowStartEvent = {
                            ...eventData,
                            duration: +(duration || 0),
                            groupId: group_id === undefined ? undefined : +group_id
                        }

                        this.emit(EventName.AlertStart, startEventData)
                        break
                    case AlertShowAction.End:
                        this.emit(EventName.AlertEnd, eventData)
                        break
                    case AlertShowAction.Skip:
                        this.emit(EventName.AlertSkip, eventData)
                        break
                }
            },
            [ServerEventName.Media]: ({
                ...raw
            } : {
            }) => {
                // TODO: parse
                const eventData: RawData = {
                    raw
                }

                this.emit(EventName.Media, eventData)
                /* {
                    action: 'add',
                    media: {
                        media_id: 0,
                        user_id: '4265646',
                        type: 'video',
                        sub_type: 'youtube',
                        title: 'Darude - Sandstorm',
                        additional_data: '{"video_id":"y6120QOlsfU","alert_id":0,"alert_type":1,"owner":"\\u0418\\u043c\\u044f","url":"https:\\/\\/www.youtube.com\\/watch?v=y6120QOlsfU","start_from":0,"paid_amounts":{"BYN":12.41,"EUR":4.24,"KZT":2126.75,"RUB":362.16,"UAH":133.35,"USD":5,"BRL":26.12,"TRY":42.23,"PLN":19.41}}',
                        date_created: '2021-09-16 21:34:08',
                        is_played: 0,
                        date_played: null
                    }
                }
                { action: 'get-pause-state', source: 'media_widget' }
                {
                    action: 'settings-change',
                    settings: {
                        widget_id: '4983358',
                        user_id: '4265646',
                        is_enabled: '1',
                        background_color: '#00FF00',
                        min_amount: '20.00',
                        video_display: 'manual',
                        sound_container: 'media_widget',
                        volume: '50',
                        amount_per_second_is_enabled: '0',
                        amount_per_second: '0.50',
                        additional_data: '{"video_min_likes_perc":50,"video_min_views":50000}'
                    }
                } {
                    action: 'play',
                    media: {
                        media_id: 0,
                        user_id: '4265646',
                        type: 'video',
                        sub_type: 'youtube',
                        title: 'Darude - Sandstorm',
                        additional_data: {
                        video_id: 'y6120QOlsfU',
                        alert_id: 0,
                        alert_type: 1,
                        owner: 'Имя',
                        url: 'https://www.youtube.com/watch?v=y6120QOlsfU',
                        start_from: 0,
                        paid_amounts: [Object]
                        },
                        date_created: '2021-09-16 21:36:13',
                        is_played: 0,
                        date_played: null
                    }
                }
                 {
                    action: 'add',
                    media: {
                        media_id: 0,
                        user_id: '4265646',
                        type: 'video',
                        sub_type: 'youtube',
                        title: 'Rick Astley - Never Gonna Give You Up (Video)',
                        additional_data: '{"video_id":"dQw4w9WgXcQ","alert_id":0,"alert_type":1,"owner":"\\u0418\\u043c\\u044f","url":"https:\\/\\/www.youtube.com\\/watch?v=dQw4w9WgXcQ","start_from":0,"paid_amounts":{"BYN":12.41,"EUR":4.24,"KZT":2126.75,"RUB":362.16,"UAH":133.35,"USD":5,"BRL":26.12,"TRY":42.23,"PLN":19.41}}',
                        date_created: '2021-09-16 21:38:43',
                        is_played: 0,
                        date_played: null
                    }
                } 
                { action: 'skip', media: { media_id: 0 } }
                { action: 'get-current-media', source: 'last_alerts_widget' }
                { action: 'receive-volume-override', volume: '50' }
                */
            },
            [ServerEventName.Stickers]: ({
                ...raw
            } : {
            }) => {
                // TODO: parse
                const eventData: RawData = {
                    raw
                }

                this.emit(EventName.Stickers, eventData)
                /* {
                    action: 'add',
                    stickers: [
                        {
                        id: '92397',
                        left: 89,
                        top: 8,
                        scale: 1.45,
                        angle: -219,
                        url: 'https://static.donationalerts.ru/uploads/stickers/4265646/DnkKPqB41S0npMu28BfRiJxDioIxC8qx0UIwMcHQ.png'
                        }
                    ]
                } */
            },
            "update-iss_data": (data: any) => {
                // DEBUG
            },
            "update-dg_data": (data: any) => {
                // DEBUG
                /*
                { goal_id: 4170128 }
                */
            },
            "update-alert_widget": (data: any) => {
                // DEBUG
                 /* alert widget {
  variations: [
    {
      entity_id: '17565030',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/tortik.mp3',
      image: 'images/4265646/tort.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '7.00',
      text_delay: '0.00',
      text_duration: '7.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":1},{"mode":"random","value":3}]',
      name: null,
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22404274',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/mvideo.mp3',
      image: 'images/4265646/mvideo.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '13.00',
      text_delay: '0.00',
      text_duration: '13.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"1"},{"mode":"amount_equal_to","value":5600}]',
      name: '5600',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22410449',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/nihuyativiebal.mp3',
      image: 'images/4265646/nihuyativiebal.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '8.00',
      text_delay: '0.00',
      text_duration: '8.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"1"},{"mode":"amount_equal_or_greater_than","value":100}]',
      name: '100',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22467003',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/presedent.mp3',
      image: 'images/4265646/presedent.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '7.00',
      text_delay: '0.00',
      text_duration: '7.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"1"},{"mode":"amount_equal_or_greater_than","value":500}]',
      name: '500',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22467239',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/shokolad.mp3',
      image: 'images/4265646/shoko.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '10.00',
      text_delay: '0.00',
      text_duration: '10.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"1"},{"mode":"amount_equal_or_greater_than","value":300}]',
      name: '300',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22502157',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/delfin.mp3',
      image: 'images/4265646/delfin.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '8.00',
      text_delay: '0.00',
      text_duration: '8.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"1"},{"mode":"amount_equal_or_greater_than","value":1000}]',
      name: '1000',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} - {amount}!',
      message_template: null
    },
    {
      entity_id: '22870910',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/tortik.mp3',
      image: 'images/4265646/tort.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '7.00',
      text_delay: '0.00',
      text_duration: '7.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"4"},{"mode":"months_in_a_row","value":1}]',
      name: '1 мес',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: '{username} стал Бемровичем',
      message_template: null
    },
    {
      entity_id: '27302266',
      user_id: '4265646',
      group_id: '1',
      window_coor_x: '0',
      window_coor_y: '0',
      background_color: '#00FF00',
      volume: '50',
      display_pattern: 'image_top__text_bottom',
      sound: 'sounds/4265646/tortik.mp3',
      image: 'images/4265646/tort.gif',
      message_background: 'rgba(0, 0, 0, 0)',
      is_temporary_disabled: '0',
      color_1: '#000000',
      color_2: '#000000',
      display_duration: '7.00',
      text_delay: '0.00',
      text_duration: '7.00',
      font_size_1: '0',
      font_size_2: '0',
      header_text: '{"font_style":{"font-family":"\\"Rubik Mono One\\"","font-size":"80px","color":"#FFFFFF","font-weight":"bold","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"8px","text-shadow_color":"rgba(0, 0, 0, 0.09)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(255, 255, 255, 0)","border-radius":"0px"},"font_animation":{"text-animation":"rubberBand","text-animation-mode":"letters"}}',
      message_text: '{"font_style":{"font-family":"\\"Rubik\\"","font-size":"50px","color":"rgb(255, 255, 255)","font-weight":"normal","font-style":"normal","text-decoration":"none","text-transform":"none","text-shadow":"7px","text-shadow_color":"rgba(0, 0, 0, 0.03)","letter-spacing":"0px","word-spacing":"0px","text-align":"center","vertical-align":"middle","background-color":"rgba(223, 255, 0, 0)","border-radius":"0px"},"font_animation":{"text-animation":"none","text-animation-mode":"letters"}}',
      donation_audio_volume: '50',
      donation_audio_play_scenario: 'after_sound',
      donation_audio_playback: '0',
      tts_is_enabled: '1',
      tts_language: 'ru_RU',
      tts_scenario: 'after_sound',
      tts_volume: '30',
      tts_amount_min: '0.00',
      tts_voice: 'male,female,3,19,20,',
      tts_rate: 'medium',
      variation_conditions: '[{"mode":"alert_type","value":"12"},{"mode":"random","value":3}]',
      name: 'кастом',
      is_active: '1',
      is_deleted: '0',
      position: '0',
      additional_data: null,
      header_template: null,
      message_template: null
    }
  ],
  _additional: { source: 'zf2' }
} */
            },
            "update-corona_widget": (data: any) => {
                // DEBUG
            },
            "update-stickers_widget": (data: any) => {
                // DEBUG
            },
            "update-user_general_widget_settings": (data: any) => {
                // DEBUG
            }
        }

        for(const [event, callback] of Object.entries(callbacks))
            this.socket.on(event, (data: string) => callback(JSON.parse(data)))

        if(addUser) this.addUser(clientType)
    }

    async disconnect() {
        this.socket?.disconnect()
        this.socket?.removeAllListeners()

        this.socket = undefined
    }

    addUser(type: ClientType) {
        this.send("add-user", undefined, {
            type
        })
    }

    alertStart({
        duration, 
        groupId, // string
        id,
        type // string
    } : {
        id: number,
        type: AlertType,
        groupId?: number,
        duration?: number
    }) {
        this.send(ServerEventName.AlertShow, {
            action: AlertShowAction.Start,
            duration,
            group_id: groupId,
            alert_id: id,
            alert_type: type
        })
    }

    alertEnd({
        id,
        type
    } : {
        id: number,
        type: AlertType
    }) {
        this.send(ServerEventName.AlertShow, {
            action: AlertShowAction.End,
            alert_id: id,
            alert_type: type
        })
    }

    alertSkip({
        id,
        type
    } : {
        id: number,
        type: AlertType
    }) {
        this.send(ServerEventName.AlertShow, {
            action: AlertShowAction.Skip,
            alert_id: id,
            alert_type: type
        })
    }

    mediaEnd(id: number) {
        this.send(ServerEventName.Media, {
            action: "end",
            media: {
                media_id: id
            }
        })
    }
    
    mediaShowWidget() {
        this.send(ServerEventName.Media, {
            action: "show-widget"
        })
    }

    mediaHideWidget() {
        this.send(ServerEventName.Media, {
            action: "hide-widget"
        })
    }

    mediaPause() {
        this.send(ServerEventName.Media, {
            action: "pause"
        })
    }

    mediaUnpause() {
        this.send(ServerEventName.Media, {
            action: "unpause"
        })
    }

    mediaGetPauseState(source: any) {
        this.send(ServerEventName.Media, {
            action: "get-pause-state",
            source
        })
    }

    mediaGetCurrent(source: any) {
        this.send(ServerEventName.Media, {
            action: "get-current-media",
            source
        })
    }

    mediaGetVolumeOverride(volume: number) { // ???
        this.send(ServerEventName.Media, {
            action: "get-volume-override",
            volume
        })
    }

    mediaReceiveVolumeOverride(volume: number) { // update volume
        this.send(ServerEventName.Media, {
            action: "receive-volume-override",
            volume
        })
    }
    
    mediaReceivePauseState({
        source,
        media,
        isPaused,
        volumeOverride
    } : {
        source: string,
        media: any,
        isPaused: boolean,
        volumeOverride: number
    }) {
        this.send(ServerEventName.Media, {
            action: "receive-current-media",
            source,
            media,
            is_paused: isPaused,
            volume_override: volumeOverride
        })
    }

    mediaReceiveCurrentMedia({
        source, // last_alerts_widget
        media, // {"media_id":0,"user_id":"4265646","type":"video","sub_type":"youtube","title":"Darude - Sandstorm","additional_data":{"video_id":"y6120QOlsfU","alert_id":0,"alert_type":1,"owner":"Name","url":"https://www.youtube.com/watch?v=y6120QOlsfU","start_from":0,"paid_amounts":{"BYN":12.4,"EUR":4.25,"KZT":2129.25,"RUB":362.8,"UAH":133.68,"USD":5,"BRL":26.28,"TRY":42.93,"PLN":19.43}},"date_created":"2021-09-19 11:52:16","is_played":0,"date_played":null,"allowed_to_display":false}
        isPaused,
        isDisplaying
    } : {
        source: string,
        media: any,
        isPaused: boolean,
        isDisplaying: boolean
    }) {
        this.send(ServerEventName.Media, {
            action: "receive-current-media",
            source,
            media,
            is_paused: isPaused,
            is_displaying: isDisplaying
        })
    }

    private send(event: string, data: { [x: string]: any } = {}, params: { [x: string]: any } = {}) {
        this.socket?.emit(event, {
            ...params,
            token: this.token,
            message_data: data
        })
    }

}