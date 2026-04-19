const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

// ================== CONFIG ==================
const CONFIG = {
  host: "191.96.231.27",
  port: 10570,
  username: "Samurai_alien"
}

// ================== AUTH STATE ==================
let isAuthDone = false
let authTries = 0

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
    if (authTries > 3) return

    authTries++

    console.log("🔐 Đang thử login... lần", authTries)

    bot.chat("/login thien24092012")

    setTimeout(() => {
      if (!isAuthDone) {
        bot.chat("/register thien24092012 thien24092012")
      }
    }, 2000)
  }

  // ================== DETECT LOGIN SUCCESS ==================
  bot.on("messagestr", (msg) => {

    if (!msg) return
    const text = msg.toLowerCase()

    if (
      text.includes("logged in") ||
      text.includes("login successful") ||
      text.includes("successfully") ||
      text.includes("đăng nhập thành công")
    ) {
      isAuthDone = true
      console.log("✔ LOGIN OK")
    }

  })

  // ================== ERROR HANDLING ==================
  bot.on("kicked", (r) => {
    console.log("❌ Kick:", r)
  })

  bot.on("error", (err) => {
    console.log("❌ Error:", err.message)
  })

  bot.on("end", () => {
    console.log("🔄 Reconnect sau 15s...")

    isAuthDone = false
    authTries = 0

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
