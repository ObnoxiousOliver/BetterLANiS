<template>
  <div class="setting-system-view-component scroll y auto">
    <div class="wrapper">
      <h1 class="setting-page-header"><i class="fas fa-microchip" /> System</h1>
      <div class="option-container">
        <div class="option-name"><i class="bi-box-seam" /> App Verhalten</div>
        <div class="option-body">
          <div class="input-container">
            <div  class="input-label">
              <label for="autostart">
                BetterLANiS starten
              </label>
              <span class="secondary">Starte BetterLANiS automatisch beim start deines Computers.</span>
            </div>
            <input type="checkbox" class="input-toggle" id="autostart" v-model="autoStart">
          </div>
          <div class="input-container">
            <div  class="input-label">
              <label for="minimize">
                In Symbolleiste minimieren
                <tooltip class="option-help">
                  <template #activator>
                    <i class="fas fa-question-circle" />
                  </template>
                  In Symbolleiste minimieren
                </tooltip>
              </label>
              <span class="secondary">Beim Klicken auf das X nur das Fenster schließen. BetterLANiS läuft dann in der Sysbolleiste weiter.</span>
            </div>
            <input type="checkbox" class="input-toggle" id="minimize" v-model="minimizeInTray">
          </div>
        </div>
      </div>
      <div class="option-container">
        <div class="option-name"><i class="bi-braces" /> Entwickler Optionen</div>
        <div class="option-body">
          <div class="input-container">
            <div class="input-label">
              <label for="devtools">
                DevTools aktivieren
              </label>
              <span class="secondary">Du kannst mit <b>Strg Shift I</b> auf die Entwickler Konsole zugreifen.</span><br>
              <span class="error"><b>Achtung! Mit der Konsole könnten Daten freigegeben werden.</b></span>
            </div>
            <input type="checkbox" class="input-toggle" id="devtools" v-model="devTools">
          </div>
          <bl-button @click="openConfigFolder">
            <i class="far fa-folder" /> Config-Ordner öffnen
          </bl-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from '@/config'
import { ipcRenderer } from 'electron'

export default {
  name: 'System',
  computed: {
    configDirPath () {
      return config.configDirPath
    }
  },
  data: () => ({
    devTools: false,
    autoStart: true,
    minimizeInTray: true
  }),
  watch: {
    devTools (val) {
      ipcRenderer.send('enable-devtools', val)
      config.set({ enableDevTools: val })
    },
    autoStart (val) {
      config.set({ disableAutoStart: !val })
      ipcRenderer.send('setAutoStart', val)
    },
    minimizeInTray (val) {
      config.set({ disableMinimizeInTray: !val })
    }
  },
  mounted () {
    config.get(data => {
      console.log(data)
      this.devTools = data.enableDevTools
      this.autoStart = !data.disableAutoStart
      this.minimizeInTray = !data.disableMinimizeInTray
    })
  },
  methods: {
    openConfigFolder () {
      require('child_process').exec(`start "" "${config.configDirPath}"`)
    }
  }
}
</script>
