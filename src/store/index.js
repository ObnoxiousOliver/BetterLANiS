import { createStore } from 'vuex'

import state from './state'
import mutations from './mutations'
import actions from './actions'

const { remote } = require('electron')
// const fs = require('fs')
const path = require('path')

export default createStore({
  state,
  mutations,
  actions,
  getters: {
    currentSchool (state, getters) {
      return getters.computedSchools[state.loggedInUser.schoolId] || undefined
    },
    computedSchools (state) {
      var schools = {}

      if (state.schoolList) {
        state.schoolList.forEach(district => {
          district.Schulen.forEach(school => {
            schools[school.Id] = {
              name: school.Name,
              district: district.Name,
              location: school.Ort
            }
          })
        })
      }

      return schools
    },
    appDataPath () {
      return path.join(remote.process.env.APPDATA, remote.app.getName())
    }
  },
  modules: {
  }
})
