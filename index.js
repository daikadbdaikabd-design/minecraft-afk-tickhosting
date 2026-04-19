const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const http = require('http');

// Web server giữ bot chạy 24/7 trên Render
http.createServer((req, res) => {
    res.write('Bot is running!');
    res.end();
}).listen(10000);

// CẤU HÌNH
const config = {
    host: "191.96.231.27",
    port: 10570,
    version: "1.21.1",
    password: "ThienDepZai2409"  // Thay bằng mật khẩu của bạn
};

// Tên bot cố định
const botName = "ProPlayerBot";

console.log('🚀 Bot đang khởi động...');
console.log(`📡 Server: ${config.host}:${config.port}`);
console.log(`🤖 Tên bot: ${botName}`);

// TẠO BOT
const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: botName,
    version: config.version,
    auth: 'offline',
    hideErrors: true
});

// Load pathfinder để di chuyển
bot.loadPlugin(pathfinder);

// ========== KHI BOT VÀO SERVER ==========
bot.once('spawn', () => {
    console.log('✅ Bot đã vào server thành công!');
    
    // ĐĂNG NHẬP / ĐĂNG KÝ
    setTimeout(() => {
        console.log('🔐 Đang đăng ký / đăng nhập...');
        bot.chat(`/register ThienDepZai2409 ThienDepZai2409}`);
        
        setTimeout(() => {
            bot.chat(`/login ThienDepZai2409 `);
            console.log('✅ Đã đăng nhập thành công!');
        }, 1000);
    }, 2000);
    
    // KÍCH HOẠT CÁC HÀNH VI SAU KHI ĐĂNG NHẬP XONG
    setTimeout(() => {
        startBehaviors();
    }, 5000);
});

// ========== CÁC HÀNH VI CỦA BOT ==========
function startBehaviors() {
    console.log('🎮 Bot bắt đầu hoạt động...');
    
    // 1. NHẢY NGẪU NHIÊN (mỗi 2-5 giây)
    setInterval(() => {
        if (!bot.entity) return;
        if (Math.random() > 0.6) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 100);
            console.log('🦘 Bot nhảy');
        }
    }, 3000);
    
    // 2. XOAY ĐẦU QUAN SÁT (mỗi 3-8 giây)
    setInterval(() => {
        if (!bot.entity) return;
        const yaw = Math.random() * Math.PI * 2;           // Xoay ngang 360 độ
        const pitch = (Math.random() - 0.5) * Math.PI / 3; // Xoay lên xuống
        bot.look(yaw, pitch);
        console.log('👀 Bot xoay đầu quan sát');
    }, 5000);
    
    // 3. DI CHUYỂN NGẪU NHIÊN (mỗi 10-20 giây)
    setInterval(async () => {
        if (!bot.entity) return;
        
        // Di chuyển đến vị trí ngẫu nhiên cách vị trí hiện tại 5-15 block
        const range = Math.random() * 10 + 5;
        const x = bot.entity.position.x + (Math.random() - 0.5) * range;
        const z = bot.entity.position.z + (Math.random() - 0.5) * range;
        
        const movements = new Movements(bot);
        movements.allowParkour = true;
        bot.pathfinder.setMovements(movements);
        bot.pathfinder.setGoal(new goals.GoalNear(x, bot.entity.position.y, z, 1));
        
        console.log(`🚶 Bot đang di chuyển đến (${Math.round(x)}, ${Math.round(z)})`);
        
        // Dừng lại sau 5-10 giây
        setTimeout(() => {
            if (bot.pathfinder) {
                bot.pathfinder.setGoal(null);
                console.log('🚶 Bot dừng lại');
            }
        }, 8000);
        
    }, 15000);
    
    // 4. THỈNH THOẢNG CHAT (mỗi 1-3 phút)
    setInterval(() => {
        if (!bot.entity) return;
        const messages = [
            "Hello everyone!",
            "Hi guys!",
            "Anyone online?",
            "Good game!",
            "I'm exploring!",
            "Nice server!"
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        bot.chat(msg);
        console.log(`💬 Bot chat: "${msg}"`);
    }, 120000);
}

// ========== XỬ LÝ KHI BỊ DISCONNECT ==========
bot.on('end', (reason) => {
    console.log(`❌ Bot thoát: ${reason}`);
    console.log('🔄 Thử kết nối lại sau 30 giây...');
    
    setTimeout(() => {
        console.log('🚀 Khởi động lại bot...');
        process.exit(1); // Render sẽ tự động restart
    }, 30000);
});

// ========== XỬ LÝ LỖI ==========
bot.on('error', (err) => {
    console.log(`⚠️ Lỗi: ${err.code || err.message}`);
});

bot.on('kicked', (reason) => {
    console.log(`👢 Bot bị kick: ${reason}`);
    setTimeout(() => process.exit(1), 30000);
});

console.log('✅ Bot đã sẵn sàng!');
