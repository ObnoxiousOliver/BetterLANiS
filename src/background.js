'use strict'

import { app, protocol, BrowserWindow, shell, dialog, clipboard, Menu, MenuItem, ipcMain, Tray } from 'electron'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import config from './config'
// import update from './update'
import AutoLaunch from 'auto-launch'
import { autoUpdater } from 'electron-updater'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

process.env.BL_REPO_NAME = 'BetterLANiS'
process.env.BL_THEMES_REPO_NAME = 'BetterLANiS-themes'
process.env.BL_REPO_USERNAME = 'ObnoxiousOliver'
process.env.GITHUB_AUTH = 'Basic KjpnaHBfWkZaOFltczNLOGtwbTBYSHpkQ29pdUFNVVlIeFEyNDRBY3lB'
process.env.RESOURCES_PATH = isDevelopment ? 'public/resources' : process.resourcesPath

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      corsEnabled: false
    }
  }
])

app.commandLine.appendSwitch('disable-site-isolation-trials')

const gotTheLock = app.requestSingleInstanceLock()

var tray

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    title: 'Better LANiS',
    frame: false,
    height: 850,
    width: 900,
    minHeight: 700,
    minWidth: 900,
    backgroundColor: '#111',
    icon: path.join(process.env.RESOURCES_PATH, 'icon.png'),
    // transparent: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
      devTools: true
    }
  })

  function getMenu () {
    const menu = new Menu()
    menu.append(new MenuItem({
      label: 'Zoom',
      submenu: [
        { role: 'resetZoom', accelerator: 'CommandOrControl+0' },
        { role: 'zoomIn', accelerator: 'CommandOrControl+=' },
        { role: 'zoomOut', accelerator: 'CommandOrControl+-' }
      ]
    }))
    menu.append(new MenuItem({
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CommandOrControl+r' },
        { role: 'reload', accelerator: 'f5' }
      ]
    }))
    return menu
  }
  function getMenuWithDevTools () {
    const menuWithDevTools = getMenu()
    menuWithDevTools.append(new MenuItem({
      label: 'DevTools',
      submenu: [
        { role: 'toggleDevTools', accelerator: 'CommandOrControl+Shift+i' }
      ]
    }))
    return menuWithDevTools
  }

  win.setMenu(getMenu())

  // Create Tray Icon
  tray = new Tray(path.join(process.env.RESOURCES_PATH, 'icon.png'))
  tray.setToolTip('Better LANiS')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Better LANiS',
      icon: path.join(process.env.RESOURCES_PATH, 'tray.png'),
      click: () => win.show()
    },
    { type: 'separator' },
    {
      label: 'Schlie??en',
      click: () => win.destroy()
    }
  ])
  tray.setContextMenu(contextMenu)
  tray.addListener('click', () => win.show())

  ipcMain.on('enable-devtools', (e, val) => {
    win.setMenu(val ? getMenuWithDevTools() : getMenu())

    if (!val) win.webContents.closeDevTools()
  })

  // #region Get Config File
  config.get(data => {
    win.setBounds(data.bounds)
    if (data.maximized) win.maximize()

    if (data.enableDevTools) {
      win.setMenu(getMenuWithDevTools())
    }
  })
  // #endregion

  // #region Save Window Bounds
  var configData = {}

  win.on('close', (e) => {
    e.preventDefault()

    win.hide()

    configData.maximized = win.isMaximized()
    config.set(configData, data => {
      // Close Window if minimize in tray is disabled
      if (data.disableMinimizeInTray) {
        win.destroy()
      }
    })
  })

  win.on('moved', () => {
    configData.maximized = win.isMaximized()
    if (!win.isMaximized()) {
      configData.bounds = win.getBounds()
    }
  })
  // #endregion

  // #region Prevent open link in New Window
  win.webContents.on('will-navigate', e => {
    e.preventDefault()
  })

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    dialog.showMessageBox(win, {
      title: 'Better LANiS',
      message: 'Soll diese externe Website ge??ffnet werden?',
      detail: url,
      // checkboxLabel: 'Nicht mehr fragen',
      buttons: ['Yes', 'Cancel', 'Copy Link']
    }).then(({ response, checkboxChecked }) => {
      if (response === 0) {
        shell.openExternal(url)
      } else if (response === 2) {
        clipboard.writeText(url)
      }
      // if (checkboxChecked) {}
    })
  })
  // #endregion

  // remove x-frame-options from response headers
  win.webContents.session.webRequest.onHeadersReceived({ urls: [] }, (details, callback) => {
    if (details.responseHeaders['x-frame-options']) {
      delete details.responseHeaders['x-frame-options']
      delete details.responseHeaders['frame-ancestors']
    }

    var cbValue = { cancel: false, responseHeaders: details.responseHeaders }
    callback(cbValue)
  })

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
    win.show()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  return win
}

// eslint-disable-next-line no-unused-vars
function createUpdateWindow () {
  const win = new BrowserWindow({
    frame: false,
    width: 300,
    height: 350,
    maximizable: false,
    // resizable: false,
    icon: path.join(process.env.RESOURCES_PATH, 'icon.png'),
    backgroundColor: '#222',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(path.join(process.env.WEBPACK_DEV_SERVER_URL, 'update/index.html'))

    // win.webContents.openDevTools()
  } else {
    win.loadURL('app://./update/index.html')
    win.setMenu(new Menu())
  }

  win.on('ready-to-show', () => {
    var zoom = win.webContents.getZoomFactor()
    win.webContents.setZoomFactor(1)

    win.on('close', () => {
      win.webContents.setZoomFactor(zoom)
    })
  })

  return win
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // ===> Don't install because Vue Devtools don't support Vue3
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
    process.env.APPIMAGE = path.join(__dirname, `BetterLANiS-${app.getVersion()}.AppImage`)
  } else {
    if (!gotTheLock) {
      app.quit()
      return
    }

    createProtocol('app')
  }

  // Set Auto Start
  if (!isDevelopment) {
    var autoLaunch = new AutoLaunch({
      name: 'Better LANiS',
      path: app.getPath('exe')
    })
    config.get(data => {
      autoLaunch.isEnabled()
        .then(isEnabled => {
          if (!isEnabled && !data.disableAutoStart) autoLaunch.enable()
          else if (isEnabled && data.disableAutoStart) autoLaunch.disable()
        })
    })
  }

  ipcMain.on('setAutoStart', (e, val) => {
    if (isDevelopment) return

    autoLaunch.isEnabled()
      .then(isEnabled => {
        if (!isEnabled && val) autoLaunch.enable()
        else if (isEnabled && !val) autoLaunch.disable()
      })
  })

  // === CHECK FOR UPDATES ===
  var mainWindow
  var updateWindow

  // if in Development don't update
  if (isDevelopment) {
    startApp()
  } else {
    updateWindow = createUpdateWindow()
  }

  function startApp (e) {
    // dialog.showMessageBox(null, {
    //   message: JSON.stringify(err, null, 2)
    // })
    if (e) e.reply('setUpdateStatus', 'Starting...')
    mainWindow = createWindow()
    setTimeout(() => {
      if (updateWindow) updateWindow.close()
    }, 500)
  }

  ipcMain.on('checkForUpdatesAndInstall', (e) => {
    // update.checkForUpdatesAndInstall(
    //   status => e.reply('setUpdateStatus', status),
    //   startApp
    // )

    e.reply('setUpdateStatus', 'Checking for Updates...')

    autoUpdater.setFeedURL({
      provider: 'github',
      repo: process.env.BL_REPO_NAME,
      owner: process.env.BL_REPO_USERNAME,
      // private: true,
      requestHeaders: {
        Authorization: process.env.GITHUB_AUTH
      }
    })

    autoUpdater.allowPrerelease = true

    autoUpdater.checkForUpdates()
      .then(update => {
        // console.log(update)
        if (update.downloadPromise) {
          e.reply('setUpdateStatus', 'Downloading(v' + update.updateInfo.version + ')...')

          update.downloadPromise.then(e => {
            console.log(e)
            autoUpdater.quitAndInstall()
          }).catch(() => startApp(e))
        } else startApp(e)
        // dialog.showMessageBox(null, {
        //   message: JSON.stringify(update, null, 2)
        // })
      }).catch(() => startApp(e))
  })

  ipcMain.on('downloadFile', (e, url, dest) => {
    fetch(url, {
      headers: {
        Authorization: process.env.GITHUB_AUTH,
        Accept: 'application/octet-stream'
      }
    })
      .then(res => new Promise((resolve, reject) => {
        var ws = fs.createWriteStream(dest)
        res.body.pipe(ws)

        var downloaded = 0
        var contentLength = res.headers.get('content-length')

        res.body.on('data', (data) => {
          downloaded += data.length

          e.reply('downloadFileStatus', {
            progress: downloaded / contentLength
          })
        })

        ws.on('error', reject)

        res.body.on('end', () => resolve())
      }))
      .then(err => e.reply('downloadFileFinished', err))
  })

  ipcMain.on('saveDialog', (e, options) => {
    dialog.showSaveDialog(mainWindow, options)
      .then(save => e.reply('saveDialogRes', save))
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
