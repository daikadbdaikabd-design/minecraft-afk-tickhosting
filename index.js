const mineflayer = require("mineflayer")
const express = require("express")

let bot = null
let reconnectTimer = null
let isReconnecting = false

// ================== CONFIG ==================
const CONFIG = {
  host: "191.96.231.27",
  port: 10570,
  username: "gerq",
  password: "thien100200300emyeu"
}

// ================== AUTH STATE ==================
let isAuthDone = false
let authTries = 0
let currentAttempt = "login"
let loginTimeout = null

// ================== START BOT ==================
function startBot() {
  // Clear reconnect flag
  isReconnecting = false
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  console.log("Đang khởi động bot...")
  console.log(`Host: ${CONFIG.host}:${CONFIG.port}`)
  console.log(`Username: ${CONFIG.username}`)

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
    
    // Reset auth state
    isAuthDone = false
    authTries = 0
    currentAttempt = "login"
    
    // Thử login sau 2 giây
    setTimeout(() => {
      tryLogin()
    }, 2000)
    
    startBrain()
  })

  // ================== AUTO LOGIN FIX ==================
  function tryLogin() {
    // Clear previous timeout
    if (loginTimeout) {
      clearTimeout(loginTimeout)
    }
    
    if (isAuthDone) {
      console.log("✓ Auth đã hoàn tất, bỏ qua")
      return
    }
    
    if (authTries >= 3) {
      console.log("❌ Quá số lần thử (3 lần), chờ tín hiệu từ server...")
      return
    }

    authTries++
    console.log(`🔐 Thử ${currentAttempt} lần thứ ${authTries}/3...`)

    if (currentAttempt === "login") {
      bot.chat(`/login ${CONFIG.password}`)
    } else {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)
    }

    // Timeout để chuyển đổi phương thức
    loginTimeout = setTimeout(() => {
      if (!isAuthDone && authTries < 3) {
        if (currentAttempt === "login") {
          console.log("⚠️ Login không thành công, thử register...")
          currentAttempt = "register"
          tryLogin()
        } else if (currentAttempt === "register") {
          console.log("⚠️ Register không thành công, thử lại login...")
          currentAttempt = "login"
          tryLogin()
        }
      }
    }, 4000)
  }

  // ================== DETECT LOGIN SUCCESS ==================
  bot.on("message", (message) => {
    if (!message || !message.toString()) return
    
    const msgText = message.toString()
    const text = msgText.toLowerCase()
    
    console.log(`[CHAT] ${msgText}`)

    // THÀNH CÔNG - Login hoặc Register thành công
    if (
      text.includes("logged in") ||
      text.includes("login successful") ||
      text.includes("successfully logged") ||
      text.includes("đăng nhập thành công") ||
      text.includes("registered") ||
      text.includes("đã đăng ký thành công") ||
      text.includes("registration successful")
    ) {
      isAuthDone = true
      currentAttempt = "login"
      authTries = 0
      if (loginTimeout) clearTimeout(loginTimeout)
      console.log("✔✔✔ AUTH THÀNH CÔNG! ✔✔✔")
      return
    }
    
    // ĐÃ ĐĂNG KÝ - Chuyển sang login
    if (
      text.includes("already registered") ||
      text.includes("đã đăng ký") ||
      text.includes("already logged in") ||
      text.includes("already exists")
    ) {
      console.log("⚠️ Đã đăng ký, chuyển sang đăng nhập...")
      currentAttempt = "login"
      authTries = 0
      if (loginTimeout) clearTimeout(loginTimeout)
      tryLogin()
      return
    }
    
    // SAI MẬT KHẨU - Thử lại
    if (
      text.includes("wrong password") ||
      text.includes("sai mật khẩu") ||
      text.includes("incorrect password") ||
      text.includes("invalid password")
    ) {
      console.log("❌ Sai mật khẩu, thử lại...")
      if (currentAttempt === "login") {
        authTries = 0
        if (loginTimeout) clearTimeout(loginTimeout)
        tryLogin()
      }
      return
    }
    
    // CHƯA ĐĂNG KÝ - Chuyển sang register
    if (
      text.includes("please register") ||
      text.includes("chưa đăng ký") ||
      text.includes("not registered") ||
      text.includes("please login") ||
      text.includes("vui lòng đăng nhập")
    ) {
      console.log("⚠️ Chưa đăng ký, chuyển sang đăng ký...")
      currentAttempt = "register"
      authTries = 0
      if (loginTimeout) clearTimeout(loginTimeout)
      tryLogin()
      return
    }
  })

  // Fallback cho event messagestr (nếu server dùng)
  bot.on("messagestr", (msg) => {
    if (!msg) return
    const text = msg.toLowerCase()
    
    if (
      text.includes("logged in") ||
      text.includes("login successful") ||
      text.includes("registered")
    ) {
      isAuthDone = true
      currentAttempt = "login"
      authTries = 0
      if (loginTimeout) clearTimeout(loginTimeout)
      console.log("✔✔✔ AUTH THÀNH CÔNG! ✔✔✔")
    }
  })

  // ================== ERROR & RECONNECT HANDLING ==================
  bot.on("kicked", (reason) => {
    console.log("❌ Bot bị kick:", reason)
    console.log("🔄 Sẽ tự động reconnect sau 10 giây...")
    
    isAuthDone = false
    authTries = 0
    currentAttempt = "login"
    if (loginTimeout) clearTimeout(loginTimeout)
    
    if (bot) {
      bot.end()
      bot = null
    }
    
    // Auto reconnect khi bị kick
    if (!isReconnecting) {
      isReconnecting = true
      reconnectTimer = setTimeout(() => {
        console.log("🔄 Đang reconnect lại bot...")
        startBot()
      }, 10000)
    }
  })

  bot.on("error", (err) => {
    console.log("❌ Lỗi bot:", err.message)
    
    // Một số lỗi cần reconnect
    if (err.message.includes("ECONNRESET") || 
        err.message.includes("ETIMEDOUT") ||
        err.message.includes("ECONNREFUSED")) {
      console.log("🔄 Lỗi kết nối, sẽ reconnect...")
      if (!isReconnecting && bot) {
        isReconnecting = true
        bot.end()
        bot = null
        reconnectTimer = setTimeout(() => {
          console.log("🔄 Đang reconnect lại bot...")
          startBot()
        }, 10000)
      }
    }
  })

  bot.on("end", (reason) => {
    console.log("🔄 Mất kết nối:", reason || "Không rõ lý do")
    console.log("🔄 Sẽ tự động reconnect sau 10 giây...")
    
    isAuthDone = false
    authTries = 0
    currentAttempt = "login"
    if (loginTimeout) clearTimeout(loginTimeout)
    
    // Auto reconnect khi mất kết nối
    if (!isReconnecting) {
      isReconnecting = true
      reconnectTimer = setTimeout(() => {
        console.log("🔄 Đang reconnect lại bot...")
        startBot()
      }, 10000)
    }
  })
}

// ================== SAFE CHECK ==================
function safe(fn) {
  if (!bot || !bot.entity) return
  try {
    fn()
  } catch (err) {
    console.log("Safe function error:", err.message)
  }
}

// ================== AI BRAIN ==================
function startBrain() {
  setInterval(() => {
    safe(() => {
      move()
      look()
      attack()
      breakBlock()
      // Đã xóa randomChat()
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

// ================== START ==================
startBot()

// ================== EXPRESS KEEP ALIVE ==================
const app = express()

app.get("/", (req, res) => {
  res.send("Bot is online! Status: " + (bot && bot.entity ? "Connected" : "Reconnecting..."))
})

app.get("/status", (req, res) => {
  res.json({
    online: bot && bot.entity ? true : false,
    authDone: isAuthDone,
    reconnecting: isReconnecting,
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Web server running on port:", PORT)
})

// Handle process exit
process.on("SIGINT", () => {
  console.log("Đang tắt bot...")
  if (bot) {
    bot.end()
  }
  process.exit(0)
})
