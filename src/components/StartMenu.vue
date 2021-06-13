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
        class="app-button"
        variant="transparent static"
        to="/home"
      >
        <i class="fas fa-home" /> Start
      </bl-button>
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
            :id="app.name.toLowerCase().replaceAll(' ', '')"
            class="app-button"
            variant="transparent static"
            :to="app.route"
          >
            <span v-html="app.html" />
          </bl-button>
        </div>
      </div>
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
            :id="app.name.toLowerCase().replaceAll(' ', '')"
            class="app-button"
            variant="transparent static"
            :to="`/unsupported/${app.link.replaceAll('?', '&query:')}`"
          >
            <i :class="app.icon"></i> {{ app.name }}
          </bl-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'StartMenu',
  computed: {
    ...mapState([
      'apps',
      'loggedInUser'
    ])
  },
  data: () => ({
    userDropdownOpen: false
  })
}
</script>
