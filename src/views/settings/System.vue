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
              </label>
              <span class="secondary">Beim Klicken auf das X nur das Fenster schließen. BetterLANiS läuft dann in der Sysbolleiste weiter.</span>
            </div>
            <input type="checkbox" class="input-toggle" id="minimize">
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
  data: () => ({
    devTools: false,
    autoStart: false
  }),
  watch: {
    devTools (val) {
      ipcRenderer.send('enable-devtools', val)
      config.set({ enableDevTools: val })
    },
    autoStart (val) {
      config.set({ autoStart: val })
    }
  },
  mounted () {
    config.get(data => {
      console.log(data)
      this.devTools = data.enableDevTools
      this.autoStart = data.autoStart
    })
  }
}
</script>
