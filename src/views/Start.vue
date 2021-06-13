<template>
  <div class="start-view-component">
    <StartMenu @logout="logoutConfirmOpen = true" @userinfo="userinfoOpen = true" />
    <div class="router-view">
      <router-view v-slot="{ Component }">
        <transition name="router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <Modal
      :active="userinfoOpen"
      @closemodal="userinfoOpen = false"
    >
      <template #header><i class="bi bi-person-fill"/> Benuterinfo</template>
      <div class="user-info-panel">
        <table>
          <tr>
            <td>Benutzername</td>
            <td>{{ loggedInUser.username }}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{{ loggedInUser.firstName }} {{ loggedInUser.lastName }}</td>
          </tr>
          <tr>
            <td>Geburtstag</td>
            <td>{{ birthday }}</td>
          </tr>
          <tr>
            <td>Stufe</td>
            <td>{{ loggedInUser.grade }}</td>
          </tr>
          <tr>
            <td>Klasse</td>
            <td>{{ loggedInUser.class }}</td>
          </tr>
          <tr>
            <td>Geschlecht</td>
            <td>
              <span v-if="loggedInUser.gender === 'männlich'">
                <i class="fas fa-mars" />
                männlich
              </span>
              <span v-else-if="loggedInUser.gender === 'weiblich'">
                <i class="fas fa-venus" />
                weiblich
              </span>
              <span v-else>
                {{ loggedInUser.gender }}
              </span>
            </td>
          </tr>
        </table>
      </div>
    </Modal>
    <Modal
      :active="logoutConfirmOpen"
      @closemodal="logoutConfirmOpen = false"
      variant="error"
    >
      <template #header>Abmelden <i class="fas fa-sign-out-alt"/></template>
      <div class="logout-confirm">
        Bist du sicher, dass du dich abmelden möchtest?<br>
      </div>
      <template #footer>
        <div class="modal-footer">
          <div class="modal-buttons">
            <bl-button @click="logoutConfirmOpen = false" variant="static small transparent">Abbrechen</bl-button>
            <bl-button @click="logoutClick" variant="error static">Abmelden <i class="fas fa-sign-out-alt"/></bl-button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import StartMenu from '@/components/StartMenu'
import Modal from '@/components/Modal'
import moment from 'moment'
import manager from '@/manager'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Start',
  components: {
    StartMenu,
    Modal
  },
  computed: {
    ...mapState([
      'loggedInUser'
    ]),
    birthday () {
      return moment(this.loggedInUser.birthday, 'DD.MM.YYYY').format('DD.MM.YYYY')
    }
  },
  data: () => ({
    userinfoOpen: false,
    logoutConfirmOpen: false
  }),
  mounted () {
    this.checkLoggedIn()
    window.addEventListener('focus', this.checkLoggedIn)
  },
  beforeUnmount () {
    window.removeEventListener('focus', this.checkLoggedIn)
  },
  methods: {
    ...mapActions([
      'logout'
    ]),
    checkLoggedIn () {
      manager.isLoggedIn(success => {
        if (!success) {
          this.$emit('changePage', 'Login')
        }
      })
    },
    logoutClick () {
      this.logout()
      this.$emit('changePage', 'Login')
    }
  }
}
</script>
