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
      <div v-if="themes.length">
        <ThemeItem
          @themeselected="selectedTheme = theme"
          style="display: inline-block;"
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
      :active="selectedTheme"
    >
      <template #header>
        {{ selectedTheme.displayName }}
      </template>
      v{{ selectedTheme.version }}
      by {{ selectedTheme.author }}<br>
      {{ selectedTheme.description }}
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

import { remote } from 'electron'

const githubAuthHeaders = {
  headers: {
    Authorization: 'Basic ' + btoa('*:' + remote.process.env.GITHUB_TOKEN)
  }
}

export default {
  name: 'ThemeLibary',
  components: {
    ThemeItem,
    Modal
  },
  computed: {
    displayedThemes () {
      return this.themes.filter(x => {
        if (this.searchString.trim() !== '') {
          const keywords = this.searchString.trim().toLowerCase().split(' ')
          return keywords.every(key =>
            x.displayName.toLowerCase().includes(key) ||
            x.name.toLowerCase().includes(key) ||
            x.author.toLowerCase().includes(key))
        } else return true
      })
    }
  },
  data: () => ({
    themes: [],
    searchString: '',
    selectedTheme: undefined
  }),
  mounted () {
    this.fetchBranches(branches => {
      branches.forEach(branch => {
        // Get Branch Details
        fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/branches/${branch.name}`, githubAuthHeaders)
          .then(res => res.json())
          .then(branchData => {
            // Get Branch Tree
            fetch(branchData.commit.commit.tree.url, githubAuthHeaders)
              .then(res => res.json())
              .then(tree => {
                // Get manifest.json
                var manifestFileInfo = tree.tree
                  .filter(x => x.type === 'blob')
                  .filter(x => x.path === 'manifest.json')[0]
                if (manifestFileInfo) {
                  // Get Manifest Blob
                  fetch(manifestFileInfo.url, githubAuthHeaders)
                    .then(res => res.json())
                    .then(manifestBlob => {
                      var manifest = JSON.parse(atob(manifestBlob.content))
                      console.log(manifest)

                      if (!manifest.hidden) {
                        this.themes.push({
                          name: branch.name,
                          displayName: manifest.name,
                          version: manifest.version,
                          author: manifest.author,
                          description: manifest.description
                        })
                      }
                    })
                }
              })
          })
      })
    })
  },
  methods: {
    fetchBranches (cb) {
      fetch(`https://api.github.com/repos/${remote.process.env.BL_REPO_USERNAME}/${remote.process.env.BL_THEMES_REPO_NAME}/branches`,
        githubAuthHeaders)
        .then(res => res.json())
        .then(data => cb(data))
    }
  }
}
</script>
