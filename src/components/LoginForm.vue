<template>
  <div class="loginform-component">
    <div class="card">
      <div class="card-header">
        <transition
          name="header-fade"
          mode="out-in"
        >
          <div
            v-if="school.showMenu"
            class="school-select-header"
          >
            <bl-button
              id="returnToLoginBtn"
              variant="transparent small"
              @click="school.showMenu = false"
            >
              <i class="bi bi-chevron-left" />
            </bl-button>
            Schulauswahl
          </div>
          <div
            v-else
            class="login-header"
          >
            <i class="fas fa-unlock-alt" /> Anmeldung
          </div>
        </transition>
      </div>
      <div class="card-body">
        <transition
          name="body-fade"
          mode="out-in"
        >
          <div
            v-if="school.showMenu"
            class="school-select"
          >
            <div class="search-field">
              <input
                v-model="search.searchString"
                class="input-field"
                placeholder="Suchen..."
                spellcheck="false"
              >
            </div>
            <div
              v-if="schoolList !== null"
              class="scroll y show"
            >
              <div
                v-if="search.shownSchools.length === 0 && search.searchArgs.length > 0"
                class="nothing-found"
              >
                <span v-if="search.searchString.toLowerCase() === 'aminollah'">
                  Keine sorge. Du wirst ihn nicht hier finden.
                </span>
                <span v-else-if="search.searchString.toLowerCase() === 'emir'">
                  Keine Ahnung wo der ist, <br>
                  aber ich weiß wo Aminollah ist...
                </span>
                <span v-else>Keine Suchergebnisse gefunden</span>
              </div>
              <div
                v-for="district in schoolList"
                :key="district.Id"
                class="district"
              >
                <div
                  v-if="search.searchArgs.length <= 0"
                  class="district-header"
                  tabindex="0"
                  @click="toggleDistrict(district.Name)"
                  @keyup.enter="toggleDistrict(district.Name)"
                >
                  <div
                    :class="[
                      'toggle-btn',
                      school.openDistrict === district.Name ? 'open' : '',
                    ]"
                  >
                    <i class="bi bi-chevron-down" />
                  </div>
                  <h2 class="district-name">
                    {{ district.Name }}
                  </h2>
                </div>
                <div
                  v-if="school.openDistrict === district.Name || search.searchArgs.length > 0"
                  class="district-body"
                >
                  <div
                    v-for="schoolInList in district.Schulen"
                    :key="schoolInList.Id"
                  >
                    <bl-button
                      v-if="
                        search.searchArgs.length > 0
                          ? search.shownSchools.includes(schoolInList.Id)
                          : true
                      "
                      class="school"
                      :variant="
                        'small nospacing ' +
                          (school.id === schoolInList.Id ? 'primary no-caps' : 'transparent')
                      "
                      @click="schoolSelected(schoolInList, district)"
                    >
                      <div>
                        <div class="school-name">
                          {{ schoolInList.Name }}
                        </div>
                        <div class="school-location">
                          {{ district.Name }} | {{ schoolInList.Ort }}
                        </div>
                      </div>
                    </bl-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              Loading
            </div>
          </div>
          <div
            v-else
            class="login"
            @keyup.enter="submit()"
          >
            <div class="selected-school">
              <div v-if="school.selectedSchool">
                <div class="school-name">
                  {{ school.selectedSchool.name }}
                </div>
                <div class="school-location">
                  {{ school.selectedSchool.district }} |
                  {{ school.selectedSchool.location }}
                </div>
              </div>
              <div v-else>
                <transition
                  name="not-filled-warning"
                  mode="out-in"
                >
                  <div
                    v-if="noSchoolWarning"
                    class="no-school"
                  >
                    Keine Schule ausgewählt
                  </div>
                </transition>
              </div>
            </div>
            <div class="container">
              <input
                id="username"
                v-model="username"
                class="input-field"
                type="text"
                placeholder="Benutzername"
                spellcheck="false"
              >
              <input
                id="password"
                v-model="password"
                class="input-field"
                type="password"
                placeholder="Passwort"
              >
            </div>
            <div class="container">
              <input
                id="stayLoggedIn"
                name="stayLoggedIn"
                v-model="rememberMe"
                type="checkbox"
                class="input-toggle"
              >
              <label for="stayLoggedIn">Angemeldet bleiben</label>
            </div>
            <div class="container">
              <div class="no-credentials">
                <transition
                  name="not-filled-warning"
                  mode="out-in"
                >
                  <div v-if="noCredentialsWarning">
                    {{ noCredentialsWarning }}
                  </div>
                </transition>
              </div>
              <bl-button
                id="loginBtn"
                variant="primary gloss"
                @click="submit()"
              >
                Einloggen <i class="fas fa-sign-in-alt" />
              </bl-button>
              <div class="buttons">
                <bl-button
                  id="schoolSelectBtn"
                  variant="small"
                  @click="school.showMenu = true"
                >
                  Zur Schulauswahl <i class="fas fa-map-marker-alt" />
                </bl-button>
                <!-- PASSWORD FORGOT -->
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'LoginForm',
  data: () => ({
    username: '',
    password: '',
    rememberMe: false,

    school: {
      id: '',
      selectedSchool: undefined
    },

    schoolSelect: {
      showMenu: false,
      selectedSchool: undefined,
      openDistrict: ''
    },

    search: {
      searchString: '',
      searchArgs: [],
      shownSchools: []
    },

    noSchoolWarning: true,
    noCredentialsWarning: undefined
  }),
  computed: {
    ...mapState([
      'schoolList'
    ]),
    searchString () {
      return this.search.searchString
    }
  },
  watch: {
    searchString (str) {
      this.search.searchArgs = str.trim().length > 0 ? str.split(' ') : []

      this.search.shownSchools = []

      if (this.search.searchArgs.length === 0) return

      var schools = []
      this.schoolList.forEach((district) => {
        schools = schools.concat(
          district.Schulen.map((school) => {
            school.district = district.Name
            return school
          })
        )
      })

      schools.forEach((school) => {
        const searchText = `${school.Id} ${school.Name} ${school.district} ${school.Ort}`
        if (
          this.search.searchArgs.filter(
            (arg) =>
              searchText.toLowerCase().includes(arg.toLowerCase()) === false
          ) >= 0
        ) { this.search.shownSchools.push(school.Id) }
      })

      this.search.shownSchools = this.search.shownSchools.splice(0, 50)
    }
  },
  methods: {
    submit () {
      if (!this.school.id) {
        this.noSchoolWarning = false
        setTimeout(() => {
          this.noSchoolWarning = true
        }, 0)
        return
      }

      if (!this.username || !this.password) {
        this.noCredentialsWarning = undefined
        setTimeout(() => {
          this.noCredentialsWarning =
            'Kein Benutzername oder Password angegenben'
        }, 0)
        return
      }

      this.$emit(
        'submit',
        this.username,
        this.password,
        this.school.id,
        this.rememberMe
      )
    },
    schoolSelected (school, district) {
      this.school.id = school.Id
      this.school.selectedSchool = {
        id: school.Id,
        name: school.Name,
        district: district.Name,
        location: school.Ort
      }
      this.school.showMenu = false
    },
    toggleDistrict (district) {
      this.school.openDistrict = this.school.openDistrict === district ? '' : district
    },
    wrongPassword () {
      this.noCredentialsWarning = undefined
      setTimeout(() => {
        this.noCredentialsWarning = 'Benutzername oder Password ist falsch'
      }, 0)
    }
  }
}
</script>
