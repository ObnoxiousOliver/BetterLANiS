<template>
  <div class="settings-panel-component">
    <div class="scroll auto thin">
      <div class="panel-content">
        <h2 class="header">Einstellungen</h2>
        <div class="divider">
          <i class="icon fas fa-cog" /> App-Einstellungen
        </div>
        <bl-button
          @click="$emit('openSettings', 'Appearance')"
          :class="[
          'setting-link',
          activePage === 'Appearance'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-swatchbook" /> Erscheinungsbild
        </bl-button>
        <bl-button
          :class="[
          'setting-link',
          activePage === 'Accessibility'
            ? 'btn-primary btn-no-caps'
            : 'btn-transparent'
          ]"
        >
          <i class="icon fas fa-child" /> Accessibility
        </bl-button>
      </div>
      <div class="app-info">
        Version: {{ remote.app.getName() }} ({{ remote.app.getVersion() }})<br>
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
      console.log(remote.app)
      return remote
    },
    os () {
      console.log(os)
      return os
    }
  }
}
</script>
