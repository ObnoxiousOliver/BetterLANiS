'use strict'

import { app, protocol, BrowserWindow, shell, dialog, clipboard, Menu, MenuItem, ipcMain } from 'electron'
import path from 'path'
import fetch from 'node-fetch'
import fs from 'fs'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import semver from 'semver'
import config from './config'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

process.env.BL_REPO_NAME = 'BetterLANiS'
process.env.BL_REPO_USERNAME = 'ObnoxiousOliver'
process.env.GITHUB_TOKEN = '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'

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

if (!gotTheLock) {
  app.quit()
}

async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    title: 'Better LANiS',
    frame: false,
    height: 850,
    width: 900,
    minHeight: 700,
    minWidth: 900,
    backgroundColor: '#111',
    icon: './icon.ico',
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
      { role: 'reload', accelerator: 'f5' },
      { role: 'toggleDevTools', accelerator: 'CommandOrControl+Shift+i' }
    ]
  }))

  win.setMenu(menu)

  // #region Get Config File
  config.get(data => {
    if (data) {
      win.setBounds(data.bounds)
      if (data.maximized) {
        win.maximize()
      }
    }
  })
  // #endregion

  // #region Save Window Bounds
  var configData = {}

  win.on('close', () => {
    configData.maximized = win.isMaximized()
    config.set(configData)
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
    dialog.showMessageBox(win,
      {
        title: 'Better LANiS',
        message: 'Soll diese externe Website geöffnet werden?',
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

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
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

function createUpdateWindow () {
  const win = new BrowserWindow({
    frame: false,
    width: 300,
    height: 350,
    maximizable: false,
    // resizable: false,
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
  } else {
    createProtocol('app')
  }

  // === CHECK FOR UPDATES ===
  // options: {
  //   gitUser: String,
  //   gitRepo: String
  // }
  const updateWindow = createUpdateWindow()

  function startApp () {
    createWindow()
    setTimeout(() => updateWindow.close(), 500)
  }

  ipcMain.on('checkForUpdatesAndInstall', (e) => {
    e.reply('setUpdateStatus', 'Checking for Updates...')

    // if in Development don't update
    // if (isDevelopment && !process.env.IS_TEST) {
    //   startApp()
    //   return
    // }

    // Fetch releases of repo
    fetch(`https://api.github.com/repos/${process.env.BL_REPO_USERNAME}/${process.env.BL_REPO_NAME}/releases`, {
      headers: { Authorization: 'Basic ' + Buffer.from('*:' + process.env.GITHUB_TOKEN).toString('base64') }
    })
      .then(res => res.json())
      .then(data => {
        try {
          // Get Latest Version
          const release = data.filter(x => semver.satisfies(x.tag_name, `> ${app.getVersion()}`, { includePrerelease: true }))[0]

          if (release) {
            const asset = release.assets.filter(x => x.name.endsWith('.exe'))[0]

            if (asset) {
              const dest = path.join(process.env.TEMP, asset.name)

              e.reply('setUpdateStatus', 'Downloading (v' + release.tag_name + ')...')

              // Fetch installer file
              fetch(asset.url, {
                headers: {
                  Authorization: 'Basic ' + Buffer.from('*:' + process.env.GITHUB_TOKEN).toString('base64'),
                  Accept: 'application/octet-stream'
                }
              })
                .then(res => new Promise((resolve, reject) => {
                  var ws = fs.createWriteStream(dest)
                  res.body.pipe(ws)

                  ws.on('error', reject)

                  res.body.on('end', () => resolve())
                }))
                .then(err => {
                  if (err) dialog.showMessageBox(updateWindow, { title: 'Error', detail: err })
                  e.reply('setUpdateStatus', 'Installing...')
                  require('child_process').exec(dest)
                  setTimeout(() => { app.quit() }, 1000)
                })
            } else {
              e.reply('setUpdateStatus', 'Starting...')
              startApp()
            }
          } else {
            e.reply('setUpdateStatus', 'Starting...')
            startApp()
          }
        } catch {
          e.reply('setUpdateStatus', 'Starting...')
          startApp()
        }
      })
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
