'use strict'

import { app, protocol, BrowserWindow, shell, dialog, clipboard } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

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

async function createWindow () {
  // #region Get Config File
  var path = require('path')
  var fs = require('fs')
  var configDir = path.join(process.env.APPDATA, 'betterlanis', 'Config')
  var configPath = path.join(configDir, 'config.json')
  var config
  try {
    config = { ...JSON.parse(fs.readFileSync(configPath, 'utf8')) }
    // console.log(config)
  } catch (e) {
    config = {}
  }
  // #endregion

  // Create the browser window.
  const win = new BrowserWindow({
    title: 'Better LANiS',
    frame: false,
    height: 850,
    width: 700,
    minHeight: 700,
    minWidth: 550,
    backgroundColor: '#111',
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

  // win.hide()

  if (config) {
    win.setBounds(config.bounds)
    if (config.maximized) {
      win.maximize()
    }
  }

  // #region Save Window Bounds
  win.on('close', () => {
    config.maximized = win.isMaximized()

    fs.mkdirSync(configDir, { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(config))
  })

  win.on('moved', () => {
    config.maximized = win.isMaximized()
    if (!win.isMaximized()) {
      config.bounds = win.getBounds()
    }
  })
  // #endregion

  // #region Prevent open link in New Window
  win.webContents.on('will-navigate', e => {
    e.preventDefault()
  })

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    dialog.showMessageBox(win,
      {
        title: 'Better LANiS',
        message: 'Soll diese externe Website geöffnet werden?',
        detail: url,
        checkboxLabel: 'Nicht mehr fragen',
        buttons: ['Yes', 'Cancel', 'Copy Link']
      }).then(({ response, checkboxChecked }) => {
      if (response === 0) {
        shell.openExternal(url)
      } else if (response === 2) {
        clipboard.writeText(url)
      }
      if (checkboxChecked) {}
    })
  })
  // #endregion

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
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
    // - Don't install because Vue Devtools don't support Vue3
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow()
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
