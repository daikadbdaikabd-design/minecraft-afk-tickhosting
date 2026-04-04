const mineflayer = require("mineflayer");
const express = require("express");

let bot;
let afkInterval;

const config = {
  host: "warmhousesmp.nethr.nl",
  port: 9598,
  username: "ChanBoMayDe",
  version: "1.20.1",
  password: "bot123"
};

function startBot() {
  console.log("--- Đang kết nối tới Server ---");

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    checkTimeoutInterval: 60000 // Tăng thời gian chờ phản hồi từ server
  });

  // Xử lý khi vào server (Login nhanh)
  bot.once("spawn", () => {
    console.log("Bot đã vào world. Đang tiến hành đăng nhập...");

    // Giảm thời gian chờ xuống 1s để tránh timeout
    setTimeout(() => {
      bot.chat(`/login ${config.password}`);
      bot.chat(`/register ${config.password} ${config.password}`);
    }, 1000);

    startAFK();
  });

  // Đọc tin nhắn server để tự động login nếu server yêu cầu lại
  bot.on("messagestr", (message) => {
    if (message.includes("/login")) {
      bot.chat(`/login ${config.password}`);
    }
    if (message.includes("/register")) {
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  function startAFK() {
    if (afkInterval) clearInterval(afkInterval);
    
    afkInterval = setInterval(() => {
      if (!bot.entity) return;
      
      // Hành động nhảy và xoay người nhẹ
      bot.setControlState("jump", true);
      bot.look(bot.entity.yaw + 0.5, 0); 
      
      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 500);
    }, 20000); // 20 giây thực hiện 1 lần là đủ chống AFK
  }

  // Tự động kết nối lại khi mất kết nối
  bot.on("end", (reason) => {
    console.log(`Bot mất kết nối: ${reason}. Thử lại sau 10s...`);
    if (afkInterval) clearInterval(afkInterval);
    setTimeout(startBot, 10000);
  });

  bot.on("error", (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log(`Kết nối thất bại tới ${err.address}`);
    } else {
      console.log("Lỗi Bot:", err);
    }
  });

  bot.on("kicked", (reason) => {
    console.log("Bot bị kick với lý do:", reason);
  });
}

// Khởi chạy
startBot();

// Web Server giữ sống (Dành cho Replit/UptimeRobot)
const app = express();
app.get("/", (req, res) => res.send("Bot Minecraft đang chạy!"));
app.listen(process.env.PORT || 3000, () => console.log("Web server Ready"));
