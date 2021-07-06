<template>
  <div class="login-view-component">
    <fieldset :disabled="disableForm">
      <LoginForm
        ref="loginForm"
        @submit="formSubmitted"
      />
    </fieldset>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import LoginForm from '../components/LoginForm'

import manager from '@/manager'
const fs = require('fs')
const path = require('path')
const { remote } = require('electron')

const CONFIG_PATH = path.join(remote.app.getPath('userData'), 'Config')
const USERS_PATH = path.join(remote.app.getPath('userData'), 'Users')
const ACTIVE_USER_PATH = path.join(CONFIG_PATH, 'active')

export default {
  name: 'Login',
  components: {
    LoginForm
  },
  computed: {
    ...mapState([
      'savedUser'
    ])
  },
  data: () => ({
    disableForm: false,
    open: false
  }),
  mounted () {
    // this.$emit('changePage', 'Start')
    this.disableForm = true
    manager.isLoggedIn((success, err) => {
      if (err) {
        console.log(err)
        return
      }

      if (success) {
        this.setUserData({
          callback: () => {
            this.$emit('changePage', 'Welcome')
            this.disableForm = false
          }
        })
      } else {
        remote.session.defaultSession.clearStorageData()

        if (fs.existsSync(ACTIVE_USER_PATH)) {
          var userPath = fs.readFileSync(ACTIVE_USER_PATH).toString()

          if (fs.existsSync(path.join(USERS_PATH, userPath))) {
            var userData = JSON.parse(atob(fs.readFileSync(path.join(USERS_PATH, userPath))))
            this.login(userData.user.username, userData.user.password, userData.user.schoolId, true)
            return
          }
        }

        this.disableForm = false
      }
    })
  },
  methods: {
    ...mapActions([
      'setUserData'
    ]),
    formSubmitted (username, password, schoolId, rememberMe) {
      this.disableForm = true
      this.login(username, password, schoolId, rememberMe)
    },
    login (username, password, schoolId, rememberMe) {
      manager.loginLanis(username, password, schoolId, (success, err) => {
        if (err) {
          console.error(err)
          return
        }

        if (success) {
          this.setUserData({
            payload: {
              username, password, schoolId
            },
            callback: () => {
              this.$emit('changePage', 'Welcome')
              this.disableForm = false
              this.$router.push('/home')

              // Encrypt and save Logindata if remember me is checked
              if (rememberMe) {
                if (!fs.existsSync(CONFIG_PATH)) {
                  fs.mkdirSync(CONFIG_PATH)
                }

                // console.log('Writeing to', ACTIVE_USER_PATH, this.savedUser.path)
                fs.writeFileSync(ACTIVE_USER_PATH, this.savedUser.path)
              }
            }
          })
        } else {
          this.disableForm = false
          this.$refs.loginForm.wrongPassword()
          if (fs.existsSync(ACTIVE_USER_PATH)) {
            fs.unlinkSync(ACTIVE_USER_PATH)
          }
        }
      })
    }
  }
}
</script>
