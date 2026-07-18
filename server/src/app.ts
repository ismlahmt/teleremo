import express from 'express';
import cors from 'cors';
import { keyboard, Key } from '@nut-tree-fork/nut-js';
import os from 'os';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Her başlangıçta 4 haneli rastgele bir PIN oluştur
const CURRENT_PIN = Math.floor(1000 + Math.random() * 9000).toString();

// Kimlik doğrulama (Authentication) Middleware'i
const requirePin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const providedPin = req.headers['x-auth-pin'];
    if (providedPin !== CURRENT_PIN) {
        return res.status(401).json({ success: false, message: 'Hatalı PIN Kodu!' });
    }
    next();
};

// ==========================================
// AĞ TARAMASI (DISCOVERY)
// ==========================================
app.get('/api/discovery', (req, res) => {
    // Tarama yapan telefona PC'nin adını ve IP'sini gönderir
    res.json({
        hostname: os.hostname(),
        ip: getLocalIp(),
        requiresAuth: true
    });
});

// Güvenlik duvarını sadece medya ve sistem komutlarına uygula
app.use('/api/media', requirePin);
app.use('/api/system', requirePin);

// PIN Doğrulama endpoint'i (sadece test amaçlı)
app.post('/api/verify_pin', requirePin, (req, res) => {
    res.json({ success: true });
});

// Yardımcı fonksiyon: Tuşa basma işlemini güvenli hale getirir
const pressKey = async (key: Key) => {
    try {
        await keyboard.type(key);
    } catch (e) {
        console.error(`Tuşa basılırken hata oluştu (${key}):`, e);
    }
};

// ==========================================
// SEKME 1: MEDYA (Uygulamaya Özel Kontroller)
// ==========================================

app.post('/api/media/play_pause', async (req, res) => {
    await pressKey(Key.Space);
    res.send({ success: true, message: 'Play/Pause tetiklendi (Space)' });
});

app.post('/api/media/forward', async (req, res) => {
    // Çoğu oynatıcıda (YouTube vb.) 5 veya 10 saniye atlar
    await pressKey(Key.Right);
    res.send({ success: true, message: 'İleri sarıldı (Right)' });
});

app.post('/api/media/backward', async (req, res) => {
    await pressKey(Key.Left);
    res.send({ success: true, message: 'Geri sarıldı (Left)' });
});

app.post('/api/media/next', async (req, res) => {
    // Sonraki bölüm/video
    await pressKey(Key.AudioNext);
    res.send({ success: true, message: 'Sonraki bölüme geçildi (AudioNext)' });
});

app.post('/api/media/prev', async (req, res) => {
    // Önceki bölüm/video
    await pressKey(Key.AudioPrev);
    res.send({ success: true, message: 'Önceki bölüme geçildi (AudioPrev)' });
});

app.post('/api/media/vol_up', async (req, res) => {
    // Uygulama içi ses açma (Yukarı Ok)
    await pressKey(Key.Up);
    res.send({ success: true, message: 'Uygulama sesi açıldı (Up)' });
});

app.post('/api/media/vol_down', async (req, res) => {
    // Uygulama içi ses kısma (Aşağı Ok)
    await pressKey(Key.Down);
    res.send({ success: true, message: 'Uygulama sesi kısıldı (Down)' });
});

app.post('/api/media/mute', async (req, res) => {
    // Uygulama içi sessize alma
    await pressKey(Key.M);
    res.send({ success: true, message: 'Uygulama susturuldu (M)' });
});

// ==========================================
// SEKME 2: BİLGİSAYARIM (Sistem Kontrolleri)
// ==========================================

app.post('/api/system/vol_up', async (req, res) => {
    await pressKey(Key.AudioVolUp);
    res.send({ success: true, message: 'Sistem sesi açıldı (AudioVolUp)' });
});

app.post('/api/system/vol_down', async (req, res) => {
    await pressKey(Key.AudioVolDown);
    res.send({ success: true, message: 'Sistem sesi kısıldı (AudioVolDown)' });
});

app.post('/api/system/mute', async (req, res) => {
    await pressKey(Key.AudioMute);
    res.send({ success: true, message: 'Sistem susturuldu (AudioMute)' });
});

// PC'nin yerel ağ IP adresini bulan yardımcı fonksiyon
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

app.listen(port, '0.0.0.0', () => {
    console.log(`\n===========================================`);
    console.log(`🚀 Teleremo PC Sunucusu Çalışıyor!`);
    console.log(`📱 Telefonunuzdaki uygulamaya şu IP adresini girin:`);
    console.log(`   --> ${getLocalIp()} <--`);
    console.log(`\n🔒 GÜVENLİK KODU (PIN): ${CURRENT_PIN}`);
    console.log(`   Bu şifreyi telefonunuzdaki uygulamaya girin.`);
    console.log(`===========================================\n`);
});
