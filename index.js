const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

const chats = [
  "ez ",
  "@4/7 bên em!",
  "gg",
  "Anh Thiện HT1",
  "hello server",
  "auto mode on",
]

// ================= START BOT =================
function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "191.96.231.27",
    port: 10570,
    username: "Samurai_AlienEmero",
    version: "1.20.1"
  })

  bot.once("spawn", () => {
    console.log("Bot đã vào world")

    startBrain()
  })

  // AUTO LOGIN / REGISTER
  bot.on("messagestr", (msg) => {

    if (msg.includes("/register")) {
      bot.chat("/register thien24092012 thien24092012")
    }

    if (msg.includes("/login")) {
      bot.chat("/login thien24092012")
    }

  })

  bot.on("kicked", (r) => console.log("Kick:", r))
  bot.on("error", (e) => console.log("Error:", e.message))

  bot.on("end", () => {
    console.log("Reconnecting 30s...")
    setTimeout(startBot, 30000)
  })
}

// ================= SAFE RUN =================
function safe(fn) {
  if (!bot || !bot.entity) return
  fn()
}

// ================= BRAIN =================
function startBrain() {

  // 🔥 LOOP MAIN (KHÔNG ĐỨNG IM)
  setInterval(() => {
    safe(() => {
      move()
      look()
      breakBlock()
      attack()
      chatRandom()
    })
  }, 800)

  // 🦘 ANTI AFK + FORCE MOVE
  setInterval(() => {
    safe(() => {

      bot.setControlState("forward", true)

      if (Math.random() < 0.3) {
        bot.setControlState("sprint", true)
      } else {
        bot.setControlState("sprint", false)
      }

      bot.setControlState("jump", true)

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 200)

    })
  }, 2000)
}

// ================= MOVE =================
function move() {
  safe(() => {

    bot.setControlState("forward", true)

    // random đổi hướng
    if (Math.random() < 0.25) {
      bot.setControlState("left", true)
      setTimeout(() => bot.setControlState("left", false), 400)
    }

    if (Math.random() < 0.25) {
      bot.setControlState("right", true)
      setTimeout(() => bot.setControlState("right", false), 400)
    }

  })
}

// ================= LOOK =================
function look() {
  safe(() => {
    bot.look(
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5),
      true
    )
  })
}

// ================= BREAK BLOCK =================
function breakBlock() {
  safe(() => {
    const b = bot.blockAt(bot.entity.position.offset(1, 0, 0))
    if (b && bot.canDigBlock(b)) {
      bot.dig(b).catch(() => {})
    }
  })
}

// ================= ATTACK =================
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

      setTimeout(() => {
        bot.setControlState("jump", false)
      }, 200)
    }

  })
}

// ================= CHAT =================
function chatRandom() {
  if (Math.random() < 0.15) {
    const msg = chats[Math.floor(Math.random() * chats.length)]
    bot.chat(msg)
  }
}

// ================= START =================
startBot()

// ================= WEB SERVER =================
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

app.listen(3000, () => {
  console.log("Web server running")
})
