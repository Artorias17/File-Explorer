import { app, BrowserWindow, screen, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { addIpcHandlers } from './ipc-handlers';

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    width: size.width * 0.75,
    height: size.height * 0.75,
    show: false,
    webPreferences: {
      preload: path.normalize(path.join(__dirname, '../preload/preload.js')),
      nodeIntegration: false,
      allowRunningInsecureContent: false,
      contextIsolation: true, // false if you want to run e2e test with Spectron
      devTools: serve, // remove devtools from production builds
    },
  });

  // remove defualt menu
  // TODO: Add new menu items
  Menu.setApplicationMenu(null);

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    // Path when running electron executable
    let pathIndex = path.normalize(
      path.join(__dirname, '../../dist/renderer/index.html')
    );

    if (
      fs.existsSync(
        path.normalize(path.join(__dirname, '../../../dist/index.html'))
      )
    ) {
      // Path when running electron in local folder
      pathIndex = path.normalize(
        path.join(__dirname, '../../../dist/index.html')
      );
    }

    win.loadFile(pathIndex);
  }

  win.once('ready-to-show', () => {
    if (win) {
      const winSize = win.getSize();
      win.setContentSize(winSize[0], winSize[1]);
      win.show();
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 500 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.whenReady().then(() => {
    console.log('Starting Electron...');
    console.log('Electron version: ', process.versions.electron);
    console.log('Node version: ', process.versions.node);
    console.log('Chrome version: ', process.versions.chrome);

    addIpcHandlers();
    setTimeout(createWindow, 500);
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
