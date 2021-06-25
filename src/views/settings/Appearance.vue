<template>
  <div class="setting-appearance-view-component scroll y auto">
    <div class="wrapper" ref="wrapper">
      <h1 class="setting-page-header"><i class="fas fa-swatchbook" /> Erscheinungsbild</h1>

      <!-- Accent Color -->
      <div class="option-container">
        <div class="option-name">
          <i class="fas fa-paint-brush" /> Akzent Farbe
        </div>
        <div class="options-body">
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
                <div class="accent-foreground-preview" :style="{ color: color.getContrastYIQ(template) }" />
              </button>
            </div>
            <tooltip placement="bottom">
              <template #activator>
                <bl-button
                  @click="accentColorsOpen = true"
                  class="show-all-colors-button"
                  variant="transparent"
                >
                  <i class="bi-chevron-down" />
                </bl-button>
              </template>
              Mehr Farben anzeigen
            </tooltip>
          </div>
        </div>
      </div>

      <!-- Themes -->
      <div class="option-container">
        <div class="option-name">
          <i class="fas fa-swatchbook" /> App-Themen
        </div>
        <div class="option-body">
          <div class="control-buttons">
            <bl-button
              @click="openInFolder({ path: '' })"
              class="open-folder-btn"
              variant="transparent small"
            >
              <i class="far fa-folder" /> Themen-Ordner öffnen
            </bl-button>
            <bl-button
              @click="getThemes"
              class="refresh-btn"
              variant="transparent small"
            >
              <i class="fa fa-sync" /> Neu laden
            </bl-button>
          </div>
          <div class="theme-select">
            <div class="available-themes scroll y auto thin">
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
                  tabindex="0"
                />
              </transition-group>
              <context-menu ref="availableThemeContextMenu">
                <button @click="addThemeClick(selectedAvailableTheme)"><i class="bi bi-plus-circle" /> Hinzufügen</button>
                <div class="divider" />
                <button @click="openInFolder(selectedAvailableTheme)"><i class="far fa-folder" /> Im Themen-Ordner öffnen</button>
              </context-menu>
            </div>

            <div class="current-themes scroll y auto thin">
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
                  tabindex="0"
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
                  <i class="far fa-folder" /> Im Themen-Ordner öffnen
                </button>
              </context-menu>
              <ThemeItem
                class="default-theme"
                :theme="{
                  name: 'Standart Thema',
                  description: 'Das dunkle Design von Better LANiS'
                }"
                :original="true"
                :noArrow="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal
      @closemodal="accentColorsOpen = false"
      :active="accentColorsOpen"
      :nofocus="[$refs.wrapper]"
      class="all-accent-colors-modal"
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
            <div class="accent-foreground-preview" :style="{ color: color.getContrastYIQ(template) }" />
          </button>
          <div v-if="theme.saved.length" class="divider">
            <i class="fas fa-save" /> Gespeichert
          </div>
          <button
            @click="setAccentColor(template)"
            @contextmenu="selectedAccentColor = template; $refs.savedColorsContextMenu.open()"
            v-for="template in theme.saved"
            :key="template"
            :class="['color-button', 'template-color', theme.accent === template ? 'active' : '']"
            :style="{ color: template }"
          >
            <i class="icon bi-check2" />
            <div class="accent-foreground-preview" :style="{ color: color.getContrastYIQ(template) }" />
          </button>
        </div>
      </div>
    </Modal>

    <Modal
      @closemodal="customColorOpen = false"
      :active="customColorOpen"
      :nofocus="[$refs.wrapper]"
      class="custom-colors-modal"
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
                variant="transparent small"
              >
                <i class="bi-plus-circle" />
              </bl-button>
            </template>
            Farbe speichern
          </tooltip>
        </div>
        <transition-group
          name="template-color"
          class="template-colors scroll y auto thin"
          tag="div"
        >
          <button
            @click="$refs.accentColorPicker.setColor(template)"
            v-for="template in accentColorTemplates"
            :key="template"
            class="color-button template-color"
            :style="{ color: template }"
          />
          <div v-if="theme.saved.length" class="divider">
            <i class="fas fa-save" /> Gespeichert
          </div>
          <button
            @click="$refs.accentColorPicker.setColor(template)"
            @contextmenu="selectedAccentColor = template; $refs.savedColorsContextMenu.open()"
            v-for="template in theme.saved"
            :key="template"
            class="color-button template-color"
            :style="{ color: template }"
          />
        </transition-group>
      </div>
      <template #footer>
        <div class="modal-footer">
          <div class="modal-buttons">
            <bl-button @click="customColorOpen = false" variant="small transparent">Abbrechen</bl-button>
            <bl-button @click="applyAccentColor" variant="primary">Annehmen</bl-button>
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
import color from '@/color'

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
        '#44ccaa',
        '#ffdd44',
        '#ff9933',
        '#ff5555',
        '#ff6688',
        '#ff66ee',
        '#8866ff'
      ]
    },
    allAccentColors () {
      return [...this.accentColorTemplates, ...this.theme.saved]
    },
    color () {
      return color
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
    }
  }
}
</script>
