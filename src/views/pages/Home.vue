<template>
  <div class="home-view-component scroll auto">
    <div class="wrapper">
      <h1 class="app-header"><i class="fas fa-home" /> Startseite</h1>
      <div class="card card-warning card-low">
        <div class="card-header">
          <i class="fas fa-exclamation-triangle"/> Achtung
        </div>
        <div class="card-body">
          Diese Version steht noch unter starker Entwickelung.
        </div>
      </div>
      <div class="section-header">
        <h2>Favoriten</h2>
      </div>
      <div v-if="favoriteApps.length" class="favorite-apps app-card-list scroll x auto">
        <transition-group
          name="app"
          tag="div"
        >
          <AppCard
            v-for="app in favoriteApps"
            :key="app.name"
            :icon="app.icon"
            :to="app.route ? app.route : `/unsupported/${app.link.replaceAll('?', '&query:')}`"
          >
            {{ app.name }}
          </AppCard>
        </transition-group>
      </div>
      <div class="no-favorites" v-else>
        <i>Keine Favoriten eingespeichert</i>
        <bl-button variant="primary">
          <i class="bi-plus" /> Favoriten anlegen
        </bl-button>
      </div>
      <div class="section-header">
        <h2>Zuletzt verwendete Apps</h2>
      </div>
      <div class="recent-apps app-card-list scroll x auto">
        <transition-group
          name="app"
          tag="div"
        >
          <AppCard icon="bi-calendar2-week-fill">
            Kalendar
          </AppCard>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import AppCard from '@/components/AppCard'

export default {
  name: 'Home',
  components: {
    AppCard
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

      var favoriteApps = [];

      [...this.apps.favorites, 'Hello'].forEach(app => {
        if (apps[apps.map(x => x.name).indexOf(app)]) {
          favoriteApps.push(apps[apps.map(x => x.name).indexOf(app)])
        }
      })

      return favoriteApps.reverse()
    }
  },
  methods: {
    ...mapActions([
      'notify'
    ])
  }
}
</script>
