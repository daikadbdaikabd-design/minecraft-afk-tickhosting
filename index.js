const mineflayer = require("mineflayer")
const express = require("express")

let bot
let afkInterval

function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "darkblademc.falix.dev",
    port: 31985,
    username: "_HuuThien_",
    version: "1.21.1"
  })

  bot.on("login", () => {
    console.log("Bot đã login server")
  })

  bot.on("spawn", () => {

    console.log("Bot đã vào world")

    // auto login
    setTimeout(() => {
      bot.chat("/login 123456")
    }, 3000)

    // auto register nếu cần
    setTimeout(() => {
      bot.chat("/register 123456 123456")
    }, 5000)

    if (afkInterval) clearInterval(afkInterval)

    // chống AFK
    afkInterval = setInterval(() => {

      if (!bot.entity) return

      bot.setControlState("jump", true)

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.5
      )

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 200)

    }, 1000)

  })

  bot.on("kicked", (reason) => {
    console.log("Bot bị kick:", reason)
  })

  bot.on("error", (err) => {
    console.log("Lỗi:", err.message)
  })

  bot.on("end", () => {

    console.log("Bot mất kết nối, reconnect sau 10s...")

    if (afkInterval) clearInterval(afkInterval)

    setTimeout(startBot, 10000)

  })
}

startBot()

// web server giữ Render online
const expressApp = express()

expressApp.get("/", (req, res) => {
  res.send("Bot AFK đang chạy")
})

expressApp.listen(10000, () => {
  console.log("Web server chạy port 10000")
})
