const { remote, app } = require('electron')
const process = require('process')
const fs = require('fs')
const path = require('path')

const CONFIG_DIR_PATH = path.join(
  process.env.APPDATA,
  remote ? remote.app.getName() : app.getName(),
  'Config'
)

const CONFIG_PATH = path.join(CONFIG_DIR_PATH, 'config.json')

module.exports = {
  get (cb) {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.readFile(CONFIG_PATH, 'utf8', (err, data) => {
        var ret = {}
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
    }
  },
  set (setData) {
    // Create Dir if doesn't exists
    if (fs.existsSync(CONFIG_DIR_PATH)) {
      fs.mkdirSync(CONFIG_DIR_PATH, { recursive: true })
    }

    this.get(getData => {
      Object.keys(setData).forEach(key => {
        getData[key] = setData[key]
      })

      fs.writeFileSync(CONFIG_PATH, JSON.stringify(getData, null, 2))
    })
  },
  configDirPath: CONFIG_DIR_PATH,
  configPath: CONFIG_PATH
}
