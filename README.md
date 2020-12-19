# DonationAlerts API

# 💿 Installation

```bat
npm i donationalerts
```

# 📖 Usage

```js
import { DonationAlertsApi } from "donationalerts"

;(async () => {
    const api = new DonationAlertsApi("token_from_any_widget")

    await api.connect()

    console.log("bearer auth" api.accessToken)

    await api.socket.connect()

    api.socket.on("donation", data => {
        console.log("new donation!", data.username, data.message, data.amount, data.currency)
    })

})()
```