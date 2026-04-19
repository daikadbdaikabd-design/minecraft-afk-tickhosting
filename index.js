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
let brainStarted = false

function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: false,
    auth: "offline"
  })

  bot.once("spawn", () => {

    console.log("✔ Spawned")

    // CHỈ LOGIN, KHÔNG CHẠY BRAIN
    setTimeout(autoAuth, 5000)
  })

  function autoAuth() {

    if (isLoggedIn) return
    if (loginStep > 3) return

    loginStep++

    bot.chat("/login " + CONFIG.password)

    setTimeout(() => {
      if (!isLoggedIn) {
        bot.chat("/register " + CONFIG.password + " " + CONFIG.password)
      }
    }, 2500)
  }

  bot.on("messagestr", (msg) => {

    if (!msg) return
    const t = msg.toLowerCase()

    if (
      t.includes("successful") ||
      t.includes("logged in") ||
      t.includes("success")
    ) {
      isLoggedIn = true
      console.log("✔ LOGIN DONE")

      if (!brainStarted) {
        brainStarted = true
        startBrain()
      }
    }
  })

  bot.on("end", () => {

    isLoggedIn = false
    loginStep = 0
    brainStarted = false

    setTimeout(startBot, 15000)
  })
}

// ================== BRAIN (CHỈ CHẠY SAU LOGIN) ==================
function startBrain() {

  setInterval(() => {

    if (!bot || !isLoggedIn) return

    bot.setControlState("forward", true)

    if (Math.random() < 0.3) {
      bot.setControlState("left", true)
      setTimeout(() => bot.setControlState("left", false), 300)
    }

    if (Math.random() < 0.3) {
      bot.setControlState("right", true)
      setTimeout(() => bot.setControlState("right", false), 300)
    }

  }, 1000)

  setInterval(() => {

    if (!bot || !isLoggedIn) return

    bot.look(
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5),
      true
    )

    bot.setControlState("jump", true)
    setTimeout(() => bot.setControlState("jump", false), 200)

  }, 2000)

  setInterval(() => {

    if (!bot || !isLoggedIn) return

    const target = bot.nearestEntity(e =>
      e.type === "player" || e.type === "mob"
    )

    if (target && bot.entity.position.distanceTo(target.position) < 4) {
      bot.attack(target)
    }

  }, 800)
}

// ================== WEB ==================
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

app.listen(process.env.PORT || 3000, () => {
  console.log("Web running")
})

startBot()
