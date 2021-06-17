<template>
  <div class="app">
    <Titlebar
      @toggle-settings="showSettingsPanel = !showSettingsPanel; showSettings = false"
      :is-settings-open="showSettingsPanel"
    />
    <div class="app-container">
      <transition name="viewer-settings-transition">
        <div
          v-show="!showSettings"
          class="viewer"
          @click="showSettingsPanel = false"
        >
          <transition
            name="viewer"
            mode="out-in"
          >
            <component
              :is="page"
              @change-page="changePage"
            />
          </transition>
        </div>
      </transition>
      <transition name="settingswindow">
        <Settings
          :page="settingsPage"
          v-if="showSettings"
        />
      </transition>
      <transition name="settingspanel">
        <SettingsPanel
          :class="showSettings ? 'settings-page-open' : ''"
          v-if="showSettingsPanel"
          @openSettings="openSettings"
        />
      </transition>
      <transition-group
        class="notification-box"
        name="notifications-list"
        tag="div"
      >
        <Notification
          v-for="n in notification.current"
          :key="n.id"
          :notification="n"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
// Views
import Login from './views/Login'
import Welcome from './views/Welcome'
import Start from './views/Start'

// Components
import Titlebar from './components/Titlebar'
import Settings from './views/Settings'
import SettingsPanel from './components/settings/SettingsPanel'
import Notification from './components/Notification.vue'

import { mapActions, mapState } from 'vuex'
const { remote } = require('electron')

// import manager from '@/manager'

export default {
  components: {
    Titlebar,
    SettingsPanel,
    Settings,
    Login,
    Welcome,
    Start,
    Notification
  },
  data: () => ({
    showSettingsPanel: false,
    showSettings: false,
    settingsPage: '',
    page: 'Login'
  }),
  computed: {
    ...mapState([
      'notification'
    ])
  },
  methods: {
    ...mapActions([
      'appStart'
    ]),
    changePage (page) {
      this.page = page
    },
    openSettings (page) {
      this.settingsPage = page
      this.showSettings = true
    },
    devToolsWarning () {
      console.log('%c!!!WARNUNG!!!',
        `
        font-size: 4rem;
        font-weight: 700;
        background: #220808;
        border: #f44 solid 0.2rem;
        border-radius: 0.7rem;
        padding: 0.5rem 1rem;
        color: #f44;
        text-shadow:
          #bf2626 1px 1px,
          #801919 2px 2px,
          #400d0d 3px 3px,
          #000 4px 4px;
        `
      )
      console.log('%cWenn du nicht weißt mit was du es hier zu tun hast dann lass es einfach. Es können Daten freigegeben werden wenn du hier was einfügst.',
        `
        font-size: 1.25rem;
        background: #221808;
        color: #fff;
        border: #fc4 solid 0.2rem;
        border-radius: 0.7rem;
        padding: 0.5rem 1rem;
        `
      )
    }
  },
  mounted () {
    this.appStart()

    // Add Eventlisteners for DevTools Warnings
    if (remote.getCurrentWebContents().isDevToolsOpened) { this.devToolsWarning() }
    remote.getCurrentWebContents().on('devtools-focused', () => this.devToolsWarning())
  }
}
</script>

<style src="./assets/scss/main.scss" lang="scss"></style>
