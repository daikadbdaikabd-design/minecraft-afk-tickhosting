const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Web server giữ bot chạy 24/7 trên Render
http.createServer((req, res) => {
    res.write('VIP Bot is running!');
    res.end();
}).listen(10000);

// CẤU HÌNH SERVER
const config = {
    host: "191.96.231.27",
    port: 10570,
    version: "1.21.1",
    password: "VIPMaster2024"  // MẬT KHẨU MỚI
};

// TÊN BOT MỚI - VIP PRO
const botName = "VIP_Pro_Master";

console.log('╔════════════════════════════════════╗');
console.log('║     🔥 VIP BOT ĐANG KHỞI ĐỘNG 🔥    ║');
console.log('╚════════════════════════════════════╝');
console.log(`📡 Server: ${config.host}:${config.port}`);
console.log(`🤖 Tên bot: ${botName}`);
console.log(`🔐 Mật khẩu: ${config.password}`);

// TẠO BOT
const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: botName,
    version: config.version,
    auth: 'offline',
    hideErrors: false,  // Bật để xem lỗi nếu có
    connectTimeout: 60000
});

// Load pathfinder để di chuyển
bot.loadPlugin(pathfinder);

let movements = null;

// ========== KHI BOT VÀO SERVER ==========
bot.once('spawn', () => {
    console.log('✅ Bot đã vào server thành công!');
    
    // ĐĂNG NHẬP (sửa lỗi cú pháp)
    setTimeout(() => {
        console.log('🔐 Đang đăng nhập...');
        bot.chat(`/login ${config.password}`);
    }, 2000);
    
    // ĐĂNG KÝ (nếu cần)
    setTimeout(() => {
        console.log('🔐 Đang đăng ký (nếu cần)...');
        bot.chat(`/register ${config.password} ${config.password}`);
    }, 3000);
    
    // KÍCH HOẠT CÁC HÀNH VI SAU KHI ĐĂNG NHẬP XONG
    setTimeout(() => {
        startBehaviors();
    }, 6000);
});

// ========== CẤU HÌNH MOVEMENTS ==========
function initMovements() {
    try {
        const mcData = require('minecraft-data')(bot.version);
        movements = new Movements(bot, mcData);
        movements.allowParkour = true;
        movements.allowSprinting = true;
        movements.canDig = false;
        movements.maxDropDown = 3;
        bot.pathfinder.setMovements(movements);
        console.log('✅ Pathfinder đã sẵn sàng!');
    } catch (err) {
        console.log('⚠️ Không load được minecraft-data, dùng movements cơ bản');
        movements = new Movements(bot);
        bot.pathfinder.setMovements(movements);
    }
}

// ========== CÁC HÀNH VI CỦA BOT ==========
function startBehaviors() {
    console.log('🎮 Bot VIP bắt đầu hoạt động...');
    
    // Khởi tạo movements
    initMovements();
    
    // 1. NHẢY NGẪU NHIÊN (mỗi 2-5 giây)
    setInterval(() => {
        if (!bot.entity) return;
        if (Math.random() > 0.6) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 150);
            console.log('🦘 Bot nhảy');
        }
    }, 3000);
    
    // 2. XOAY ĐẦU QUAN SÁT (mỗi 3-8 giây)
    setInterval(() => {
        if (!bot.entity) return;
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI / 3;
        bot.look(yaw, pitch).catch(() => {});
        console.log('👀 Bot xoay đầu quan sát');
    }, 5000);
    
    // 3. DI CHUYỂN NGẪU NHIÊN (mỗi 15-25 giây)
    setInterval(async () => {
        if (!bot.entity || !movements) return;
        
        try {
            const range = Math.random() * 10 + 5;
            const x = bot.entity.position.x + (Math.random() - 0.5) * range;
            const z = bot.entity.position.z + (Math.random() - 0.5) * range;
            
            console.log(`🚶 Bot đang di chuyển đến (${Math.round(x)}, ${Math.round(z)})`);
            
            const goal = new goals.GoalNear(x, bot.entity.position.y, z, 2);
            bot.pathfinder.setGoal(goal);
            
            // Dừng lại sau 8-12 giây
            setTimeout(() => {
                if (bot.pathfinder) {
                    bot.pathfinder.setGoal(null);
                    console.log('🚶 Bot dừng lại');
                }
            }, 10000);
            
        } catch (err) {
            console.log(`⚠️ Lỗi di chuyển: ${err.message}`);
        }
        
    }, 20000);
    
    // 4. CHAT NGẪU NHIÊN (mỗi 2-4 phút)
    setInterval(() => {
        if (!bot.entity) return;
        const messages = [
            "Anh Thiện HT1 Crystal PvP!",
            "Hi guys! Anyone need help?",
            "Can you give me itens pls",
            "Let's play together!",
            "I'm a VIP player!",
            "Good game everyone!",
            "Anyone want to team up?",
            "Nice server you have here!"
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        bot.chat(msg);
        console.log(`💬 Bot chat: "${msg}"`);
    }, 180000);
    
    // 5. GIỮ KẾT NỐI (tránh bị timeout)
    setInterval(() => {
        if (bot.entity) {
            // Gửi ping giữ kết nối
            bot.chat('/ping').catch(() => {});
        }
    }, 60000);
}

// ========== XỬ LÝ KHI BỊ DISCONNECT ==========
bot.on('end', (reason) => {
    console.log(`❌ Bot thoát: ${reason}`);
    console.log('🔄 Thử kết nối lại sau 30 giây...');
    
    setTimeout(() => {
        console.log('🚀 Khởi động lại bot VIP...');
        process.exit(1);
    }, 30000);
});

// ========== XỬ LÝ LỖI ==========
bot.on('error', (err) => {
    console.log(`⚠️ Lỗi: ${err.code || err.message}`);
});

bot.on('kicked', (reason) => {
    console.log(`👢 Bot bị kick: ${reason}`);
    setTimeout(() => process.exit(1), 60000);
});

// ========== LOG KHI BOT CHAT ==========
bot.on('chat', (username, message) => {
    if (username !== bot.username) {
        console.log(`💬 ${username}: ${message}`);
        
        // Phản hồi khi được tag
        if (message.toLowerCase().includes(bot.username.toLowerCase())) {
            setTimeout(() => {
                bot.chat(`Yes ${username}? I'm here!`);
            }, 2000);
        }
    }
});

console.log('✅ VIP Bot đã sẵn sàng và chờ lệnh!');
