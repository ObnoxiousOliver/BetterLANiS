import fs from 'fs'
import path from 'path'
import semver from 'semver'
import fetch from 'node-fetch'
import { app, dialog } from 'electron'

export default {
  checkForUpdatesAndInstall: (setUpdateStatus, startApp) => {
    setUpdateStatus('Checking for Updates...')

    // Fetch releases of repo
    fetch(`https://api.github.com/repos/${process.env.BL_REPO_USERNAME}/${process.env.BL_REPO_NAME}/releases`, {
      headers: { Authorization: process.env.GITHUB_AUTH }
    })
      .then(res => res.json())
      .then(data => {
        try {
          // Get Latest Version
          const release = data.filter(x => semver.satisfies(x.tag_name, `> ${app.getVersion()}`, { includePrerelease: true }))[0]

          if (release) {
            const asset = release.assets.filter(x => x.name.endsWith('.exe'))[0]

            if (asset) {
              const dest = path.join(app.getPath('temp'), asset.name)

              setUpdateStatus('Downloading (v' + release.tag_name + ')...')

              // Fetch installer file
              fetch(asset.url, {
                headers: {
                  Authorization: process.env.GITHUB_AUTH,
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
                  if (err) dialog.showMessageBox(null, { title: 'Error', detail: err })
                  setUpdateStatus('Installing...')
                  require('child_process').exec(dest)
                  setTimeout(() => {
                    app.quit()
                  }, 1000)
                })
            } else {
              setUpdateStatus('Starting...')
              startApp()
            }
          } else {
            setUpdateStatus('Starting...')
            startApp()
          }
        } catch {
          setUpdateStatus('Starting...')
          startApp()
        }
      })
  }
}
