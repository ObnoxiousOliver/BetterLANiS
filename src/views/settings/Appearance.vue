<template>
  <div class="setting-appearance-view-component scroll y auto">
    <fieldset :disabled="accentColorsOpen || customColorOpen">
      <h1 class="setting-page-header">Aussehen</h1>
      <div class="accent-color-select">
        <tooltip placement="bottom">
          <template #activator>
            <button @click="openCustomColor" class="color-button custom-color">
              <i class="icon bi-eyedropper" />
              <div class="accent-foreground-preview" />
            </button>
          </template>
          <span class="custom-color-tooltip">
            Eigene Farbe wählen
          </span>
        </tooltip>
        <div class="color-templates">
          <button
            @click="setAccentColor(template)"
            v-for="template in allAccentColors"
            :key="template"
            :class="['color-button', 'template-color', theme.accent === template ? 'active' : '']"
            :style="{ color: template }"
          >
            <i class="icon bi-check2" />
            <div class="accent-foreground-preview" :style="{ color: getContrastYIQ(template) }" />
          </button>
        </div>
        <tooltip placement="bottom">
          <template #activator>
            <bl-button
              @click="accentColorsOpen = true"
              class="show-all-colors-button"
              variant="static transparent"
            >
              <i class="bi-chevron-down" />
            </bl-button>
          </template>
          Mehr Farben anzeigen
        </tooltip>
      </div>

      <div class="theme-select">
        <div class="available-themes">
          <transition-group
            name="theme-list"
            tag="div"
            class="list-animator"
          >
            <ThemeItem
              v-for="theme in availableThemes"
              @click="addThemeClick(theme)"
              @contextmenu="selectedAvailableTheme = theme; $refs.availableThemeContextMenu.open()"
              :key="theme.path"
              :theme="theme"
              :original="theme.author === 'ObnoxiousOliver'"
              :tabindex="accentColorsOpen || customColorOpen ? -1 : 0"
            />
          </transition-group>
          <context-menu ref="availableThemeContextMenu">
            <button @click="addThemeClick(selectedAvailableTheme)"><i class="bi bi-plus" /> Hinzufügen</button>
            <div class="divider" />
            <button @click="openInFolder(selectedAvailableTheme)"><i class="far fa-folder" /> Themes-Ordner öffnen</button>
          </context-menu>
        </div>

        <div class="current-themes">
          <transition-group
            name="theme-list"
            tag="div"
            class="list-animator"
          >
            <ThemeItem
              v-for="theme in currentThemes"
              @click="removeThemeClick(theme)"
              @contextmenu="selectedCurrentTheme = theme; $refs.currentThemeContextMenu.open()"
              :key="theme.path"
              :theme="theme"
              :original="theme.author === 'ObnoxiousOliver'"
              :draggable="currentThemes.length > 1"
              :tabindex="accentColorsOpen || customColorOpen ? -1 : 0"
            />
          </transition-group>
          <context-menu ref="currentThemeContextMenu">
            <button
              v-if="selectedCurrentTheme"
              @click="moveThemeUp(selectedCurrentTheme)"
              :disabled="theme.using.indexOf(selectedCurrentTheme) >= theme.using.length - 1"
            >
              <i class="bi-chevron-up" /> Nach Oben
            </button>
            <button
              v-if="selectedCurrentTheme"
              @click="moveThemeDown(selectedCurrentTheme)"
              :disabled="theme.using.indexOf(selectedCurrentTheme) <= 0"
            >
              <i class="bi-chevron-down" /> Nach Unten
            </button>
            <button
              v-if="selectedCurrentTheme"
              @click="removeThemeClick(selectedCurrentTheme)"
            >
              <i class="bi-x" /> Entfernen
            </button>
            <div
              v-if="selectedCurrentTheme"
              class="divider"
            />
            <button @click="openInFolder(selectedCurrentTheme)">
              <i class="far fa-folder" /> Themes-Ordner öffnen
            </button>
          </context-menu>
          <ThemeItem
            :theme="{
              name: 'Default',
              description: 'Das dunkle Thema von Better LANiS'
            }"
            :original="true"
            :noArrow="true"
          />
        </div>
      </div>
      <bl-button
        @click="getThemes"
        class="refresh-btn"
        variant="static small"
      >
        <i class="fa fa-sync" /> Neu laden
      </bl-button>
    </fieldset>

    <Modal
      class="all-accent-colors-modal"
      @closemodal="accentColorsOpen = false"
      :active="accentColorsOpen"
    >
      <template #header>Akzent Farben</template>
      <div class="">
        <div class="all-template-colors scroll y auto">
          <button
            @click="setAccentColor(template)"
            v-for="template in accentColorTemplates"
            :key="template"
            :class="['color-button', 'template-color', theme.accent === template ? 'active' : '']"
            :style="{ color: template }"
          >
            <i class="icon bi-check2" />
            <div class="accent-foreground-preview" :style="{ color: getContrastYIQ(template) }" />
          </button>
          <div v-if="theme.saved.length" class="divider">Gespeichert</div>
          <button
            @click="setAccentColor(template)"
            @contextmenu="selectedAccentColor = template; $refs.savedColorsContextMenu.open()"
            v-for="template in theme.saved"
            :key="template"
            :class="['color-button', 'template-color', theme.accent === template ? 'active' : '']"
            :style="{ color: template }"
          >
            <i class="icon bi-check2" />
            <div class="accent-foreground-preview" :style="{ color: getContrastYIQ(template) }" />
          </button>
        </div>
      </div>
    </Modal>

    <Modal
      class="custom-colors-modal"
      @closemodal="customColorOpen = false"
      :active="customColorOpen"
    >
      <template #header>Eigene Farbe</template>
      <ColorPicker ref="accentColorPicker" />
      <div class="custom-color-templates">
        <div class="custom-color-controls">
          <tooltip placement="bottom">
            <template #activator>
              <bl-button
                class="add-color-button"
              @click="saveAccentColorClick"
                variant="static transparent small"
              >
                <i class="bi-plus" />
              </bl-button>
            </template>
            Farbe speichern
          </tooltip>
        </div>
        <div class="template-colors scroll y auto thin">
          <button
            @click="$refs.accentColorPicker.setColor(template)"
            v-for="template in accentColorTemplates"
            :key="template"
            class="color-button template-color"
            :style="{ color: template }"
          />
          <div v-if="theme.saved.length" class="divider">Gespeichert</div>
          <button
            @click="$refs.accentColorPicker.setColor(template)"
            @contextmenu="selectedAccentColor = template; $refs.savedColorsContextMenu.open()"
            v-for="template in theme.saved"
            :key="template"
            class="color-button template-color"
            :style="{ color: template }"
          />
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <div class="modal-buttons">
            <bl-button @click="customColorOpen = false" variant="static small transparent">Abbrechen</bl-button>
            <bl-button @click="applyAccentColor" variant="primary static">Ok</bl-button>
          </div>
        </div>
      </template>
    </Modal>

    <context-menu ref="savedColorsContextMenu">
      <button @click="removeAccentColor(selectedAccentColor)"><i class="bi-x" /> Entfernen</button>
    </context-menu>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Modal from '../../components/Modal.vue'
import ColorPicker from '../../components/input/colorpickers/ColorPicker.vue'
import ThemeItem from '../../components/settings/ThemeItem.vue'

const fs = require('fs')
const path = require('path')

export default {
  name: 'Appearance',
  components: {
    ThemeItem,
    Modal,
    ColorPicker
  },
  data: () => ({
    themes: [],
    selectedCurrentTheme: undefined,
    selectedAvailableTheme: undefined,
    selectedAccentColor: undefined,
    accentColorsOpen: false,
    customColorOpen: false
  }),
  computed: {
    ...mapState([
      'theme'
    ]),
    currentThemes () {
      var using = [...this.theme.using]
      return using.reverse()
    },
    availableThemes () {
      return this.themes.filter(x => !this.theme.using.map(y => y.path).includes(x.path))
    },
    accentColorTemplates () {
      return [
        '#3399ff',
        '#99ffdd',
        '#ffdd44',
        '#ff9730',
        '#ff5555',
        '#ff66aa',
        '#bb66ff'
      ]
    },
    allAccentColors () {
      return [...this.accentColorTemplates, ...this.theme.saved]
    }
  },
  mounted () {
    this.getThemes()
  },
  methods: {
    ...mapActions([
      'addTheme',
      'removeTheme',
      'moveTheme',
      'setAccentColor',
      'saveAccentColor',
      'removeAccentColor',
      'notify'
    ]),
    saveAccentColorClick () {
      var hex = this.$refs.accentColorPicker.hex

      if (this.allAccentColors.includes(hex)) {
        this.notify({
          title: 'Akzent Farbe',
          message: 'Farbe ist schon gespeichert',
          style: 'warning'
        })
      } else {
        this.saveAccentColor(hex)
      }
    },
    getThemes () {
      this.themes = []
      var themesInDir = fs.readdirSync(this.theme.path).filter(x => x.endsWith('.bl-theme'))
      themesInDir.forEach(theme => {
        var manifestPath = path.join(this.theme.path, theme, 'manifest.json')
        if (fs.existsSync(manifestPath)) {
          var manifest = {
            ...JSON.parse(fs.readFileSync(manifestPath)),
            path: theme
          }

          if (manifest.icon) {
            manifest.icon64 = 'data:image/png;base64,' +
            fs.readFileSync(path.join(this.theme.path, theme, manifest.icon)).toString('base64')
          }
          this.themes.push(manifest)
        } else {
          this.notify({
            title: 'Themes - ' + theme,
            message: 'Keine "manifest.json" Datei gefunden',
            style: 'error'
          })
          this.themes.push({
            name: theme,
            description: 'Keine "manifest.json" Datei gefunden',
            notUsable: true
          })
        }
      })
    },
    addThemeClick (theme) {
      if (!theme.notUsable) {
        this.addTheme(theme)
      }
    },
    removeThemeClick (theme) {
      this.removeTheme({ index: this.theme.using.indexOf(theme) })
    },
    moveThemeUp (theme) {
      this.moveTheme({
        index: this.theme.using.indexOf(theme),
        to: this.theme.using.indexOf(theme) + 1
      })
    },
    moveThemeDown (theme) {
      this.moveTheme({
        index: this.theme.using.indexOf(theme),
        to: this.theme.using.indexOf(theme) - 1
      })
    },
    openInFolder (theme) {
      var pathToOpen = path.join(this.theme.path, theme.path)
      require('child_process').exec(`start "" "${pathToOpen}"`)
    },
    openCustomColor () {
      this.customColorOpen = true
      setTimeout(() => {
        this.$refs.accentColorPicker.setColor(this.theme.accent)
      }, 1)
    },
    applyAccentColor () {
      var hex = this.$refs.accentColorPicker.hex
      console.log('Set accent color:', hex)

      this.setAccentColor(hex)
      this.customColorOpen = false
    },
    getContrastYIQ (hexcolor) {
      function hexToRGB (h) {
        let r = 0
        let g = 0
        let b = 0

        // 3 digits
        if (h.length === 4) {
          r = '0x' + h[1] + h[1]
          g = '0x' + h[2] + h[2]
          b = '0x' + h[3] + h[3]

        // 6 digits
        } else if (h.length === 7) {
          r = '0x' + h[1] + h[2]
          g = '0x' + h[3] + h[4]
          b = '0x' + h[5] + h[6]
        }

        return {
          r: parseInt(r),
          g: parseInt(g),
          b: parseInt(b)
        }
      }

      var rgb = hexToRGB(hexcolor)
      var yiq = ((rgb.r * 190) + (rgb.g * 500) + (rgb.b * 60)) / 1000
      return (yiq >= 128) ? '#000000' : '#ffffff'
    }
  }
}
</script>
