import manager from '@/manager'
import color from '@/color'
import icons from '@/icons'

const { remote } = require('electron')
const fs = require('fs')
const path = require('path')

const CONFIG_PATH = path.join(remote.app.getPath('userData'), 'Config')
const USERS_PATH = path.join(remote.app.getPath('userData'), 'Users')
const ACTIVE_USER_PATH = path.join(CONFIG_PATH, 'active')
const THEME_CONFIG_PATH = path.join(CONFIG_PATH, 'theme.json')
const THEMES_PATH = path.join(remote.app.getPath('userData'), 'Themes')

export default {
  appStart (store) {
    store.commit('setThemesPath', THEMES_PATH)
    fs.mkdirSync(THEMES_PATH, { recursive: true })
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

        fs.mkdirSync(USERS_PATH, { recursive: true })

        store.commit('setSavedUserPath', `${btoa(userData.schoolId + userData.username).split('/').join(' ')}.bluser`)

        // SYNC USERDATA WITH VUEX
        var userPath = path.join(USERS_PATH, store.state.savedUser.path)

        if (fs.existsSync(userPath)) {
          var encodedString = fs.readFileSync(userPath).toString()
          store.commit('setSavedUserData', JSON.parse(atob(encodedString)))
          // console.log(JSON.parse(atob(encodedString)))
        }

        // SAVE PASSWORD
        if (payload) {
          var savedUser = store.state.savedUser.data
          savedUser.user = {
            username: payload.username,
            password: payload.password,
            schoolId: payload.schoolId
          }
          store.commit('setSavedUserData', savedUser)
        }

        // GET E-MAIL
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
  setSavedUserData (store, payload) {
    var userPath = path.join(USERS_PATH, store.state.savedUser.path)

    store.commit('setSavedUserData', payload)

    var jsonString = JSON.stringify(payload)
    var encodedString = btoa(jsonString)

    fs.writeFileSync(userPath, encodedString)
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
              route: manager.apps.supported[appName].route,
              data: undefined,
              link: app.link,
              icon: manager.apps.supported[appName].icon,
              folder: app.Ordner
            }
            manager.apps.supported[appName].getData(app.link, data => {
              console.log(data)
              mappedSupported[manager.apps.supported[appName].name].data = data
            })
          } else {
            mappedUnsupported.push({
              name: app.Name,
              link: app.link,
              icon: icons.mapIcon(app.Logo),
              folder: app.Ordner
            })
          }
        }
      })

      var favorites = []
      var history = []

      try {
        const savedUserDataApps = store.state.savedUser.data.apps
        favorites = savedUserDataApps.favorites ? savedUserDataApps.favorites : []
      } catch {}
      try {
        const savedUserDataApps = store.state.savedUser.data.apps
        history = savedUserDataApps.history ? savedUserDataApps.history : []
      } catch {}

      var compiledApps = {
        supported: mappedSupported,
        unsupported: mappedUnsupported,
        folders: apps.folders.map(x => ({ name: x.name, icon: x.logo })),
        favorites,
        history
      }

      store.commit('setApps', compiledApps)
      // console.log(compiledApps)

      if (callback) {
        callback()
      }
    })
  },
  addFavoriteApp (store, payload) {
    store.commit('addFavoriteApp', payload)
    var savedUser = store.state.savedUser.data

    if (!savedUser.apps) {
      savedUser.apps = {}
    }

    savedUser.apps.favorites = store.state.apps.favorites
    store.dispatch('setSavedUserData', savedUser)
    // console.log(savedUser.apps)
  },
  removeFavoriteApp (store, payload) {
    store.commit('removeFavoriteApp', payload)
    var savedUser = store.state.savedUser.data

    if (!savedUser.apps) {
      savedUser.apps = {}
    }

    savedUser.apps.favorites = store.state.apps.favorites
    store.dispatch('setSavedUserData', savedUser)
    // console.log(savedUser.apps)
  },
  addHistoryApp (store, payload) {
    store.commit('addHistoryApp', payload)
    var savedUser = store.state.savedUser.data

    if (!savedUser.apps) {
      savedUser.apps = {}
    }

    savedUser.apps.history = store.state.apps.history
    store.dispatch('setSavedUserData', savedUser)
    // console.log(savedUser.apps)
  },
  logout (store) {
    remote.session.defaultSession.clearStorageData()
    fs.unlinkSync(ACTIVE_USER_PATH, { recursive: true })
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

    var contrast = color.getContrastYIQ(store.state.theme.accent)

    el.innerHTML += `:root { --accent: ${store.state.theme.accent}; --accent-foreground: ${contrast}; }`
    if (store.state.secret.includes('4b34')) {
      el.innerHTML += 'body { transform: scaleX(-1); transition: transform 0.2s 3s; }'
    }
    store.dispatch('saveStyles')
  },
  saveStyles (store) {
    var save = {
      accent: store.state.theme.accent,
      saved: store.state.theme.saved,
      themes: store.state.theme.using.map(x => x.path)
    }

    // console.log(save)

    fs.mkdirSync(CONFIG_PATH, { recursive: true })

    fs.writeFileSync(THEME_CONFIG_PATH, JSON.stringify(save))
  },
  loadStyles (store) {
    if (fs.existsSync(THEME_CONFIG_PATH)) {
      var data = JSON.parse(fs.readFileSync(THEME_CONFIG_PATH))

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

      if (!data.themes && !data.accent) {
        store.dispatch('setStyles')
      }
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
  },
  addSecret (store, payload) {
    store.commit('secret', payload)
    switch (payload) {
      case '4b34':
        store.dispatch('setStyles')
        break
    }
  }
}
