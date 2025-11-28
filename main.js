const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fixPath = require('fix-path');
const portfinder = require('portfinder');
const waitOn = require('wait-on');
const fs = require('fs');

// Fix path for GUI apps on macOS
fixPath();

let mainWindow;
let n8nProcess;
let serverUrl;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false // Don't show until ready or loading
  });

  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

async function startN8n() {
  try {
    // 1. Find a free port
    const port = await portfinder.getPortPromise({ port: 5678 });
    serverUrl = `http://localhost:${port}`;
    
    // 2. Determine n8n executable path
    // In dev (monorepo): ../packages/cli/bin/n8n
    // In prod: resources/app/packages/cli/bin/n8n (we need to bundle it)
    
    let n8nPath;
    const isDev = !app.isPackaged;
    
    if (isDev) {
      n8nPath = path.resolve(__dirname, '../packages/cli/bin/n8n');
    } else {
      // In production, we use the bundled backend in resources/flexai-backend
      n8nPath = path.join(process.resourcesPath, 'flexai-backend/packages/cli/bin/n8n');
    }

    if (!fs.existsSync(n8nPath)) {
      throw new Error(`Could not find n8n executable at: ${n8nPath}`);
    }

    // 3. Set up Environment Variables
    const userDataPath = path.join(app.getPath('userData'), 'flexai-data');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    const env = {
      ...process.env,
      N8N_PORT: port,
      N8N_USER_FOLDER: userDataPath,
      // Force SQLite
      DB_TYPE: 'sqlite',
      // Disable some checks
      N8N_SKIP_STABILITY_CHECK: 'true',
      // Ensure we don't need .env file
      N8N_ENCRYPTION_KEY: process.env.N8N_ENCRYPTION_KEY || 'flexai-desktop-insecure-key-change-me', 
      // Add other defaults here
    };

    mainWindow.webContents.send('log', `Starting FlexAI on port ${port}...`);
    mainWindow.webContents.send('log', `Data directory: ${userDataPath}`);

    // 4. Spawn the process
    n8nProcess = spawn(process.execPath, [n8nPath, 'start'], {
      env,
      cwd: path.dirname(n8nPath) // Run from the bin dir or package dir
    });

    n8nProcess.stdout.on('data', (data) => {
      const str = data.toString();
      console.log('[n8n]', str);
      mainWindow.webContents.send('log', str);
      
      // Check for "Editor is now accessible via"
      if (str.includes('Editor is now accessible via')) {
        loadApp();
      }
    });

    n8nProcess.stderr.on('data', (data) => {
      console.error('[n8n err]', data.toString());
      mainWindow.webContents.send('log', `Error: ${data.toString()}`);
    });

    n8nProcess.on('close', (code) => {
      console.log(`n8n process exited with code ${code}`);
      mainWindow.webContents.send('log', `FlexAI stopped (code ${code})`);
    });

    // 5. Wait for port to be reachable (fallback if stdout parsing fails)
    try {
      await waitOn({ resources: [serverUrl], timeout: 60000 });
      loadApp();
    } catch (err) {
      console.error('Timed out waiting for n8n', err);
    }

  } catch (error) {
    console.error('Failed to start n8n:', error);
    mainWindow.webContents.send('log', `Fatal Error: ${error.message}`);
  }
}

function loadApp() {
  if (mainWindow) {
    mainWindow.loadURL(serverUrl);
  }
}

app.whenReady().then(() => {
  createWindow();
  startN8n();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (n8nProcess) {
    n8nProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (n8nProcess) {
    n8nProcess.kill();
  }
});
