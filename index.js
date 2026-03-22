const mineflayer = require("mineflayer")
const express = require("express")

const PASSWORD = "123456" // đổi mật khẩu ở đây

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

    if (afkInterval) clearInterval(afkInterval)

    // AFK chống kick
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

  // detect login / register message
  bot.on("message", (msg) => {

    const text = msg.toString()

    if (text.includes("/register")) {
      console.log("Đăng ký tài khoản...")
      bot.chat(`/register ${thien24092012} ${thien24092012}`)
    }

    if (text.includes("/login")) {
      console.log("Đăng nhập...")
      bot.chat(`/login ${thien24092012}`)
    }

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
const app = express()

app.get("/", (req, res) => {
  res.send("Bot AFK đang chạy")
})

const PORT = process.env.PORT || 10000

app.listen(PORT, () => {
  console.log("Web server chạy port", PORT)
})
