<template>
  <div class="app" @keydown.esc="showSettingsPanel = false; showSettings = false">
    <Titlebar
      @toggle-settings="showSettingsPanel = !showSettingsPanel; showSettings = false"
      :is-settings-open="showSettingsPanel"
    />
    <div class="app-container" ref="appContainer">
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
          @openNews="showNews = true"
          :activePage="showSettings ? settingsPage : ''"
        />
      </transition>
      <transition-group
        class="notification-box"
        name="notifications-list"
        tag="div"
      >
        <Notification
          v-for="n in currentNotifications"
          :key="n.id"
          :notification="n"
        />
      </transition-group>
    </div>
    <Modal
      @closemodal="showNews = false"
      :active="showNews"
      :nofocus="[$refs.appContainer]"
      class="news-modal"
    >
      <template #header>
        <i class="fas fa-scroll" /> Neuigkeiten (v{{ remote.app.getVersion() }})
      </template>
      <NewsRenderer :version="remote.app.getVersion()" :repo="repo" />
    </Modal>
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
import Modal from './components/Modal.vue'
import NewsRenderer from './components/NewsRenderer.vue'

import { mapActions, mapState } from 'vuex'
const { remote } = require('electron')
const config = require('./config')

// import manager from '@/manager'

export default {
  components: {
    Titlebar,
    SettingsPanel,
    Settings,
    Login,
    Welcome,
    Start,
    Notification,
    Modal,
    NewsRenderer
  },
  data: () => ({
    showSettingsPanel: false,
    showSettings: false,
    settingsPage: '',
    page: 'Login',
    showNews: false
  }),
  computed: {
    ...mapState([
      'notification'
    ]),
    currentNotifications () {
      var ret = [...this.notification.current]
      return ret.reverse()
    },
    remote () {
      return remote
    },
    repo () {
      return {
        gitUser: remote.process.env.BL_REPO_USERNAME,
        gitRepo: remote.process.env.BL_REPO_NAME
      }
    }
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

    setTimeout(() => {
      config.get(data => {
        this.showNews = data.lastVersion !== remote.app.getVersion()

        config.set({
          lastVersion: remote.app.getVersion()
        })
      })
    }, 1000)

    // Add Eventlisteners for DevTools Warnings
    if (process.env.NODE_ENV !== 'development') {
      if (remote.getCurrentWebContents().isDevToolsOpened) { this.devToolsWarning() }
      remote.getCurrentWebContents().on('devtools-focused', () => this.devToolsWarning())
    }
  }
}
</script>

<style src="./assets/scss/main.scss" lang="scss"></style>
