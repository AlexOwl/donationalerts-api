import { DASocket } from "./socket";
import { DAAPI } from "./api";
import { ClientType, Donation, EventName } from ".";
import { SKIP } from "./symbols";

const voidPromise = async () => {}

export class DAWidget {
    readonly api: DAAPI
    readonly socket: DASocket

    private _widgetBehavior = false
    get widgetBehavior() {
        return this._widgetBehavior
    }
    set widgetBehavior(value: boolean) {
        if(value === this._widgetBehavior) return

        this._widgetBehavior = value

        if(value)
            this.socket.on(EventName.Donation, this.onDonation)
        else 
            this.socket.off(EventName.Donation, this.onDonation)
    }

    alertDuration: number

    private lastTask= Promise.resolve()
    private [SKIP] = voidPromise

    constructor(token: string, { widgetBehavior = true, alertDuration = 10000, autoOpen = true } = {}) {
        this.api = new DAAPI(token)
        this.socket = new DASocket(token, { autoConnect: !autoOpen })
    
        this.alertDuration = alertDuration
        this.widgetBehavior = widgetBehavior

        if(autoOpen) this.open()
    }

    private onDonation = async (data: Donation) => {
        await this.lastTask
        this.lastTask = new Promise(resolve => {
            this.socket.alertStart({ duration: this.alertDuration, id: data.id, type: data.type })
            this.api.markAlertShown({ id: data.id, type: data.type })

            const timeout = setTimeout(() => {
                this[SKIP] = voidPromise

                this.socket.alertEnd({ id: data.id, type: data.type })
                resolve()
            }, this.alertDuration)

            this[SKIP] = async () => {
                clearTimeout(timeout)
                this[SKIP] = voidPromise

                this.socket.alertSkip({ id: data.id, type: data.type })
                await this.api.skipAlert({ id: data.id, type: data.type })
                resolve()
            }
        })
    }

    async skipCurrentAlert() {
        await this[SKIP]()
    }

    async open() {
        await this.close()

        await this.api.crawlWidget()
        await this.socket.crawlWidget()

        await this.socket.connect({ clientType: ClientType.AlertWidget })
    }

    async close() {
        await this.socket.disconnect()
    }
}