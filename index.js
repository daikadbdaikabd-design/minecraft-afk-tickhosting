const mineflayer = require("mineflayer")
const express = require("express")

let reconnecting = false

function startBot() {

  console.log("Đang khởi động bot...")

  const bot = mineflayer.createBot({
    host: "191.96.231.44",
    port: 14317,
    username: "DenLaDon_36",
    version: "1.20.1"
  })

  bot.on("spawn", () => {

    console.log("Bot đã vào world")

    setInterval(() => {

      if (!bot.entity) return

      bot.setControlState("jump", true)

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 300)

    }, 5000)

  })

  bot.on("end", () => {

    if (reconnecting) return

    reconnecting = true

    console.log("Mất kết nối, reconnect sau 30s...")

    setTimeout(() => {
      reconnecting = false
      startBot()
    }, 30000)

  })

  bot.on("error", (err) => {
    console.log("Lỗi:", err.message)
  })

}

startBot()

// uptime robot
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

app.listen(process.env.PORT || 3000)
