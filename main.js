const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Docker = require('dockerode');
const { exec } = require('child_process');
const fixPath = require('fix-path');

// Fix path for GUI apps on macOS
fixPath();

let mainWindow;
let docker;

// Initialize Docker connection
// On Windows: //./pipe/docker_engine
// On Linux/Mac: /var/run/docker.sock
try {
  docker = new Docker();
} catch (e) {
  console.error('Failed to initialize Dockerode', e);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple prototype, usually use preload script
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers

ipcMain.handle('check-docker', async () => {
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ installed: false, running: false, message: 'Docker is not installed or not in PATH.' });
      } else {
        // Check if daemon is running by trying to list containers
        docker.listContainers((err, containers) => {
          if (err) {
            resolve({ installed: true, running: false, message: 'Docker is installed but not running.' });
          } else {
            resolve({ installed: true, running: true, message: 'Docker is ready.' });
          }
        });
      }
    });
  });
});

ipcMain.handle('check-flexai-status', async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    const container = containers.find(c => c.Names.includes('/flexai'));
    if (!container) return { status: 'not-installed' };
    return { status: container.State }; // 'running', 'exited', etc.
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

ipcMain.handle('install-flexai', async (event) => {
  try {
    mainWindow.webContents.send('log', 'Pulling FlexAI image...');
    await new Promise((resolve, reject) => {
      docker.pull('diegogzt/flexai:latest', (err, stream) => { // Assuming image name
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          if (err) return reject(err);
          resolve(output);
        }

        function onProgress(event) {
          if (event.status) {
            mainWindow.webContents.send('log', event.status);
          }
        }
      });
    });
    
    mainWindow.webContents.send('log', 'Creating container...');
    // Create container
    // Equivalent to: docker run -d --name flexai -p 5678:5678 -v flexai_data:/home/node/.n8n diegogzt/flexai:latest
    const container = await docker.createContainer({
      Image: 'diegogzt/flexai:latest',
      name: 'flexai',
      ExposedPorts: { '5678/tcp': {} },
      HostConfig: {
        PortBindings: { '5678/tcp': [{ HostPort: '5678' }] },
        Binds: ['flexai_data:/home/node/.n8n'],
        RestartPolicy: { Name: 'unless-stopped' }
      }
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-flexai', async () => {
  try {
    const container = docker.getContainer('flexai');
    await container.start();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-flexai', async () => {
  try {
    const container = docker.getContainer('flexai');
    await container.stop();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-flexai', async () => {
  try {
    // 1. Pull new image
    // 2. Stop and remove old container
    // 3. Create new container
    // (Simplified for this example, re-using install logic would be better)
    const container = docker.getContainer('flexai');
    try {
      await container.stop();
      await container.remove();
    } catch (e) { /* ignore if not running/exists */ }
    
    // Trigger install again
    // In a real app, we'd refactor the install logic to be reusable here
    return { success: true, message: 'Please click Install to re-create with latest image' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-browser', () => {
  shell.openExternal('http://localhost:5678');
});
