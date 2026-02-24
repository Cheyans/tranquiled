const { app, BrowserWindow, globalShortcut, screen } = require('electron');

const useAllDisplays = false;
let windows = []; // Array to keep track of all windows

function createWindow(display) {
    const { width, height, x, y } = display.bounds;

    const targetX = x + width - 15;
    const targetY = y;

    let win = new BrowserWindow({
        show: false,
        width: 15,
        height: 15,
        x: targetX,
        y: targetY,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        hasShadow: false,
        enableLargerThanScreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    win.setAlwaysOnTop(true, 'screen-saver');
    win.loadFile('index.html');
    win.webContents.once('did-finish-load', () => {
        win.setBounds({ x: targetX, y: targetY, width: 15, height: 15 });
        win.showInactive();
    });
    windows.push(win);
}

app.whenReady().then(() => {
    if (useAllDisplays) {
        const displays = screen.getAllDisplays();
        displays.forEach(display => createWindow(display));
    } else {
        createWindow(screen.getPrimaryDisplay());
    }

    globalShortcut.register('Ctrl+Shift+L', () => {
        windows.forEach(win => {
            win.webContents.send('toggle-led');
        });
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (useAllDisplays) {
                const displays = screen.getAllDisplays();
                displays.forEach(display => createWindow(display));
            } else {
                createWindow(screen.getPrimaryDisplay());
            }
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
