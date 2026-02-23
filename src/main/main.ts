/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// ── extract-xiso handlers ──────────────────────────────────────────────────

function getXisoExePath(): string {
  const { platform, arch } = process;

  // Matches the folder layout in assets/extract-xiso/:
  //   win/x32/extract-xiso.exe
  //   win/x64/extract-xiso.exe
  //   mac/arm64/extract-xiso
  //   mac/x64/extract-xiso (maybe a universal binary in the future? idk)
  //   linux/extract-xiso
  let relativePath: string;
  if (platform === 'win32') {
    relativePath =
      arch === 'ia32'
        ? path.join('win', 'x32', 'extract-xiso.exe')
        : path.join('win', 'x64', 'extract-xiso.exe');
  } else if (platform === 'darwin') {
    console.log('Running on macOS', arch);
    relativePath =
      arch === 'arm64'
        ? path.join('mac', 'arm64', 'extract-xiso')
        : path.join('mac', 'x64', 'extract-xiso');
  } else {
    relativePath = path.join('linux', 'extract-xiso');
  }

  const base = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'extract-xiso')
    : path.join(__dirname, '../../assets/extract-xiso');

  return path.join(base, relativePath);
}

let jobCounter = 0;

ipcMain.handle('xiso:pick-file', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select ISO file(s)',
    filters: [{ name: 'Xbox ISO', extensions: ['iso'] }],
    properties: ['openFile', 'multiSelections'],
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('xiso:pick-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select destination folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle(
  'xiso:convert',
  (event, filePath: string, destination: string) => {
    jobCounter += 1;
    const jobId = `job-${jobCounter}-${Date.now()}`;
    const exePath = getXisoExePath();
    const outputDir = destination || path.dirname(filePath);

    // Ensure the binary is executable on macOS / Linux
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(exePath, 0o755);
      } catch {
        // ignore — binary may already have the right permissions
      }
    }

    const proc = spawn(exePath, ['-x', filePath], {
      cwd: outputDir,
    });

    proc.stdout.on('data', (data: Buffer) => {
      event.sender.send('xiso:progress', jobId, data.toString());
    });

    proc.stderr.on('data', (data: Buffer) => {
      event.sender.send('xiso:progress', jobId, data.toString());
    });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        event.sender.send('xiso:complete', jobId);
      } else {
        event.sender.send(
          'xiso:error',
          jobId,
          `Processo encerrado com código ${code}`,
        );
      }
    });

    proc.on('error', (err: Error) => {
      event.sender.send('xiso:error', jobId, err.message);
    });

    return jobId;
  },
);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  Menu.setApplicationMenu(null);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
