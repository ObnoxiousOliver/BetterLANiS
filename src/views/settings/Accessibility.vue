<template>
  <div class="setting-accessibility-view-component scroll y auto">
    <div class="wrapper">
      <h1 class="setting-page-header"><i class="fas fa-child" /> Barrierefreiheit</h1>
      <div class="option-container">
        <div class="option-name">
          <i class="bi-search" /> Zoom-Faktor
        </div>
        <div class="option-body">
          <span class="secondary">
            Der Zoom-Faktor kann mit <b>Strg +</b> vergrößert, mit <b>Strg -</b> verkleinert und mit <b>Strg 0</b> zurückgesetzt werden
          </span>
          <div class="input-container">
            <input
              v-model="zoomfactor"
              type="range"
              class="input-slider"
              min="50"
              max="200"
            >
            <input
              v-model="zoomfactor"
              type="number"
              class="input-field"
              min="50"
              max="200"
            >
          </div>
        </div>
        <div class="option-controls">
          <bl-button
            @click="zoomfactor = 100; setZoomfactor()"
            variant="transparent"
          >Zurücksetzen</bl-button>
          <bl-button
            @click="setZoomfactor"
            variant="primary"
          >Übernehmen</bl-button>
        </div>
      </div>
      <div class="option-divider" />
      <div class="option-container secondary">
        Du kannst mit <b>Strg R</b> oder <b>F5</b> Better LANiS neuladen, falls was falsch läuft
      </div>
    </div>
  </div>
</template>

<script>
const { remote } = require('electron')

export default {
  name: 'Accessibility',
  data: () => ({
    zoomfactor: 100
  }),
  methods: {
    setZoomfactor () {
      const WEB_CONTENTS = remote.getCurrentWebContents()

      this.zoomfactor = Math.min(Math.max(this.zoomfactor, 50), 200)

      // var step = ((this.zoomfactor / 100) - WEB_CONTENTS.getZoomFactor()) / 5

      WEB_CONTENTS.setZoomFactor(this.zoomfactor / 100)

      // function setZoomFactorAnim (target) {
      //   setTimeout(function () {
      //     i++
      //     if (i < 5) {
      //       WEB_CONTENTS.setZoomFactor(WEB_CONTENTS.getZoomFactor() + step)
      //       setZoomFactorAnim(target)
      //     } else {
      //       WEB_CONTENTS.setZoomFactor(target / 100)
      //     }
      //   }, 1000 / 60)
      // }

      // setZoomFactorAnim(this.zoomfactor)
    }
  },
  mounted () {
    this.zoomfactor = remote.getCurrentWebContents().getZoomFactor() * 100
  }
}
</script>
