const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

const CONFIG = {
  host: "191.96.231.27",
  port: 10570,
  username: "Samurai_alien",
  password: "thien24092012"
}

let isLoggedIn = false
let loginStep = 0

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

  // ================== LOGIN EVENT ==================
  bot.once("login", () => {
    console.log("✔ Connected to server")
  })

  // ================== SPAWN ==================
  bot.once("spawn", () => {

    console.log("✔ Bot vào world")

    setTimeout(() => {
      autoAuth()
    }, 5000) // delay chống timeout

    startBrain()
  })

  // ================== AUTO AUTH ==================
  function autoAuth() {

    if (isLoggedIn) return
    if (loginStep > 3) return

    loginStep++

    console.log("🔐 Auth attempt:", loginStep)

    bot.chat("/login " + CONFIG.password)

    setTimeout(() => {

      if (!isLoggedIn) {
        bot.chat("/register " + CONFIG.password + " " + CONFIG.password)
      }

    }, 3000)
  }

  // ================== DETECT LOGIN ==================
  bot.on("messagestr", (msg) => {

    if (!msg) return
    const t = msg.toLowerCase()

    if (
      t.includes("successful") ||
      t.includes("logged in") ||
      t.includes("success")
    ) {
      isLoggedIn = true
      console.log("✔ LOGIN OK")
    }

    if (t.includes("login") && t.includes("timeout")) {
      console.log("❌ Login timeout detected")
    }

  })

  // ================== ERROR ==================
  bot.on("kicked", (r) => {
    console.log("❌ Kick:", r)
  })

  bot.on("error", (e) => {
    console.log("❌ Error:", e.message)
  })

  bot.on("end", () => {

    console.log("🔄 Reconnect sau 15s...")

    isLoggedIn = false
    loginStep = 0

    setTimeout(startBot, 15000)
  })
}

// ================== SAFE ==================
function safe(fn) {
  if (!bot || !bot.entity) return
  fn()
}

// ================== BRAIN ==================
function startBrain() {

  // MOVEMENT LOOP
  setInterval(() => {

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

  }, 1000)

  // LOOK + JUMP
  setInterval(() => {

    safe(() => {

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5),
        true
      )

      bot.setControlState("jump", true)
      setTimeout(() => bot.setControlState("jump", false), 200)

    })

  }, 2000)

  // ATTACK
  setInterval(() => {

    safe(() => {

      const target = bot.nearestEntity(e =>
        e.type === "player" || e.type === "mob"
      )

      if (!target) return

      const dist = bot.entity.position.distanceTo(target.position)

      if (dist < 4) {
        bot.attack(target)
      }

    })

  }, 800)

  // RANDOM CHAT
  setInterval(() => {

    if (!bot || !isLoggedIn) return

    const msgs = ["gg", "ez", "hi", "bot online", "combat"]

    if (Math.random() < 0.1) {
      bot.chat(msgs[Math.floor(Math.random() * msgs.length)])
    }

  }, 7000)
}

// ================== START ==================
startBot()

// ================== WEB KEEP ALIVE ==================
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server running:", PORT)
})
