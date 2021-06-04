<template>
  <div class="setting-appearance-view-component">
    <h1 class="setting-page-header">Aussehen</h1>
    <bl-button variant="static" @click="$refs.colorPicker.open()">Color Picker</bl-button>
    <context-menu ref="colorPicker">
      <div>
        <ColorPicker />
      </div>
    </context-menu>
    <bl-button
      @click="getThemes"
      class="refresh-btn"
      variant="static small"
    >
      <i class="fa fa-sync" /> Neu laden
    </bl-button>
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
          />
        </transition-group>
        <context-menu ref="currentThemeContextMenu">
          <button
            v-if="selectedCurrentTheme"
            @click="moveThemeUp(selectedCurrentTheme)"
            :disabled="theme.using.indexOf(selectedCurrentTheme) >= theme.using.length - 1"
          >
            <i class="bi bi-chevron-up" /> Nach Oben
          </button>
          <button
            v-if="selectedCurrentTheme"
            @click="moveThemeDown(selectedCurrentTheme)"
            :disabled="theme.using.indexOf(selectedCurrentTheme) <= 0"
          >
            <i class="bi bi-chevron-down" /> Nach Unten
          </button>
          <button
            v-if="selectedCurrentTheme"
            @click="removeThemeClick(selectedCurrentTheme)"
          >
            <i class="bi bi-x" /> Entfernen
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
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ColorPicker from '../../components/input/colorpickers/ColorPicker.vue'
import ThemeItem from '../../components/settings/ThemeItem.vue'

const fs = require('fs')
const path = require('path')

export default {
  name: 'Appearance',
  components: {
    ThemeItem,
    ColorPicker
  },
  data: () => ({
    themes: [],
    selectedCurrentTheme: undefined,
    selectedAvailableTheme: undefined
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
      'notify'
    ]),
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
    }
  }
}
</script>
