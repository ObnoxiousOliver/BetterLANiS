export default {
  setSchoolList (state, payload) {
    state.schoolList = payload
  },
  setThemesPath (state, payload) {
    state.theme.path = payload
  },
  setUserData (state, payload) {
    state.loggedInUser = payload
  },
  setSavedUserData (state, payload) {
    state.savedUser.data = payload
  },
  setSavedUserPath (state, payload) {
    state.savedUser.path = payload
  },
  setApps (state, payload) {
    state.apps = payload
    // console.log(payload)
  },
  resetAll (state) {
    state.loggedInUser = {
      username: undefined,
      firstName: undefined,
      lastName: undefined,
      birthday: undefined,
      grade: undefined,
      class: undefined,
      gender: undefined,
      schoolId: undefined
    }
    state.apps = {
      supported: [],
      unsupported: []
    }
    state.savedUser = {
      data: undefined,
      path: undefined
    }
  },
  setAvailableThemes (state, payload) {
    state.theme.available = payload
  },
  addTheme (state, payload) {
    state.theme.using.push(payload)
  },
  removeTheme (state, { index }) {
    state.theme.using.splice(index, 1)
  },
  moveTheme (state, { index, to }) {
    if (to < state.theme.using.length && to >= 0) {
      var theme = state.theme.using[index]
      state.theme.using.splice(index, 1)
      state.theme.using.splice(to, 0, theme)
    }
  },
  setAccentColor (state, payload) {
    state.theme.accent = payload
  },
  saveAccentColor (state, payload) {
    state.theme.saved.push(payload)
  },
  removeAccentColor (state, payload) {
    if (state.theme.saved.includes(payload)) {
      state.theme.saved.splice(state.theme.saved.indexOf(payload), 1)
    }
  },
  setSavedColors (state, payload) {
    state.theme.saved = payload
  },
  addNotification (state, payload) {
    state.notification.all.push(payload)
    state.notification.current.push(payload)
  },
  removeNotificationFromCurrent (state, payload) {
    state.notification.current.splice(payload, 1)
  },
  addFavoriteApp (state, payload) {
    if (!state.apps.favorites.includes(payload)) {
      state.apps.favorites.push(payload)
    }
  },
  removeFavoriteApp (state, payload) {
    state.apps.favorites.splice(state.apps.favorites.indexOf(payload), 1)
  },
  addHistoryApp (state, payload) {
    state.apps.history = state.apps.history.filter(x => x !== payload)
    state.apps.history.push(payload)
  },
  setThemeLibary (state, payload) {
    state.theme.themeLibary = payload
  },
  secret (state, payload) {
    if (state.secret.includes(payload)) {
      state.secret.splice(state.secret.indexOf(payload), 1)
    } else {
      state.secret.push(payload)
    }
  }
}
