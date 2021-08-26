<template>
  <div class="settings-panel-component">
    <div class="scroll auto thin">
      <div class="panel-content">
        <h2 class="header">Einstellungen</h2>
        <div class="divider">
          <i class="icon fas fa-cog" /> App-Einstellungen
        </div>

        <!-- Accessibility -->
        <bl-button
          @click="$emit('openSettings', 'Accessibility')"
          :class="[
          'setting-link',
          activePage === 'Accessibility'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-child" /> Barrierefreiheit
        </bl-button>

        <!-- System -->
        <bl-button
          @click="$emit('openSettings', 'System')"
          :class="[
          'setting-link',
          activePage === 'System'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-microchip" /> System
        </bl-button>

        <div class="divider">
          <i class="icon fas fa-swatchbook" /> Themen
        </div>

        <!-- Appearance -->
        <bl-button
          @click="$emit('openSettings', 'Appearance')"
          :class="[
          'setting-link',
          activePage === 'Appearance'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-eye" /> Erscheinungsbild
        </bl-button>

        <!-- ThemeLibary -->
        <bl-button
          @click="$emit('openSettings', 'ThemeLibary')"
          :class="[
          'setting-link',
          activePage === 'ThemeLibary'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-swatchbook" /> Themen Bibliothek
        </bl-button>

        <div class="divider" />

        <bl-button
          @click="$emit('openNews')"
          class="setting-link"
          variant="transparent"
        >
          <i class="icon fas fa-scroll" /> Neuigkeiten
        </bl-button>
      </div>
      <div class="app-info">

        <!-- Links -->
        <div class="app-links">
          <tooltip>
            <template #activator>
              <bl-button
                @click="openLinkInBrowser('https://obnoxiousoliver.github.io')"
                variant="transparent small"
              ><i class="fas fa-globe" /></bl-button>
            </template>
            Website<br>
            <span class="secondary">obnoxiousoliver.github.io</span>
          </tooltip>
          <tooltip>
            <template #activator>
              <bl-button
                @click="openLinkInBrowser('https://github.com/ObnoxiousOliver')"
                variant="transparent small"
              ><i class="fab fa-github" /></bl-button>
            </template>
            GitHub - ObnoxiousOliver<br>
            <span class="secondary">github.com/ObnoxiousOliver</span>
          </tooltip>
          <tooltip>
            <template #activator>
              <bl-button
                @click="openLinkInBrowser('https://github.com/ObnoxiousOliver/BetterLANiS/issues')"
                variant="transparent small"
              ><i class="fas fa-bug" /></bl-button>
            </template>
            Ein Bug melden<br>
            <span class="secondary">GitHub Issues</span>
          </tooltip>
        </div>

        <!-- Client and OS info -->
        Client: {{ remote.app.getName() }} (v{{ remote.app.getVersion() }})<br>
        OS: {{ os.version() }} ({{ os.release() }})
      </div>
    </div>
  </div>
</template>

<script>
const { remote } = require('electron')
const os = require('os')

export default {
  name: 'SettingsPanel',
  props: {
    activePage: String
  },
  computed: {
    remote () {
      // console.log(remote.app)
      return remote
    },
    os () {
      // console.log(os)
      return os
    }
  },
  methods: {
    openLinkInBrowser (url) {
      remote.shell.openExternal(url)
    }
  }
}
</script>
