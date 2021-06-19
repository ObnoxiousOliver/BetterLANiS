<template>
  <div class="startmenu-component">
    <div
      @click="userDropdownOpen = !userDropdownOpen"
      @mouseleave="userDropdownOpen = false"
      class="user-info"
    >
      <!-- <div class="user-backdrop" /> -->
      <div class="user-avatar" />
      <h1 class="user-name">
        {{ loggedInUser.firstName }} {{ loggedInUser.lastName }}
      </h1>
      <button
        @click="$refs.userContextMenu.open()"
        class="user-menu-button context-menu-button"
      >
        <i class="bi-chevron-down" />
      </button>
      <context-menu ref="userContextMenu">
        <button @click="$emit('userinfo')"><i class="bi bi-person-fill"/> Benutzerinfo</button>
        <div class="divider" />
        <button @click="$emit('logout')" class="error">Abmelden <i class="fas fa-sign-out-alt"/></button>
      </context-menu>
    </div>
    <div class="app-list scroll y auto thin">
      <bl-button
        id="home"
        :class="['app-button', '/home' === $route.fullPath ? 'btn-primary btn-no-caps' : 'btn-transparent']"
        to="/home"
      >
        <i class="fas fa-home" /> Start
      </bl-button>

      <!-- LIST OF SUPPORTED APPS -->
      <div
        v-if="apps.supported"
        class="app-list-supported"
      >
        <h3 class="divider"><i class="fas fa-bars" /> Apps</h3>
        <div
          v-for="(app, index) in apps.supported"
          :key="index"
        >
          <bl-button
            @contextmenu="openAppMenu(app)"
            @click="addHistoryApp(app.name)"
            :id="app.name.toLowerCase().replaceAll(' ', '')"
            :class="['app-button', app.route === $route.fullPath || `/unsupported/${app.link.replaceAll('?', '&query:')}` === $route.fullPath ? 'btn-primary btn-no-caps' : 'btn-transparent']"
            :to="app.route"
          >
            <i :class="app.icon"></i>
            {{ app.name }}
          </bl-button>
        </div>
      </div>

      <!-- LIST OF UNSUPPORTED APPS -->
      <div
        v-if="apps.unsupported"
        class="app-list-unsupported"
      >
        <h3 class="divider"><i class="fas fa-ban" /> Nicht Unterstützte Apps</h3>
        <div
          v-for="(app, index) in apps.unsupported"
          :key="index"
        >
          <bl-button
            @contextmenu="openAppMenu(app)"
            @click="addHistoryApp(app.name)"
            :id="app.name.toLowerCase().replaceAll(' ', '')"
            :class="['app-button', `/unsupported/${app.link.replaceAll('?', '&query:')}` === $route.fullPath ? 'btn-primary btn-no-caps' : 'btn-transparent']"
            :to="`/unsupported/${app.link.replaceAll('?', '&query:')}`"
          >
            <i :class="app.icon"></i>
            {{ app.name }}
          </bl-button>
        </div>
      </div>
    </div>
    <context-menu ref="appMenu">
      <div class="header">{{currentApp.name}}</div>
      <button v-if="!favoriteApps.includes(currentApp.name)" @click="addFavoriteAppClick(currentApp)">
        <i class="bi-star" /> Zu Favoriten hinzufügen
      </button>
      <button v-else @click="removeFavoriteAppClick(currentApp)">
        <i class="bi-star-fill" /> Aus Favoriten entfernen
      </button>
      <div v-if="currentApp.route" class="divider" />
      <router-link :to="`/unsupported/${currentApp.link.replaceAll('?', '&query:')}`" v-if="currentApp.route">
        <i class="fas fa-globe-europe" /> Im internen Browser öffnen
      </router-link>
    </context-menu>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'StartMenu',
  computed: {
    ...mapState([
      'apps',
      'loggedInUser'
    ]),
    favoriteApps () {
      return this.apps.favorites
    }
  },
  data: () => ({
    userDropdownOpen: false,
    currentApp: undefined
  }),
  methods: {
    ...mapActions([
      'addFavoriteApp',
      'removeFavoriteApp',
      'addHistoryApp'
    ]),
    openAppMenu (app) {
      this.currentApp = app
      this.$refs.appMenu.open()
    },
    addFavoriteAppClick (app) {
      this.addFavoriteApp(app.name)
    },
    removeFavoriteAppClick (app) {
      this.removeFavoriteApp(app.name)
    }
  }
}
</script>
