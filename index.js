const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

// ================== CONFIG ==================
const CONFIG = {
  host: "191.96.231.27",
  port: 10570,
  username: "BetterSurvivall_",
  password: "thien100200300emyeu"  // Thêm password vào config
}

// ================== AUTH STATE ==================
let isAuthDone = false
let authTries = 0
let currentAttempt = "login" // "login" hoặc "register"

// ================== START BOT ==================
function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: false,
    auth: "offline"
  })

  // ================== LOGIN ==================
  bot.once("login", () => {
    console.log("✔ Login thành công (packet)")
  })

  // ================== SPAWN ==================
  bot.once("spawn", () => {
    console.log("✔ Bot vào world")

    setTimeout(() => {
      tryLogin()
    }, 3000)

    startBrain()
  })

  // ================== AUTO LOGIN FIX ==================
  function tryLogin() {

    if (isAuthDone) return
    if (authTries > 5) {
      console.log("❌ Quá số lần thử, chờ reconnect...")
      return
    }

    authTries++
    console.log(`🔐 Đang thử ${currentAttempt}... lần ${authTries}`)

    if (currentAttempt === "login") {
      bot.chat(`/login ${CONFIG.password}`)
    } else {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)
    }

    // Sau 3 giây nếu chưa thành công thì chuyển sang cách khác
    setTimeout(() => {
      if (!isAuthDone) {
        if (currentAttempt === "login") {
          console.log("⚠️ Login chưa thành công, thử register...")
          currentAttempt = "register"
          authTries = 0 // Reset số lần thử cho register
          tryLogin()
        } else if (currentAttempt === "register") {
          console.log("⚠️ Register chưa thành công, thử lại login...")
          currentAttempt = "login"
          authTries = 0 // Reset số lần thử cho login
          tryLogin()
        }
      }
    }, 3000)
  }

  // ================== DETECT LOGIN SUCCESS ==================
  bot.on("messagestr", (msg) => {

    if (!msg) return
    const text = msg.toLowerCase()

    // Các dấu hiệu thành công
    if (
      text.includes("logged in") ||
      text.includes("login successful") ||
      text.includes("successfully") ||
      text.includes("đăng nhập thành công") ||
      text.includes("registered") ||
      text.includes("đã đăng ký")
    ) {
      isAuthDone = true
      currentAttempt = "login"
      authTries = 0
      console.log("✔ AUTH THÀNH CÔNG!")
    }

    // Các dấu hiệu đã đăng ký rồi
    if (
      text.includes("already registered") ||
      text.includes("đã đăng ký") ||
      text.includes("already logged in")
    ) {
      console.log("⚠️ Đã đăng ký trước đó, chuyển sang login...")
      currentAttempt = "login"
      authTries = 0
      tryLogin()
    }

    // Sai mật khẩu
    if (
      text.includes("wrong password") ||
      text.includes("sai mật khẩu") ||
      text.includes("incorrect password")
    ) {
      console.log("❌ Sai mật khẩu, thử lại...")
      if (currentAttempt === "login") {
        authTries = 0
        tryLogin()
      }
    }
  })

  // ================== ERROR HANDLING ==================
  bot.on("kicked", (reason) => {
    console.log("❌ Bot bị kick:", reason)
    isAuthDone = false
    authTries = 0
    currentAttempt = "login"
  })

  bot.on("error", (err) => {
    console.log("❌ Lỗi:", err.message)
  })

  bot.on("end", () => {
    console.log("🔄 Mất kết nối, reconnect sau 15s...")

    isAuthDone = false
    authTries = 0
    currentAttempt = "login"

    setTimeout(startBot, 15000)
  })
}

// ================== SAFE CHECK ==================
function safe(fn) {
  if (!bot || !bot.entity) return
  fn()
}

// ================== AI BRAIN ==================
function startBrain() {

  setInterval(() => {
    safe(() => {
      move()
      look()
      attack()
      breakBlock()
      randomChat()
    })
  }, 700)

  setInterval(() => {
    safe(() => {

      bot.setControlState("forward", true)

      if (Math.random() < 0.4) {
        bot.setControlState("sprint", true)
      } else {
        bot.setControlState("sprint", false)
      }

      bot.setControlState("jump", true)
      setTimeout(() => bot.setControlState("jump", false), 150)

    })
  }, 2000)
}

// ================== MOVE ==================
function move() {
  safe(() => {

    bot.setControlState("forward", true)

    if (Math.random() < 0.3) {
      bot.setControlState("left", true)
      setTimeout(() => bot.setControlState("left", false), 300)
    }

    if (Math.random() < 0.3) {
      bot.setControlState("right", true)
      setTimeout(() => bot.setControlState("right", false), 300)
    }

  })
}

// ================== LOOK ==================
function look() {
  safe(() => {
    bot.look(
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5),
      true
    )
  })
}

// ================== BREAK BLOCK ==================
function breakBlock() {
  safe(() => {
    const block = bot.blockAt(bot.entity.position.offset(1, 0, 0))
    if (block && bot.canDigBlock(block)) {
      bot.dig(block).catch(() => {})
    }
  })
}

// ================== ATTACK ==================
function attack() {
  safe(() => {

    const target = bot.nearestEntity(e =>
      e.type === "mob" || e.type === "player"
    )

    if (!target) return

    const dist = bot.entity.position.distanceTo(target.position)

    if (dist < 4) {
      bot.setControlState("jump", true)
      bot.attack(target)
      setTimeout(() => bot.setControlState("jump", false), 200)
    }

  })
}

// ================== CHAT ==================
const chats = [
  "ez 😎",
  "bot here 🤖",
  "gg",
  "combat mode",
  "hi server"
]

function randomChat() {
  if (Math.random() < 0.1) {
    bot.chat(chats[Math.floor(Math.random() * chats.length)])
  }
}

// ================== START ==================
startBot()

// ================== EXPRESS KEEP ALIVE ==================
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server running:", PORT)
})
