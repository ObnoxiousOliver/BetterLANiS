<template>
  <div class="welcome-view-component">
    <div class="card">
      <div class="card-body">
        <div class="content">
          <div class="avatar" />
          <h3>Welcome</h3>
          <h1>{{ loggedInUser.firstName }} {{ loggedInUser.lastName }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import manager from '@/manager'

export default {
  name: 'Welcome',
  computed: {
    ...mapState([
      'loggedInUser'
    ])
  },
  methods: {
    ...mapActions([
      'setApps'
    ])
  },
  created () {
    manager.isLoggedIn((success) => {
      if (success) {
        this.setApps(() => {
          setTimeout(() => {
            this.$emit('changePage', 'Start')
          }, 1000)
        })
      } else {
        console.error('User not Logged In')
      }
    })
  }
}
</script>
