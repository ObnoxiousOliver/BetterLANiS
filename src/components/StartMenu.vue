<template>
  <div class="startmenu-component">
    <div
      @click="userDropdownOpen = !userDropdownOpen"
      @mouseleave="userDropdownOpen = false"
      class="user-info"
    >
      <div class="avatar" />
      <div class="dropdown">
        <h4 class="dropdown-head">
          {{ loggedInUser.firstName }} {{ loggedInUser.lastName }}
        </h4>
        <i class="arrow bi bi-chevron-down" />
        <transition name="dropdown-body">
          <div
            v-if="userDropdownOpen"
            class="dropdown-body"
          >
            <bl-button @click="$emit('userinfo')" variant="transparent static"><i class="bi bi-person-fill"/> Benutzerinfo</bl-button>
            <div class="divider"></div>
            <bl-button @click="$emit('logout')" variant="transparent static error">Abmelden <i class="fas fa-sign-out-alt"/></bl-button>
          </div>
        </transition>
      </div>
    </div>
    <div class="scroll y auto thin">
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
