const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const express = require("express");

let bot = null;
let isLoggedIn = false;

function startBot() {
    console.log("╔════════════════════════════════════╗");
    console.log("║     🔥 VIP BOT ĐANG KHỞI ĐỘNG 🔥    ║");
    console.log("╚════════════════════════════════════╝");

    bot = mineflayer.createBot({
        host: "191.96.231.27",
        port: 10570,
        username: "Its_Dangermario,
        version: "1.20.1",
        auth: "offline",
        hideErrors: false
    });

    // Load pathfinder để di chuyển
    bot.loadPlugin(pathfinder);

    // ========== KHI LOGIN ==========
    bot.on("login", () => {
        console.log("✅ Bot đã login server");
    });

    // ========== KHI SPAWN ==========
    bot.on("spawn", () => {
        console.log("✅ Bot đã vào world");
        
        // ĐĂNG NHẬP / ĐĂNG KÝ
        setTimeout(() => {
            console.log("🔐 Đang đăng nhập...");
            bot.chat("/login thien24092012");
            bot.chat("/register thien24092012 thien24092012");
        }, 2000);
        
        // Kích hoạt tất cả hành vi sau 5 giây
        setTimeout(() => {
            startBehaviors();
        }, 5000);
    });

    // ========== LẮNG NGHE TIN NHẮN TỪ SERVER ==========
    bot.on("message", (message) => {
        const msg = message.toString();
        console.log("📨 Server:", msg);
        
        // Tự động đăng ký / đăng nhập khi server yêu cầu
        if (msg.includes("/register")) {
            console.log("📝 Server yêu cầu đăng ký!");
            bot.chat("/register thien24092012 thien24092012");
        }
        
        if (msg.includes("/login")) {
            console.log("🔐 Server yêu cầu đăng nhập!");
            bot.chat("/login thien24092012");
        }
        
        // Kiểm tra đăng nhập thành công
        if (msg.includes("Logged in") || msg.includes("login successful")) {
            isLoggedIn = true;
            console.log("✅ ĐĂNG NHẬP THÀNH CÔNG!");
        }
    });

    // ========== XỬ LÝ KHI BỊ KICK ==========
    bot.on("kicked", (reason) => {
        console.log("👢 Bot bị kick:", reason);
        isLoggedIn = false;
        setTimeout(() => {
            console.log("🔄 Khởi động lại bot...");
            startBot();
        }, 30000);
    });

    // ========== XỬ LÝ LỖI ==========
    bot.on("error", (err) => {
        console.log("⚠️ Lỗi:", err.message);
    });

    // ========== XỬ LÝ MẤT KẾT NỐI ==========
    bot.on("end", () => {
        console.log("❌ Bot mất kết nối, reconnect sau 30s...");
        isLoggedIn = false;
        setTimeout(() => {
            startBot();
        }, 30000);
    });
}

// ========== TẤT CẢ HÀNH VI CỦA BOT ==========
function startBehaviors() {
    console.log("🎮 Bot bắt đầu hoạt động...");
    
    // Cấu hình movements để di chuyển
    let movements;
    try {
        const mcData = require('minecraft-data')(bot.version);
        movements = new Movements(bot, mcData);
        movements.allowParkour = true;
        movements.allowSprinting = true;
        movements.canDig = false;
        bot.pathfinder.setMovements(movements);
        console.log("✅ Pathfinder đã sẵn sàng!");
    } catch (err) {
        movements = new Movements(bot);
        bot.pathfinder.setMovements(movements);
        console.log("✅ Pathfinder đã sẵn sàng (chế độ cơ bản)!");
    }
    
    // ===== 1. NHẢY LIÊN TỤC (mỗi 2-4 giây) =====
    setInterval(() => {
        if (!bot.entity) return;
        if (Math.random() > 0.5) {
            bot.setControlState("jump", true);
            setTimeout(() => {
                bot.setControlState("jump", false);
            }, 200);
            console.log("🦘 Bot nhảy");
        }
    }, 3000);
    
    // ===== 2. XOAY ĐẦU QUAN SÁT (mỗi 3-6 giây) =====
    setInterval(() => {
        if (!bot.entity) return;
        const yaw = Math.random() * Math.PI * 2;           // Xoay ngang 360°
        const pitch = (Math.random() - 0.5) * Math.PI / 3; // Xoay lên/xuống
        bot.look(yaw, pitch).catch(() => {});
        console.log("👀 Bot xoay đầu quan sát");
    }, 4500);
    
    // ===== 3. DI CHUYỂN NGẪU NHIÊN (mỗi 15-25 giây) =====
    setInterval(async () => {
        if (!bot.entity) return;
        
        const range = Math.random() * 12 + 5; // 5-17 block
        const x = bot.entity.position.x + (Math.random() - 0.5) * range;
        const z = bot.entity.position.z + (Math.random() - 0.5) * range;
        
        console.log(`🚶 Bot đang di chuyển đến (${Math.round(x)}, ${Math.round(z)})`);
        
        const goal = new goals.GoalNear(x, bot.entity.position.y, z, 2);
        bot.pathfinder.setGoal(goal);
        
        // Dừng lại sau 8-12 giây
        setTimeout(() => {
            if (bot.pathfinder) {
                bot.pathfinder.setGoal(null);
                console.log("🚶 Bot dừng lại");
            }
        }, 10000);
        
    }, 20000);
    
    // ===== 4. CHAT RANDOM (mỗi 1-3 phút) =====
    setInterval(() => {
        if (!bot.entity) return;
        
        const messages = [
            "Hello everyone!",
            "Hi guys!",
            "Anyone online?",
            "Good game!",
            "I'm exploring!",
            "Nice server!",
            "Let's play together!",
            "Anyone need help?",
            "This server is awesome!",
            "What's up everyone?",
            "Mining time!",
            "Building something cool!",
            "Who wants to team up?",
            "GG WP!",
            "Have a nice day!"
        ];
        
        const msg = messages[Math.floor(Math.random() * messages.length)];
        bot.chat(msg);
        console.log(`💬 Bot nói: "${msg}"`);
        
    }, 120000); // 2 phút
    
    // ===== 5. PHẢN HỒI KHI ĐƯỢC TAG TÊN =====
    bot.on("chat", (username, message) => {
        if (username === bot.username) return;
        
        // Nếu tin nhắn có tên bot
        if (message.toLowerCase().includes(bot.username.toLowerCase())) {
            const responses = [
                `Yes ${username}?`,
                `Hello ${username}!`,
                `Hi ${username}, how can I help?`,
                `I'm here ${username}!`,
                `What's up ${username}?`
            ];
            const reply = responses[Math.floor(Math.random() * responses.length)];
            setTimeout(() => {
                bot.chat(reply);
                console.log(`💬 Bot trả lời ${username}: "${reply}"`);
            }, 2000);
        }
        
        // Chào khi có người vào
        if (message.includes("joined") || message.includes("đã vào")) {
            setTimeout(() => {
                bot.chat(`Welcome ${username}!`);
                console.log(`💬 Bot chào: Welcome ${username}!`);
            }, 3000);
        }
    });
    
    // ===== 6. GIỮ KẾT NỐI (tránh timeout) =====
    setInterval(() => {
        if (bot.entity) {
            // Gửi ping giữ kết nối
            bot.chat("/ping").catch(() => {});
        }
    }, 60000);
    
    // ===== 7. KIỂM TRA VÀ TỰ ĐỘNG LOGIN NẾU CHƯA =====
    setInterval(() => {
        if (!isLoggedIn && bot.entity) {
            console.log("⚠️ Chưa đăng nhập, thử lại...");
            bot.chat("/login thien24092012");
            bot.chat("/register thien24092012 thien24092012");
        }
    }, 15000);
    
    console.log("✅ Tất cả hành vi đã được kích hoạt!");
}

// ========== WEB SERVER CHO UPTIMEROBOT ==========
const app = express();

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>VIP Bot Online</title>
            <style>
                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                }
                h1 { font-size: 48px; }
                .status { font-size: 24px; margin-top: 20px; }
                .online { color: #00ff00; }
            </style>
        </head>
        <body>
            <h1>🤖 VIP BOT ONLINE</h1>
            <div class="status">Status: <span class="online">🟢 ONLINE</span></div>
            <div>Bot đang hoạt động 24/7!</div>
        </body>
        </html>
    `);
});

app.get("/status", (req, res) => {
    res.json({
        status: "online",
        bot: bot ? "running" : "stopped",
        uptime: process.uptime(),
        isLoggedIn: isLoggedIn
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Web server chạy trên port ${PORT}`);
});

// ========== KHỞI ĐỘNG BOT ==========
startBot();

console.log("╔════════════════════════════════════════════╗");
console.log("║     🚀 VIP BOT ĐÃ SẴN SÀNG HOẠT ĐỘNG 🚀    ║");
console.log("╚════════════════════════════════════════════╝");
