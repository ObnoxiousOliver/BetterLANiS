<template>
  <div
    :class="[
      'titlebar-component',
      isMaximized ? 'windowstate-maximized' : 'windowstate-normal',
      isFocused ? 'window-focused' : '',
    ]"
  >
    <div class="dragable-window" />
    <div class="titlebar-controls">
      <div
        @click="close()"
        class="control btn-close"
      >
        <svg
          width="12"
          height="12"
        >
          <path
            fill="currentColor"
            d="M11 1.576 L6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1Z"
          />
        </svg>
      </div>
      <div
        @click="maximize()"
        class="control btn-max"
      >
        <svg
          v-if="isMaximized"
          width="13"
          height="13"
        >
          <path
            fill="none"
            stroke="currentColor"
            d="M3.5 3.5 l0 -2 8 0 0 8 -2 0 M1.5 3.5 l8 0 0 8 -8 0Z"
          />
        </svg>
        <svg
          v-else
          width="12"
          height="12"
        >
          <path
            fill="none"
            stroke="currentColor"
            d="M1.5 1.5 l9 0 0 9 -9 0Z"
          />
        </svg>
      </div>
      <div
        @click="minimize()"
        class="control btn-min"
      >
        <svg
          width="12"
          height="12"
        >
          <path
            stroke="currentColor"
            d="M1 6.5 l10 0"
          />
        </svg>
      </div>
      <div class="settings-divider" />
      <div
        @click="toggleSettings()"
        @keydown.space="toggleSettings()"
        @keydown.enter="toggleSettings()"
        @contextmenu="$refs.settingsContextMenu.open()"
        :class="['control', 'btn-settings', isSettingsOpen ? 'active' : '']"
        tabindex="0"
      >
        <i class="fas fa-cog" />
      </div>
      <!-- <div
        @click="toggleNotifications()"
        :class="['control', 'btn-notifications', isNotificationsOpen ? 'active' : '']"
      >
        <i class="fas fa-bell" />
      </div> -->
      <tooltip class="dev-warning" variant="warning">
        <template #activator>
          <i class="fas fa-exclamation-triangle" />
        </template>
        Diese Version steht noch unter starker Entwickelung.
      </tooltip>
    </div>
    <div class="titlebar-content">
      <div class="title">
        <span class="logo-better">Better </span>
        <span class="logo-lanis">LANiS</span>
      </div>
      <transition name="currentUser">
        <div class="currentUser" v-if="currentSchool">
          {{ currentSchool.name }} 🞄
          <span v-if="loggedInUser.class" class="class">{{ loggedInUser.firstName }} {{ loggedInUser.lastName }}</span>
          <span v-if="loggedInUser.class" class="class"> | {{ loggedInUser.class }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
const { remote } = require('electron')

const currentWindow = remote.getCurrentWindow()

export default {
  name: 'Titlebar',
  props: {
    isSettingsOpen: Boolean
  },
  computed: {
    ...mapState([
      'loggedInUser',
      'schoolList'
    ]),
    ...mapGetters([
      'currentSchool'
    ])
  },
  data: () => ({
    isNormal: false,
    isMaximized: false,
    isFocused: false
  }),
  methods: {
    close () {
      currentWindow.close()
    },
    maximize () {
      if (currentWindow.isMaximized()) {
        currentWindow.unmaximize()
      } else {
        currentWindow.maximize()
      }
    },
    minimize () {
      currentWindow.minimize()
    },
    toggleSettings () {
      this.$emit('toggleSettings')

      setTimeout(() => {
        document.querySelector('.settings-panel-component .panel-content > button').focus()
      })
    },
    updateWindowState () {
      this.isNormal = currentWindow.isNormal()
      this.isMaximized = currentWindow.isMaximized()
      this.isFocused = currentWindow.isFocused()
    }
  },
  mounted () {
    var update = () => { this.updateWindowState() }
    currentWindow.on('maximize', update)
    currentWindow.on('unmaximize', update)
    currentWindow.on('focus', update)
    currentWindow.on('blur', update)
    this.updateWindowState()
  }
}
</script>
