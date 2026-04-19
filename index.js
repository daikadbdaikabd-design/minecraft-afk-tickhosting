const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

const CONFIG = {
  host: "191.96.231.27",
  port: 10570,
  username: "Samurai_alien",
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
 bot.on("messagestr", (msg) => {

    if (msg.includes("/register")) {
      bot.chat("/register thien24092012 thien24092012")
    }

    if (msg.includes("/login")) {
      bot.chat("/login thien24092012")
    }


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

// web server cho UptimeRobot
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server chạy port", PORT)
})
