import manager from '@/manager'

const { remote } = require('electron')
const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.join(remote.process.env.APPDATA, 'betterlanis', 'Config')
const USERS_PATH = path.join(remote.process.env.APPDATA, 'betterlanis', 'Users')
const ACTIVE_USER_PATH = path.join(CONFIG_PATH, 'active')
const THEME_PATH = path.join(CONFIG_PATH, 'theme.json')

export default {
  appStart (store) {
    store.dispatch('loadStyles')

    fetch('https://start.schulportal.hessen.de/exporteur.php?a=schoollist')
      .then(response => response.json())
      .then(data => store.commit('setSchoolList', data))
  },
  setUserData (store, { payload, callback }) {
    fetch(manager.urls.BASE_ADDRESS + 'benutzerverwaltung.php?a=userData')
      .then((response) => response.text())
      .then((data) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        const table = doc.querySelector('#content > div.row > div > table > tbody')

        var userData = {
          username: table.querySelector('tr:nth-child(1) > td:nth-child(2)').textContent.trim(),
          firstName: table.querySelector('tr:nth-child(3) > td:nth-child(2)').textContent.trim(),
          lastName: table.querySelector('tr:nth-child(2) > td:nth-child(2)').textContent.trim(),
          birthday: table.querySelector('tr:nth-child(4) > td:nth-child(2)').textContent.trim(),
          grade: table.querySelector('tr:nth-child(5) > td:nth-child(2)').textContent.trim(),
          class: table.querySelector('tr:nth-child(6) > td:nth-child(2)').textContent.trim(),
          gender: table.querySelector('tr:nth-child(7) > td:nth-child(2)').textContent.trim(),
          schoolId: doc.querySelector('#institutionsid').textContent.trim()
        }

        if (!fs.existsSync(USERS_PATH)) {
          fs.mkdirSync(USERS_PATH)
        }

        store.commit('setSavedUserPath', `${btoa(userData.schoolId + userData.username).split('/').join(' ')}.bluser`)

        if (payload) {
          var userPath = path.join(USERS_PATH, store.state.savedUser.path)
          var jsonString = JSON.stringify({
            user: {
              username: payload.username,
              password: payload.password,
              schoolId: payload.schoolId
            }
          })
          var encodedString = btoa(jsonString)
          fs.writeFileSync(userPath, encodedString)
        }

        fetch(manager.urls.BASE_ADDRESS + 'benutzerverwaltung.php?a=userMail')
          .then((response) => response.text())
          .then((data) => {
            userData.email = parser.parseFromString(data, 'text/html').querySelector('#mail').value
            store.commit('setUserData', userData)
            if (callback) {
              callback(userData)
            }
          })
      })
  },
  setApps (store, callback) {
    manager.getApps((apps) => {
      var mappedSupported = {}
      var mappedUnsupported = []

      apps.entrys.forEach(app => {
        var appName = app.Name.toLowerCase()

        if (!manager.apps.hidden.includes(appName)) {
          if (manager.apps.supported[appName]) {
            mappedSupported[manager.apps.supported[appName].name] = {
              name: app.Name,
              html: manager.apps.supported[appName].html,
              route: manager.apps.supported[appName].route,
              data: undefined,
              link: app.link
            }
            manager.apps.supported[appName].getData(app.link, data => {
              console.log(data)
              mappedSupported[manager.apps.supported[appName].name].data = data
            })
          } else {
            mappedUnsupported.push({
              name: app.Name,
              link: app.link,
              icon: app.Logo
            })
          }
        }
      })

      store.commit('setApps', {
        supported: mappedSupported,
        unsupported: mappedUnsupported
      })
      if (callback) {
        callback()
      }
    })
  },
  logout (store) {
    remote.session.defaultSession.clearStorageData()
    if (fs.existsSync(ACTIVE_USER_PATH)) {
      fs.unlinkSync(ACTIVE_USER_PATH)
    }
    store.commit('resetAll')
  },
  addTheme (store, payload) {
    var using = [...store.state.theme.using]
    if (!using.map(x => x.path).includes(payload.path)) {
      store.commit('addTheme', payload)
    }
    store.dispatch('setStyles')
  },
  removeTheme (store, payload) {
    store.commit('removeTheme', payload)
    store.dispatch('setStyles')
  },
  moveTheme (store, payload) {
    store.commit('moveTheme', payload)
    store.dispatch('setStyles')
  },
  setAccentColor (store, payload) {
    store.commit('setAccentColor', payload)
    store.dispatch('setStyles')
  },
  saveAccentColor (store, payload) {
    store.commit('saveAccentColor', payload)
    store.dispatch('saveStyles')
  },
  removeAccentColor (store, payload) {
    store.commit('removeAccentColor', payload)
    store.dispatch('saveStyles')
  },
  setStyles (store) {
    var el = document.querySelector('#themes')
    if (!el) {
      el = document.createElement('style')
      el.setAttribute('id', 'themes')
      document.head.append(el)
    }

    el.innerHTML = ''
    store.state.theme.using.forEach(theme => {
      if (theme.css) {
        var css = fs.readFileSync(path.join(store.state.theme.path, theme.path, theme.css), 'utf-8').toString()
        el.innerHTML += `/* ${theme.name} */\n${css}\n`
      }
    })

    function getContrastYIQ (hexcolor) {
      function hexToRGB (h) {
        let r = 0
        let g = 0
        let b = 0

        // 3 digits
        if (h.length === 4) {
          r = '0x' + h[1] + h[1]
          g = '0x' + h[2] + h[2]
          b = '0x' + h[3] + h[3]

        // 6 digits
        } else if (h.length === 7) {
          r = '0x' + h[1] + h[2]
          g = '0x' + h[3] + h[4]
          b = '0x' + h[5] + h[6]
        }

        return {
          r: parseInt(r),
          g: parseInt(g),
          b: parseInt(b)
        }
      }

      var rgb = hexToRGB(hexcolor)
      var yiq = ((rgb.r * 190) + (rgb.g * 500) + (rgb.b * 60)) / 1000
      return (yiq >= 128) ? '#000000' : '#ffffff'
    }

    el.innerHTML += `:root { --accent: ${store.state.theme.accent}; --accent-foreground: ${getContrastYIQ(store.state.theme.accent)}; }`
    store.dispatch('saveStyles')
  },
  saveStyles (store) {
    var save = {
      accent: store.state.theme.accent,
      saved: store.state.theme.saved,
      themes: store.state.theme.using.map(x => x.path)
    }

    console.log(save)

    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(CONFIG_PATH)
    }

    fs.writeFileSync(THEME_PATH, JSON.stringify(save))
  },
  loadStyles (store) {
    if (fs.existsSync(THEME_PATH)) {
      var data = JSON.parse(fs.readFileSync(THEME_PATH))

      if (data.accent) {
        store.dispatch('setAccentColor', data.accent)
      }

      if (data.saved) {
        store.commit('setSavedColors', data.saved)
      }

      if (data.themes) {
        data.themes.forEach(theme => {
          var manifestPath = path.join(store.state.theme.path, theme, 'manifest.json')
          if (fs.existsSync(manifestPath)) {
            var manifest = {
              ...JSON.parse(fs.readFileSync(manifestPath)),
              path: theme
            }

            if (manifest.icon) {
              manifest.icon64 = 'data:image/png;base64,' +
              fs.readFileSync(path.join(store.state.theme.path, theme, manifest.icon)).toString('base64')
            }
            store.dispatch('addTheme', manifest)
          } else {
            store.dispatch('notify', {
              title: 'Themes - ' + theme,
              message: 'Keine "manifest.json" Datei gefunden',
              style: 'error'
            })
          }
        })
      }
    }

    if (!data.themes && !data.accent) {
      store.dispatch('setStyles')
    }
  },
  // == NOTIFICATIONS ==
  // payload structure: {
  //   style,
  //   title,
  //   message
  // }
  notify ({ commit, state }, payload) {
    payload.id = state.notification.all.length
    commit('addNotification', payload)
    // if (payload.stay) return
    setTimeout(() => {
      commit('removeNotificationFromCurrent', state.notification.current.indexOf(payload))
    }, 5000)
  }
}
