const {
  app,
  ipcMain,
  BrowserWindow,
  nativeImage,
  Menu,
  Tray,
  globalShortcut,
} = require('electron');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const cp = require('child_process');
const path = require('path');
const { name } = require('../package.json');

let mainWindow;

const dimensions = {
  app: { width: 1200, height: 720 },
};

function createWindow() {
  if (!tray) {
    createTray();
  }

  mainWindow = new BrowserWindow({
    width: dimensions.app.width,
    height: dimensions.app.height,
    minWidth: dimensions.app.width,
    minHeight: dimensions.app.height,
    show: false,
    frame: true,
    title: 'Video Streaming Server',
    backgroundColor: '#020202',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    icon: path.resolve('../packages/frontend/public/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      webgl: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:5709`);
  } else {
    const filePath = `file://${path.join(__dirname, '../packages/frontend/dist/index.html')}`;
    mainWindow.loadURL(filePath);
  }

  mainWindow.webContents.setZoomFactor(1);

  mainWindow.on('closed', () => (mainWindow = null));
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('blur', () => mainWindow?.webContents.send('window-blur'));
  mainWindow.on('focus', () => mainWindow?.webContents.send('window-focus'));
  mainWindow.on('maximize', () => mainWindow?.webContents.send('window-maximized'));
  mainWindow.on('minimize', () => mainWindow?.webContents.send('window-minimized'));
  mainWindow.on('unmaximize', () => mainWindow?.webContents.send('window-unmaximized'));

  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.on('render-process-gone', function (event, detailed) {
    if (detailed.reason === 'crashed') {
      log.error('render process crashed');
    }
  });
}

app.whenReady().then(() => {
  if (isDev) {
    const {
      default: installExtension,
      REDUX_DEVTOOLS,
      REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer');
    installExtension(REDUX_DEVTOOLS)
      .then((name) => log.info(`Added Extension:  ${name}`))
      .catch((err) => log.info('An error occurred: ', err));
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => log.info(`Added Extension:  ${name}`))
      .catch((err) => log.info('An error occurred: ', err));
  }
});

app.on('window-all-closed', () => {
  app.hide();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('close-app', () => {
  app.hide();
});

ipcMain.on('maximize', () => {
  BrowserWindow.getFocusedWindow()?.maximize();
});

ipcMain.on('unmaximize', () => {
  BrowserWindow.getFocusedWindow()?.unmaximize();
});

ipcMain.on('minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on('isMaximized', (event) => {
  event.returnValue = BrowserWindow.getFocusedWindow()?.isMaximized();
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    log.info('App starting');

    if (!isDev) {
      startBackend();
    }

    if (!isDev) {
      globalShortcut.register('Control+Shift+I', () => {
        return false;
      });

      globalShortcut.register('Control+R', () => {
        return false;
      });
    }

    createWindow();
  });
}

const processes = [];

function startBackend() {
  try {
    log.info('Backend starting');
    const appName = app.getPath('exe');

    const expressPath = path.join('./resources/app.asar', './packages/backend/dist/index.js');

    const dataPath = path.join(appDataPath(), name);

    log.info('App Name', appName);
    log.info('Express Path', expressPath);
    const expressAppProcess = cp.spawn(appName, [expressPath], {
      env: {
        NODE_ENV: 'production',
        ELECTRON_RUN_AS_NODE: '1',
        RESOURCE_PATH_IN_ELECTRON: dataPath,
      },
    });

    redirectOutput(expressAppProcess.stdout);
    redirectOutput(expressAppProcess.stderr);

    processes.push(expressAppProcess);

    expressAppProcess.on('uncaughtException', function (err) {
      log.error('Error running express app', err);
    });

    expressAppProcess.on('error', (error) => {
      log.error('Backend error', error);
    });

    expressAppProcess.on('exit', (code) => {
      log.info('Exit Server', code);
      process.exit();
    });
  } catch (error) {
    log.error('Server error', error);
  }
}

async function exitBackend(callback) {
  log.info('Exit Backend');

  processes.forEach(function (proc) {
    proc.kill();
  });
  callback();
}

function appDataPath() {
  return (
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share')
  );
}

function redirectOutput(x) {
  x.on('data', function (data) {
    data
      .toString()
      .split('\n')
      .forEach((line) => {
        if (line !== '') {
          // REGEX to Remove all ANSI colors/styles from strings
          let serverLogEntry = line.replace(
            /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
            '',
          );
          if (mainWindow) {
            mainWindow.webContents.send('server-log-entry', serverLogEntry);
          }
          log.info(serverLogEntry);
        }
      });
  });
}

let tray = null;
function createTray() {
  const icon = path.join(__dirname, '../packages/frontend/dist/logo.png');
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Server',
      click: () => {
        createWindow();
      },
    },
    {
      label: 'Quit',
      click: () => {
        exitBackend(() => {
          app.quit();
        });
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}
