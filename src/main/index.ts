import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import { initDatabase } from './database'
import { registerDatabaseHandlers } from './ipc/database-handlers'

// Get the correct path for resources in both dev and production
function getResourcePath(): string {
  if (process.env.NODE_ENV === 'development' || is.dev) {
    // In development, resources are in the project directory
    return join(__dirname, '..', '..', 'resources')
  } else {
    // In production, use process.resourcesPath
    return process.resourcesPath
  }
}

// Get icon path
function getIconPath(): string {
  const resourcePath = getResourcePath()
  return join(resourcePath, 'icon.png')
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    icon: getIconPath(),
    title: 'MedixPOS - Professional Pharmacy Management',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.johuniq.medixpos')

  // Check for pending restore operation
  const userDataPath = app.getPath('userData')
  const restoreFlagPath = path.join(userDataPath, 'restore-pending.json')
  const dbPath = path.join(userDataPath, 'pharmacy.db')
  const walPath = dbPath + '-wal'
  const shmPath = dbPath + '-shm'

  if (fs.existsSync(restoreFlagPath)) {
    try {
      console.log('Processing pending database restore...')
      const restoreData = JSON.parse(fs.readFileSync(restoreFlagPath, 'utf-8'))
      const backupPath = restoreData.backupPath

      if (fs.existsSync(backupPath)) {
        // Create backup of current database
        const currentBackupPath = path.join(
          userDataPath,
          `pharmacy-before-restore-${Date.now()}.db`
        )
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, currentBackupPath)
          console.log('Current database backed up')
        }

        // Remove WAL and SHM files
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath)
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath)

        // Restore the backup
        fs.copyFileSync(backupPath, dbPath)
        console.log('Database restored successfully')

        // Remove the restore flag
        fs.unlinkSync(restoreFlagPath)
      } else {
        console.error('Backup file not found:', backupPath)
        fs.unlinkSync(restoreFlagPath)
      }
    } catch (error) {
      console.error('Failed to process restore:', error)
      // Remove the flag even if restore failed to prevent infinite loop
      try {
        fs.unlinkSync(restoreFlagPath)
      } catch (e) {
        console.error('Failed to remove restore flag:', e)
      }
    }
  }

  try {
    // Initialize database
    console.log('Initializing database...')
    await initDatabase()
    console.log('Database initialized successfully')

    // Register IPC handlers
    registerDatabaseHandlers()
    console.log('IPC handlers registered')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    dialog.showErrorBox(
      'Application Initialization Error',
      `Failed to start MedixPOS:\n\n${error instanceof Error ? error.message : String(error)}\n\nStack: ${error instanceof Error ? error.stack : 'No stack trace'}`
    )
    app.quit()
    return
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Handle app quit from renderer
  ipcMain.on('app:quit', () => {
    app.quit()
  })

  // Handle app restart from renderer
  ipcMain.on('app:restart', () => {
    app.relaunch()
    app.quit()
  })

  try {
    createWindow()
  } catch (error) {
    console.error('Failed to create window:', error)
    dialog.showErrorBox(
      'Window Creation Error',
      `Failed to create application window:\n\n${error instanceof Error ? error.message : String(error)}`
    )
    app.quit()
    return
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
