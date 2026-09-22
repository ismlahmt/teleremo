const { app, BrowserWindow, globalShortcut, Tray, Menu } = require('electron');
const path = require('path');
const express = require('express');
const { autoUpdater } = require('electron-updater');
const cors = require('cors');
const { keyboard, Key } = require('@nut-tree-fork/nut-js');
const os = require('os');

const server = express();
const port = 3000;

server.use(cors());
server.use(express.json());

let CURRENT_PIN = '';
let PREVIOUS_PIN = '';
let pinExpiresAt = 0;

function generatePin() {
    PREVIOUS_PIN = CURRENT_PIN;
    CURRENT_PIN = Math.floor(1000 + Math.random() * 9000).toString();
    pinExpiresAt = Date.now() + 15000;
}

generatePin();

setInterval(() => {
    if (Date.now() >= pinExpiresAt) {
        generatePin();
    }
}, 500);

server.get('/api/pin', (req, res) => {
    res.json({
        pin: CURRENT_PIN,
        timeRemaining: Math.max(0, pinExpiresAt - Date.now())
    });
});

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

server.get('/api/discovery', (req, res) => {
    res.json({
        hostname: os.hostname(),
        ip: getLocalIp(),
        requiresAuth: true
    });
});

const VALID_TOKENS = [];

const requirePin = (req, res, next) => {
    const providedToken = req.headers['x-auth-token'];
    if (providedToken && VALID_TOKENS.includes(providedToken)) {
        return next();
    }

    const providedPin = req.headers['x-auth-pin'];
    if (providedPin === CURRENT_PIN || providedPin === PREVIOUS_PIN) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Yetkisiz erişim!' });
};

server.post('/api/verify_pin', (req, res) => {
    const providedPin = req.headers['x-auth-pin'];
    if (providedPin === CURRENT_PIN || providedPin === PREVIOUS_PIN) {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        VALID_TOKENS.push(token);
        return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, message: 'Hatalı PIN Kodu!' });
});

server.use('/api/media', requirePin);
server.use('/api/system', requirePin);

const pressKey = async (key) => {
    try { await keyboard.type(key); } catch (e) { console.error(e); }
};

const pressKeyCombination = async (modifiers, key) => {
    try {
        await keyboard.pressKey(...modifiers);
        await keyboard.type(key);
        await keyboard.releaseKey(...modifiers);
    } catch (e) { console.error(e); }
};

server.post('/api/media/play_pause', async (req, res) => {
    await pressKey(Key.Space);
    res.send({ success: true });
});

server.post('/api/media/forward', async (req, res) => {
    await pressKey(Key.Right);
    res.send({ success: true });
});

server.post('/api/media/backward', async (req, res) => {
    await pressKey(Key.Left);
    res.send({ success: true });
});

server.post('/api/media/next', async (req, res) => {
    await pressKeyCombination([Key.LeftShift], Key.N);
    res.send({ success: true, message: 'Shift+N' });
});

server.post('/api/media/prev', async (req, res) => {
    await pressKeyCombination([Key.LeftShift], Key.P);
    res.send({ success: true, message: 'Shift+P' });
});

server.post('/api/media/vol_up', async (req, res) => {
    await pressKey(Key.Up);
    res.send({ success: true });
});

server.post('/api/media/vol_down', async (req, res) => {
    await pressKey(Key.Down);
    res.send({ success: true });
});

server.post('/api/media/mute', async (req, res) => {
    await pressKey(Key.M);
    res.send({ success: true });
});

server.post('/api/system/vol_up', async (req, res) => {
    await pressKey(Key.AudioVolUp);
    res.send({ success: true });
});

server.post('/api/system/vol_down', async (req, res) => {
    await pressKey(Key.AudioVolDown);
    res.send({ success: true });
});

server.post('/api/system/mute', async (req, res) => {
    await pressKey(Key.AudioMute);
    res.send({ success: true });
});

let altTabTimeout = null;

server.post('/api/system/alt_tab', async (req, res) => {
    try {
        if (!altTabTimeout) {
            await keyboard.pressKey(Key.LeftAlt);
        } else {
            clearTimeout(altTabTimeout);
        }

        await keyboard.type(Key.Tab);

        altTabTimeout = setTimeout(async () => {
            await keyboard.releaseKey(Key.LeftAlt);
            altTabTimeout = null;
        }, 1500);

        res.send({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).send({ success: false });
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Express server running on port ${port}`);
});

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 500,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');

    win.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            win.hide();
        }
    });

    return win;
}

let tray = null;
let mainWindow = null;

function createOrFocusWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
        return;
    }
    mainWindow = createWindow();
}

app.whenReady().then(() => {
    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'icon.png')
        : path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Teleremo Sunucusu Çalışıyor', enabled: false },
        { type: 'separator' },
        { label: 'Aç', click: () => createOrFocusWindow() },
        { type: 'separator' },
        { label: 'Güncellemeleri Denetle', click: () => {
            try { autoUpdater.checkForUpdatesAndNotify(); } catch(e) { console.error(e); }
        }},
        { label: 'Kapat', click: () => {
            app.isQuitting = true;
            app.quit();
        }}
    ]);
    tray.setToolTip('Teleremo');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => createOrFocusWindow());

    try {
        autoUpdater.checkForUpdatesAndNotify();
    } catch(e) {
        console.error(e);
    }

    autoUpdater.on('error', (err) => {
        console.error(err);
    });

    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall();
    });

    mainWindow = createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWindow = createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && app.isQuitting) {
        app.quit();
    }
});
