const mineflayer = require("mineflayer")
const express = require("express")

let bot = null

const chats = [
  "ez 😎",
  "tôi là bot 🤖",
  "gg",
  "combat mode on",
  "đừng đánh tôi 😆",
  "pro player here",
]

// ================= START BOT =================
function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "191.96.231.27",
    port: 10570,
    username: "queen_ItS",
    version: "1.20.1"
  })

  // ===== LOGIN =====
  bot.on("login", () => {
    console.log("Bot đã login server")
  })

  // ===== SPAWN =====
  bot.on("spawn", () => {
    console.log("Bot đã vào world")

    startBrain()
  })

  // ===== AUTO REGISTER / LOGIN =====
  bot.on("messagestr", (msg) => {

    if (msg.includes("/register")) {
      bot.chat("/register thien24092012 thien24092012")
    }

    if (msg.includes("/login")) {
      bot.chat("/login thien24092012")
    }

  })

  bot.on("kicked", (reason) => {
    console.log("Bot bị kick:", reason)
  })

  bot.on("error", (err) => {
    console.log("Lỗi:", err.message)
  })

  bot.on("end", () => {
    console.log("Bot mất kết nối, reconnect sau 30s...")
    setTimeout(startBot, 30000)
  })

}

// ================= BOT BRAIN =================
function startBrain() {

  // 🔁 MAIN LOOP
  setInterval(() => {

    if (!bot || !bot.entity) return

    moveRandom()
    lookRandom()
    breakBlockFront()
    attackNearby()
    randomChat()

  }, 1200)

  // 🦘 ANTI AFK JUMP
  setInterval(() => {
    if (!bot) return

    bot.setControlState("jump", true)

    setTimeout(() => {
      bot.setControlState("jump", false)
    }, 200)

  }, 5000)

}

// ================= MOVE RANDOM =================
function moveRandom() {
  if (!bot.entity) return

  const dir = Math.random()

  if (dir < 0.25) bot.setControlState("forward", true)
  else if (dir < 0.5) bot.setControlState("back", true)
  else {
    bot.setControlState("forward", false)
    bot.setControlState("back", false)
  }

  if (Math.random() < 0.3) {
    bot.setControlState("left", true)
    setTimeout(() => bot.setControlState("left", false), 500)
  }

  if (Math.random() < 0.3) {
    bot.setControlState("right", true)
    setTimeout(() => bot.setControlState("right", false), 500)
  }
}

// ================= LOOK RANDOM =================
function lookRandom() {
  const yaw = Math.random() * Math.PI * 2
  const pitch = (Math.random() - 0.5)

  bot.look(yaw, pitch, true)
}

// ================= BREAK BLOCK FRONT =================
function breakBlockFront() {
  const block = bot.blockAt(bot.entity.position.offset(1, 0, 0))

  if (block && bot.canDigBlock(block)) {
    bot.dig(block).catch(() => {})
  }
}

// ================= ATTACK NEARBY =================
function attackNearby() {
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
    }, 250)
  }
}

// ================= CHAT RANDOM =================
function randomChat() {
  if (Math.random() < 0.25) {
    const msg = chats[Math.floor(Math.random() * chats.length)]
    bot.chat(msg)
  }
}

// ================= START =================
startBot()

// ================= EXPRESS SERVER =================
const app = express()

app.get("/", (req, res) => {
  res.send("bot online")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server chạy port", PORT)
})
