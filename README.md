# DonationAlerts API

[![type](https://img.shields.io/npm/types/donationalerts-api.svg?style=for-the-badge)
![travis](https://img.shields.io/travis/com/AlexOwl/donationalerts-api.svg?style=for-the-badge)
![npm](https://img.shields.io/npm/v/donationalerts-api.svg?style=for-the-badge)
![dependencies](https://img.shields.io/david/AlexOwl/donationalerts-api.svg?style=for-the-badge)](https://github.com/AlexOwl/donationalerts-api)


# 💿 Installation

```bat
npm i donationalerts-api
```

# 📖 Usage

[Find `Secret token` value](https://www.donationalerts.com/dashboard/general#token_value)
## Basic Usage

```ts
import { EventName, DAWidget } from "donationalerts"

const token = "ON3g9GNujvQYu3g9GNQY" // secret token url param from any widget

const dawidget = new DAWidget(token, {
    widgetBehavior: true,
    alertDuration: 10000
})

dawidget.api.getUser().then(user => console.log(
    "api:user", 
    user.id,
    user.socketConnectionToken,
    user.code,
    user.mainCurrency,
    user.balances
))

dawidget.socket.on(EventName.Donation, donation => console.log(
    "socket:donation"
    donation.username, 
    donation.message, 
    donation.amount, 
    donation.currency, 
    donation.additionalData.isCommissionCovered
))
```

## Advanced Usage

```ts
import { EventName, DAWidget } from "donationalerts"

const token = "ON3g9GNujvQYu3g9GNQY" // secret token url param from any widget

const dasocket = new DASocket(token, {
    socketUrl: 7
})

const daapi = new DAAPI(token, {
    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiOTQ1NzI0MTM2MGIzOGE4YTRjZWU0OGU0YmZiNWMyN2FmMGViOWZkY2M3MGI4M2FkNjhmYjViZWYwNzc3ZjNmZjFhMzg0NzAzMmM5Yzc0NGUiLCJpYXQiOjE2MzIwNjgzNjAsIm5iZiI6MTYzMjA2ODM2MCwiZXhwIjozMjA5OTA1MTYwLCyIiwianRpIjoiOTQ1NzI0MTM2MGIzOGE4YTRjZWU0OGU0YmZiNWMyN2FmMGViOWZkY2M3MGI4M2FkNjhmYjViZWYwNzc3ZjNmZJzdWIiOiI0MjY1NjQ2Iiwic2NvcGVzIjpbIndpZGdldC1zdHJlYW1lciJiZWYwNzc3ZjNmZjFhMzg0NzAzMmM5Yzc0NGUiLCJpYXQiOjE2MzIwNjgzNjAsIm5iZiI6MTYzMjA2ODM2MCwiZXhMTM2MGIzOGE4YTRjZWU0OGU0YmZiNWMyN2FmMGViOWZkY2M3MGI4M2FkNjhmYjViZWYwNzc3ZjNmZjFhMzg0NzAzMmM5Yzc0NGU"
})

daapi.crawlWidget().then(data => console.log(
    "api:crawl", 
    data.accessToken
))

daapi.requestApi("donationgoal", {
    params: {
        is_active: 0,
        include_timestamps: 1
    }
}).then(data => console.log(
    "api:crawl", 
    data.accessToken
))

dasocket.mediaPause()

dasocket.on(EventName.AlertSkip, alert => console.log(
    "socket:alert_skip"
    alert.id, 
    alert.type
))
```

# DAWidget

```ts
new DAWidget(token: string, { 
    widgetBehavior?: boolean,
    alertDuration?: number, 
    autoOpen?: boolean 
}?)
```

### token

DonationAlerts Secret token, can be found as a param in any widget url

You can find the token at the [dashboard](https://www.donationalerts.com/dashboard/general#token_value)

### widgetBehavior
Default: `true`

See [widgetBehavior](#widgetbehavior-1) property description

### alertDuration
Default: `10000`

See [alertDuration](#alertduration-1) property description

### autoOpen
Default: `true`

Set to `false` if you want to manually call [open](#open)

## Properties

### api

```ts
readonly api: DAAPI
```

The instance of the [DAAPI](#daapi) class, can be used to access API

```ts
/* Usage example */

/* ... */
const user = await dawidget.api.getUser()
```

### socket

```ts
readonly socket: DASocket
```

The instance of the [DASocket](#dasocket) class, can be used to access Socket

```ts
/* Usage example */

/* ... */
dawidget.socket.mediaPause()
```

### widgetBehavior

```ts
widgetBehavior: boolean
```

When connected to socket and `widgetBehavior` set to `true`, acts as default DonationAlerts widget, so [Last Alert Panel](https://www.donationalerts.com/dashboard/lastdonations-widget) would work correctly (new alerts wouldn't have unplayed state)

```js
/*  
 *  Note:
 *  You can use lastdonation widget as the OBS panel without authorization, just add the token param at the end
 *  For instance, https://www.donationalerts.com/widget/lastdonations?alert_type=1,12&limit=100&token=ON3g9GNujvQYu3g9GNQY
 */
```

```ts
/* Usage example */

/* ... */
if(!dawidget.widgetBehavior) dawidget.widgetBehavior = true
```

### alertDuration

```ts
alertDuration: number
```

Widget pretending duration (ms) to be shown at [Last Alert Panel](https://www.donationalerts.com/dashboard/lastdonations-widget)

```ts
/* Usage example */

/* ... */
dawidget.alertDuration = 20000 // 20s
```

## Methods

### skipCurrentAlert

```ts
async skipCurrentAlert(): Promise<void>
```

Skip currently playing alert

Works only if `widgetBehavior` is `true` and alert

```ts
/* Usage example */

/* ... */
dawidget.skipCurrentAlert()
```

### open

```ts
async open(): Promise<void>
```

Crawl necessary data from widget page and init api + socket connections

```ts
/* Usage example */
const dawidget = new DAWidget({ autoOpen: false })

await dawidget.open()
```

### close

```ts
async close(): Promise<void>
```
Close all opened connections

```ts
/* Usage example */

/* ... */
dawidget.close()
```

# DAAPI

```ts
new DAAPI(token: string, { 
    accessToken?: string
}?)
```

### token

See [token](#token-2) property description

### accessToken
Default: `undefined`

You can provide your own accessToken to access public api

If not provided, will try to crawl it from widget page using [crawlWidget](#crawlwidget) method

## Properties
### token

```ts
readonly token: string
```

The token used to access internal DA api

See [DAWidget's token](#token) property description

```ts
/* Usage example */

/* ... */
const token = daapi.token
```
## Methods

### crawlWidget

```ts
async crawlWidget(): Promise<{prev: { accessToken?: string }, accessToken: string}>
```

Crawl necessary data from widget page to use public api

It is not necessary to call this method because it will be called automatically if `accessData` is not specified by the constructor

```ts
/* Usage example */
const daapi = new DAAPI(...)

const info = await daapi.crawlWidget()
console.log(`prev: ${info.prev.accessToken}, new: ${info.accessToken}`)
```

### getUser

```ts
async getUser(): Promise<User>
```

Public DA method `api/v1/user`, gets info about the accessToken's owner

Response is parsed according to our guideline

Try to use it and check what data do to you have access to, because DA API can be changed everyday

If DA implements new properties in future and module is outdated, you can access those by using `raw` property in response object

```ts
/* Usage example */

/* ... */
const user = await daapi.getUser()
console.log(
    user.socketConnectionToken,
    user.id,
    user.code,
    user.mainCurrency,
    user.balances,
    user.raw
)
```

### markAlertShown

```ts
async markAlertShown({ id: number, type: AlertType }): Promise<string>
```

Internal DA method `api/markalertshow`, used to remove unplayed status of the alert

```ts
/* Usage example */

/* ... */
const donation = ... // raw id is alert_id, raw type is alert_type

daapi.markAlertShown({ id: donation.id, type: donation.type })
```

### skipAlert

```ts
async skipAlert({ id: number, type: AlertType }): Promise<string>
```

### skipMedia

```ts
async skipMedia(id: number): Promise<string>
```

### markMediaPlayed

```ts
async markMediaPlayed(id: number): Promise<string>
```

### getMedia

```ts
async getMedia(): Promise<{ raw: any }>
```

### getPollWidget

```ts
async getPollWidget(): Promise<{ raw: any }>
```

### getWidget

```ts
async getWidget(): Promise<{ 
    alerts: Donation[], 
    settings: { raw: any }, 
    ttsMins: { [x: Currency]: number}, 
    raw: any
}>
```

### requestApi

```ts
async requestApi(endpoint: string, { 
    version?: number,
    method?: Method, 
    data?: any, 
    params?: any 
}?): Promise<{ [x: string]: any }>
```

Request public API (with `accessToken`, url starts with `/api/v1/...`)

### requestInternalApi

```ts
async requestInternalApi(endpoint: string, {
    method?: Method, 
    data?: any, 
    params?: any 
}?): Promise<{ [x: string]: any }>
```

Request internal API (with `token`, url starts with `/api/...`)

# DASocket

```ts
new DASocket(token: string, { 
    socketUrl?: number | string,
    autoConnect?: boolean
}?) extends Emittery
```

[emittery](https://www.npmjs.com/package/emittery) is used as events manager, you are free to use it's api

### token

See [token](#token-3) property description

### socketUrl
Default: `undefined`

Every streamer account belongs to the specified socket server, for instance `wss://socket7.donationalerts.ru`

If `string` is specified, it will override the whole url to connect

If `number` is specified, it will override only server number

If `undefined` is specified, it will try to crawl url with [crawlWidget](#crawlwidget-1) method

Note: if you specify wrong server, connection would not work

### autoConnect

Set to `false` if you want to manually call [connect](#connect)

## Properties

### token

```ts
readonly token: string
```

The token used to access internal DA socket

See [DAWidget's token](#token) property description

```ts
/* Usage example */

/* ... */
const token = dasocket.token
```

### connected

```ts
readonly connected: boolean
```

Defines if socket is successfully connected

## Methods

### on

```ts
on(name: EventName.Donation, listener: (event: Donation) => void): void
on(name: EventName.AlertStart, listener: (event: AlertShowStartEvent) => void): void
on(name: EventName.AlertEnd, listener: (event: AlertShowEvent) => void): void
on(name: EventName.AlertSkip, listener: (event: AlertShowEvent) => void): void
on(name: EventName.Media, listener: (event: RawData) => void): void
on(name: EventName.Stickers, listener: (event: RawData) => void): void
```

Subscribe to new events, listener must be a callback which will be called with an event param

```ts
/* Usage example */
const dasocket = new DASocket(...)

dasocket.on(EventName.Donation, donationEvent => console.log(
    donationEvent.id,
    donationEvent.type,
    donationEvent.username,
    donationEvent.amountMain,
    donationEvent.currency,
    donationEvent.message,
    donationEvent.additionalData,
    donationEvent.raw
))

dasocket.on(EventName.AlertSkip, alertSkipEvent => console.log(
    alertSkipEvent.id,
    alertSkipEvent.type,
    alertSkipEvent.raw
))

dasocket.on(EventName.Media, mediaEvent => console.log(
    mediaEvent.raw
))
```

### crawlWidget

```ts
async crawlWidget(): Promise<{prev: { socketUrl?: string }, socketUrl: string}>
```

Crawl necessary data from widget page to use internal DA socket

It is not necessary to call this method because it will be called automatically if `socketUrl` is not specified by the constructor

```ts
/* Usage example */
const dasocket = new DASocket(...)

const info = await dasocket.crawlWidget()
console.log(`prev: ${info.prev.socketUrl}, new: ${info.socketUrl}`)
```

### connect

```ts
async connect({ addUser?: boolean, clientType?: ClientType }?): Promise<void>
```

```ts
/* Usage example */
const dasocket = new DASocket({ autoConnect: false })

await dasocket.connect({
    addUser: true,
    clientType: ClientType.AlertWidget // Minor is used by default
})
```

### disconnect

```ts
async disconnect(): Promise<void>
```

```ts
/* Usage example */

/* ... */
await dasocket.disconnect()
```

### addUser

```ts
async addUser(type: ClientType): Promise<void>
```

```ts
/* Usage example */
const dasocket = new DASocket({ autoConnect: false })
await dasocket.connect({ addUser: false })
await dasocket.addUser(ClientType.AlertShow)
```

### alertStart

```ts
alertStart({ 
    id: number,
    type: AlertType,
    groupId?: number,
    duration?: number
}): void
```

### alertEnd

```ts
alertEnd({ id: number, type: AlertType }): void
```

### alertSkip

```ts
alertSkip({ id: number, type: AlertType }): void
```

### mediaEnd

```ts
mediaEnd(id: number): void
```

### mediaShowWidget

```ts
mediaShowWidget(): void
```

### mediaHideWidget

```ts
mediaHideWidget(): void
```

### mediaPause

```ts
mediaPause(): void
```

### mediaUnpause

```ts
mediaUnpause(): void
```

### mediaGetPauseState

```ts
mediaGetPauseState(source: any): void
```

### mediaGetCurrent

```ts
mediaGetCurrent(source: any): void
```

### mediaGetVolumeOverride

```ts
mediaGetVolumeOverride(volume: number): void
```

### mediaReceiveVolumeOverride

```ts
mediaReceiveVolumeOverride(volume: number): void
```

### mediaReceivePauseState

```ts
mediaReceivePauseState({
    source: string,
    media: any,
    isPaused: boolean,
    volumeOverride: number
}): void
```

### mediaReceiveCurrentMedia

```ts
mediaReceiveCurrentMedia({
    source: string,
    media: any,
    isPaused: boolean,
    volumeOverride: number
}): void
```

# 📝 License

Released under [MIT license](https://AlexOwl.mit-license.org/)

# 🦉 [Alex Owl](https://github.com/AlexOwl)