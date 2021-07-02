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
          v-for="theme in displayedThemes"
          :key="theme.name" :theme="theme"
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
      <div class="theme-original">
        <i class="fas fa-gem" /> Originales Thema
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
            <bl-button class="download-btn" variant="primary no-caps">
              <i class="bi-download" /> Herunterladen
            </bl-button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import ThemeItem from '@/components/settings/themelibary/ThemeItem'
import Modal from '@/components/Modal'

import color from '@/color'
import { mapMutations, mapState } from 'vuex'

const { remote } = require('electron')

const githubAuthHeaders = {
  headers: {
    Authorization: remote.process.env.GITHUB_AUTH
  }
}

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
    selectedTheme: undefined
  }),
  mounted () {
    if (!this.theme.themeLibary.length) {
      this.fetchThemeLibary()
    } else {
      this.themes = this.theme.themeLibary
    }
  },
  watch: {
    themes: {
      deep: true,
      handler (newThemes) {
        this.setThemeLibary(newThemes)
      }
    }
  },
  methods: {
    ...mapMutations([
      'setThemeLibary'
    ]),
    fetchThemeLibary () {
      fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/branches`,
        githubAuthHeaders)
        .then(res => res.json())
        .then(branches => {
          branches.forEach(branch => {
            // Get Branch Details
            fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/branches/${branch.name}`, githubAuthHeaders)
              .then(res => res.json())
              .then(branchData => {
                // Get Manifest
                fetch(`https://raw.githubusercontent.com/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/${branch.name}/manifest.json`)
                  .then(res => res.json())
                  .then(manifest => {
                    if (!manifest.hidden) {
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
                        preview: manifest.preview
                      })
                    }
                  })
              })
          })
        })
    }
  }
}
</script>
