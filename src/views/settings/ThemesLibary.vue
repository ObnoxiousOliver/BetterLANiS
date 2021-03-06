<template>
  <div class="theme-libary-view-component">
    <div class="wrapper">
      <h1 class="setting-page-header"><i class="fas fa-swatchbook" /> Themen Bibliothek</h1>
      <input
        v-model="searchString"
        class="input-field theme-search"
        type="text"
        placeholder="Suchen..."
      >
      <div v-if="themes.length" class="theme-list">
        <ThemeItem
          @themeselected="selectedTheme = theme"
          @download="downloadThemeClick(theme)"
          v-for="theme in displayedThemes"
          :key="theme.name"
          :theme="theme"
          :isInstalled="isInstalled(theme.name)"
        />
      </div>
      <div v-else>
        <div class="loader" />
        Lade...
      </div>
    </div>

    <Modal
      @closemodal="selectedTheme = undefined"
      :active="selectedTheme !== undefined"
      class="selected-theme-modal"
    >
      <template #header>
        <div v-if="selectedTheme.preview" class="theme-image" :style="{ color: selectedTheme.preview['1'] }">
          <div class="theme-color1" :style="{ color: selectedTheme.preview['2'] }" />
          <div class="theme-color2" :style="{ color: selectedTheme.preview['3'] }" />
        </div>
        <div v-else class="theme-image" />
      </template>
      <div class="theme-icon">
        <img
          v-if="selectedTheme.iconHref"
          :src="selectedTheme.iconHref"
        >
        <div
          v-else-if="selectedTheme.preview"
          class="icon-placeholder"
          :style="{ color: selectedTheme.preview['1'] }"
        >
          <i
            class="fas fa-swatchbook"
            :style="{ color: color.getContrastYIQ(selectedTheme.preview['1']) }"
          />
        </div>
        <div v-else class="icon-placeholder">
          <i class="fas fa-swatchbook" />
        </div>
      </div>
      <div class="theme-tags">
        <span v-if="selectedTheme.author === 'ObnoxiousOliver'" class="theme-original">
          <i class="fas fa-gem" /> Originales Thema<br>
        </span>
        <span v-if="isInstalled(selectedTheme.name)" class="theme-installed">
          <i class="fas fa-check" /> Installiert<br>
        </span>
      </div>
      <div class="theme-info">
        <div class="theme-header">
          <h3 class="theme-name">{{ selectedTheme.displayName }}</h3>
          <span class="theme-original-name"> ({{ selectedTheme.name }})</span>
        </div>
        <div class="theme-details">
          <span class="theme-version">{{ selectedTheme.version }}</span> <span class="theme-author">by {{ selectedTheme.author }}</span>
        </div>
        <div class="theme-description">
          <span v-if="selectedTheme.description">{{ selectedTheme.description }}</span>
          <span v-else class="no-description">Keine Beschreibung</span>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <div class="modal-buttons">
            <bl-button
              @click="downloadThemeClick(selectedTheme)"
              v-if="selectedTheme.downloadUrl"
              class="download-btn"
              :variant="isInstalled(selectedTheme.name) ? 'small' : 'primary' + ' no-caps'"
            >
            <i class="bi-download" />
            <span> Herunterladen</span>
            </bl-button>
            <bl-button
              @click="$emit('openSettings', 'Appearance')"
              v-if="isInstalled(selectedTheme.name)"
              variant="primary no-caps"
            >
              Anwenden
            </bl-button>
          </div>
        </div>
      </template>
    </Modal>

    <transition name="info-box">
      <div v-if="downloadingTheme" class="info-box-component">
          <div class="info-box">
            <h2>Downloading - {{ downloadingTheme.name }}</h2>
            <progress class="progress-bar" :value="downloadingTheme.progress" />
          </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ThemeItem from '@/components/settings/themelibary/ThemeItem'
import Modal from '@/components/Modal'

import color from '@/color'
import { mapActions, mapMutations, mapState } from 'vuex'

const { remote, ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')
const extract = require('extract-zip')
const chokidar = require('chokidar')

const githubAuthHeaders = {
  headers: {
    Authorization: remote.process.env.GITHUB_AUTH
  }
}

var watcher

export default {
  name: 'ThemeLibary',
  components: {
    ThemeItem,
    Modal
  },
  computed: {
    ...mapState([
      'theme'
    ]),
    color () {
      return color
    },
    displayedThemes () {
      return this.themes.filter(x => {
        if (this.searchString.trim() !== '') {
          const keywords = this.searchString.trim().toLowerCase().split(' ')
          return keywords.every(key =>
            x.displayName.toLowerCase().includes(key) ||
            x.name.toLowerCase().includes(key) ||
            x.author.toLowerCase().includes(key))
        } else return true
      }).sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
  },
  data: () => ({
    themes: [],
    searchString: '',
    selectedTheme: undefined,
    downloadingTheme: undefined,
    installedThemes: undefined
  }),
  mounted () {
    this.installedThemes = fs.readdirSync(this.theme.path).filter(x => x.endsWith('.bl-theme'))

    if (!this.theme.themeLibary.length) {
      this.fetchThemeLibary()
    } else {
      this.themes = this.theme.themeLibary
    }

    watcher = chokidar.watch(this.theme.path, {
      ignored: /^\./,
      persistent: true
    })

    watcher.on('add', (e) => {
      this.installedThemes = fs.readdirSync(this.theme.path).filter(x => x.endsWith('.bl-theme'))
    })
    watcher.on('unlink', (e) => {
      this.installedThemes = fs.readdirSync(this.theme.path).filter(x => x.endsWith('.bl-theme'))
    })
  },
  unmounted () {
    watcher.unwatch(this.theme.path)
    watcher.close()
  },
  watch: {
    themes: {
      deep: true,
      handler (val) {
        this.setThemeLibary(val)
      }
    }
  },
  methods: {
    ...mapMutations([
      'setThemeLibary'
    ]),
    ...mapActions([
      'notify'
    ]),
    fetchThemeLibary () {
      fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/releases`, githubAuthHeaders)
        .then(res => res.json())
        .then(releases => {
          fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/branches`,
            githubAuthHeaders)
            .then(res => res.json())
            .then(branches => {
              branches.filter(x => x.name !== 'master').forEach(branch => {
                // Get Manifest
                fetch(`https://raw.githubusercontent.com/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/${branch.name}/manifest.json`)
                  .then(res => res.json())
                  .then(manifest => {
                    if (!manifest.hidden) {
                      var downloadUrl
                      try {
                        downloadUrl = releases.filter(x => x.target_commitish === branch.name)[0].assets.filter(x => x.name.endsWith('.bl-theme.zip'))[0].url

                        this.themes.push({
                          name: branch.name,
                          displayName: manifest.name,
                          version: manifest.version,
                          author: manifest.author,
                          description: manifest.description,
                          icon: manifest.icon,
                          iconHref: manifest.icon
                            ? `https://raw.githubusercontent.com/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/${branch.name}/${manifest.icon}`
                            : undefined,
                          preview: manifest.preview,
                          downloadUrl
                        })
                      } catch {}
                    }
                  })
              })
            })
        })
    },
    downloadThemeClick (themeToDownload) {
      if (!this.downloadingTheme) {
        this.downloadTheme(themeToDownload, (status, theme) => {
          switch (status.state) {
            case 'loading':
              this.downloadingTheme = {
                ...theme,
                progress: status.progress
              }
              break
            case 'finished':
              this.downloadingTheme = undefined
              break
          }
        })
      }
    },
    downloadTheme (theme, status) {
      status({
        state: 'loading',
        progress: 0
      }, theme)

      const dest = path.join(this.theme.path, theme.name + '.bl-theme')
      const zipDest = dest + '.zip'

      ipcRenderer.send('downloadFile', theme.downloadUrl, zipDest)

      function downloadFileStatus (e, downloadStatus) {
        status({
          state: 'loading',
          progress: downloadStatus.progress
        }, theme)
      }

      ipcRenderer.on('downloadFileStatus', downloadFileStatus)

      ipcRenderer.once('downloadFileFinished', (e, err) => {
        ipcRenderer.removeListener('downloadFileStatus', downloadFileStatus)

        var sizeUnzipped = 0

        extract(zipDest, {
          dir: dest,
          onEntry (entry, file) {
            sizeUnzipped += entry.compressedSize
            status({
              state: 'loading',
              progress: sizeUnzipped / file.fileSize
            }, theme)
          }
        })
          .then(() => {
            fs.unlinkSync(zipDest)
            status({ state: 'finished' }, theme)
          })

        if (err) {
          this.notify({
            title: theme.name,
            message: err,
            style: 'error'
          })
        }
      })
    },
    isInstalled (theme) {
      return this.installedThemes.includes(theme + '.bl-theme')
    }
  }
}
</script>
