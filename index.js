const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "darkblademc.mcsh.io",
    port: 14488,
    username: "_HuuThien_",
    version: "1.21.1"
  })

  bot.on("login", () => {
    console.log("Bot đã login server")
  })

  bot.on("spawn", () => {
    console.log("Bot đã vào world")

    // chống AFK: nhảy mỗi 1s
    setInterval(() => {

      if (!bot.entity) return

      bot.setControlState("jump", true)

      // xoay đầu random
      bot.look(Math.random() * Math.PI * 2, 0)

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 200)

    }, 1000)

  })

  bot.on("end", () => {
    console.log("Bot mất kết nối, reconnect sau 30s...")
    setTimeout(startBot, 30000)
  })

  bot.on("error", (err) => {
    console.log("Lỗi:", err)
  })

}

startBot()

// web server để giữ render online
const app = express()

app.get("/", (req, res) => {
  res.send("Bot AFK đang chạy")
})

app.listen(10000, () => {
  console.log("Web server chạy port 10000")
})
