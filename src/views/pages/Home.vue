<template>
  <div class="home-view-component scroll auto">
    <div class="wrapper" ref="wrapper">
      <h1 class="app-header"><i class="fas fa-home" /> Startseite</h1>
      <div class="card card-warning card-low">
        <div class="card-header">
          <i class="fas fa-exclamation-triangle"/> Achtung
        </div>
        <div class="card-body">
          Diese Version steht noch unter starker Entwickelung.
        </div>
      </div>

      <div :class="['main', recentApps.length ? '' : 'no-sidebar']">
        <!-- FAVORITE APPS -->
        <div class="favorite-apps">
          <div class="section-header">
            <h2><i class="bi-suit-heart" /> Favoriten</h2>
            <bl-button @click="favoritesModalOpen = true" variant="transparent small">
              <i class="bi-plus-circle" />
            </bl-button>
          </div>
          <AppCardList v-if="favoriteApps.length">
            <AppCard
              @click="addHistoryApp(app.name)"
              v-for="app in favoriteApps"
              :key="app.name"
              :icon="app.icon"
              :to="app.route ? app.route : `/unsupported/${app.link.replaceAll('?', '&query:')}`"
              :style="{
                '--background': app.color,
                '--color': color.getContrastYIQ(app.color)
              }"
            >
              {{ app.name }}
            </AppCard>
          </AppCardList>
          <div v-else class="no-favorites">
            <i>Keine Favoriten eingespeichert</i>
            <bl-button @click="favoritesModalOpen = true" variant="primary">
              <i class="bi-suit-heart" /> Favoriten anlegen
            </bl-button>
          </div>
        </div>

        <div v-for="folder in getFolders" :key="folder">
          <div class="section-header">
            <h2>
              <i :class="folder.icon" /> {{ folder.name }}
            </h2>
          </div>
          <AppCardList>
            <AppCard
              @click="addHistoryApp(app.name)"
              v-for="app in folder.apps"
              :key="app.name"
              :icon="app.icon"
              :to="app.route ? app.route : `/unsupported/${app.link.replaceAll('?', '&query:')}`"
              :style="{
                '--background': app.color,
                '--color': color.getContrastYIQ(app.color)
              }"
            >
              {{ app.name }}
            </AppCard>
          </AppCardList>
        </div>
      </div>

      <div v-if="recentApps.length" class="sidebar">
        <!-- RECENT APPS -->
        <AppButtonList class="recent-apps">
          <template #header>
            <i class="bi-clock-history" /> Zuletzt verwendete Apps
          </template>
          <AppButton
            @click="addHistoryApp(app.name)"
            v-for="app in recentApps"
            :key="app.name"
            :icon="app.icon"
            :to="app.route ? app.route : `/unsupported/${app.link.replaceAll('?', '&query:')}`"
            :style="{
              '--background': app.color,
              '--color': color.getContrastYIQ(app.color)
            }"
          >
            {{ app.name }}
          </AppButton>
        </AppButtonList>
      </div>
    </div>

    <Modal
      @closemodal="favoritesModalOpen = false"
      :active="favoritesModalOpen"
      :nofocus="[$refs.wrapper]"
      class="favorite-app-modal"
    >
      <template #header>
        <i class="bi-suit-heart" /> Favoriten
      </template>
      <div class="scroll y auto">
        <bl-button
          v-for="app in allApps"
          :key="app.name"
          :class="[
            'favorite-app-button',
            this.apps.favorites.includes(app.name) ? 'is-favorite' : ''
          ]"
          variant="transparent"
          @click="favoriteAppClick(app.name)"
        >
          <i :class="app.icon" />
          <span class="app-name">{{ app.name }}</span>
          <i
            v-if="this.apps.favorites.includes(app.name)"
            class="heart-icon bi-suit-heart-fill"
          />
          <i v-else class="heart-icon bi-suit-heart" />
        </bl-button>
      </div>
      <div class="favorite-info">
        Mit Rechts Klick auf die Apps in der Seitenleiste kannst du sie zu den Favoriten hinzufügen.
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import color from '@/color'

import AppCard from '@/components/AppCard'
import AppCardList from '@/components/AppCardList'
import AppButton from '@/components/AppButton'
import AppButtonList from '@/components/AppButtonList'
import Modal from '@/components/Modal'

export default {
  name: 'Home',
  components: {
    AppCard,
    AppCardList,
    AppButtonList,
    AppButton,
    Modal
  },
  computed: {
    ...mapState([
      'apps',
      'loggedInUser'
    ]),
    favoriteApps () {
      var supported = []

      for (var key in this.apps.supported) {
        supported.push(this.apps.supported[key])
      }

      var apps = [
        ...supported,
        ...this.apps.unsupported
      ]

      var favoriteApps = []
      console.log(this.apps)
      this.apps.favorites.forEach(app => {
        if (apps[apps.map(x => x.name).indexOf(app)]) {
          favoriteApps.push(apps[apps.map(x => x.name).indexOf(app)])
        }
      })

      return favoriteApps.reverse()
    },
    recentApps () {
      var supported = []

      for (var key in this.apps.supported) {
        supported.push(this.apps.supported[key])
      }

      var apps = [
        ...supported,
        ...this.apps.unsupported
      ]

      var recentApps = []

      this.apps.history.forEach(app => {
        if (apps[apps.map(x => x.name).indexOf(app)]) {
          recentApps.push(apps[apps.map(x => x.name).indexOf(app)])
        }
      })

      return recentApps.reverse()
    },
    allApps () {
      var supported = []

      for (var key in this.apps.supported) {
        supported.push(this.apps.supported[key])
      }

      return [
        ...supported,
        ...this.apps.unsupported
      ]
    },
    getFolders () {
      console.log(this.apps.folders)

      var folders = this.apps.folders.map(x => ({
        ...x,
        apps: []
      }))

      this.allApps.forEach(app => {
        folders.filter(x => app.folders.includes(x.name)).forEach(x => {
          x.apps.push(app)
        })
      })

      return folders
    },
    color () {
      return color
    }
  },
  data: () => ({
    favoritesModalOpen: false
  }),
  methods: {
    ...mapActions([
      'addFavoriteApp',
      'removeFavoriteApp',
      'addHistoryApp',
      'notify'
    ]),
    favoriteAppClick (app) {
      if (this.apps.favorites.includes(app)) {
        this.removeFavoriteApp(app)
      } else {
        this.addFavoriteApp(app)
      }
    }
  }
}
</script>
