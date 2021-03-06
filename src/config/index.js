const { remote, app } = require('electron')
// const process = require('process')
const fs = require('fs')
const path = require('path')

const CONFIG_DIR_PATH = path.join(remote ? remote.app.getPath('userData') : app.getPath('userData'), 'Config')

const CONFIG_PATH = path.join(CONFIG_DIR_PATH, 'config.json')

module.exports = {
  get (cb) {
    var ret = {}
    if (fs.existsSync(CONFIG_PATH)) {
      fs.readFile(CONFIG_PATH, 'utf8', (err, data) => {
        if (!err) {
          try {
            cb(JSON.parse(data))
          } catch {
            cb(ret)
          }
        } else {
          cb(ret)
        }
      })
    } else {
      cb(ret)
    }
  },
  set (setData, cb) {
    // Create Dir if doesn't exists
    fs.mkdirSync(CONFIG_DIR_PATH, { recursive: true })

    this.get(getData => {
      Object.keys(setData).forEach(key => {
        getData[key] = setData[key]
      })

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(getData, null, 2))

      if (cb) cb(getData)
    })
  },
  configDirPath: CONFIG_DIR_PATH,
  configPath: CONFIG_PATH,
  openPath (path) {
    var execString

    switch (remote ? remote.process.platform : process.platform) {
      case 'linux':
        execString = `xdg-open "${path}"`
        break
      default:
        execString = `start "" "${path}"`
        break
    }

    require('child_process').exec(execString)
  }
}
