<template>
  <div class="unsupported-view-component">
    <div class="browser" :style="{ opacity: pageLoading ? '0' : '1' }">
      <iframe
        @load="iframeLoad"
        ref="viewer"
        :src="sourceUrl"
      />
    </div>
    <PageControls
      @back="$refs.viewer.contentWindow.history.back(); this.pageLoading = true"
      @refresh="$refs.viewer.contentWindow.location.reload(); this.pageLoading = true"
      @style="disableStyle"
      @styleOptions="(e) => $refs.styles.open(e)"
      :location="location"
      :loading="pageLoading"
      :styleDisabled="styleDisabled"
    />
    <context-menu :stayActive="true" class="style-options-menu" ref="styles">
      <div class="header">
        Browser Themen
        <button @click="$refs.styles.close()" class="context-menu-close-btn">
          <i class="bi-x" />
        </button>
      </div>
      <div class="input-container">
        <label class="input-label" for="injectThemes">Browser Themen aktiviert</label>
        <input class="input-toggle" type="checkbox" id="injectThemes" v-model="styleActiveGlobal">
      </div>
      <button @click="disableStyle" :disabled="!styleActiveGlobal">
        <span v-if="styleDisabled">Thema für diese Seite anschalten</span>
        <span v-else>Thema für diese Seite ausschalten</span>
      </button>
      <div class="divider">Themen sind ausgeschaltet auf den Seiten:</div>
      <transition-group
        tag="div"
        :class="['style-options-list scroll y auto thin', !styleActiveGlobal ? 'disabled' : '']"
        name="style-options-page-item"
      >
        <button
          class="style-options-page-item"
          :disabled="!styleActiveGlobal"
          @click="styleDisabledSites.splice(index, 1)"
          v-for="(item, index) in styleDisabledSites"
          :key="item"
          :title="item"
        >
          <div class="page-item-name">
            {{ item }}
          </div>
          <i class="bi-x page-item-remove-icon" />
        </button>
      </transition-group>
    </context-menu>

    <!-- Get Update when Theme Changes -->
    {{ JSON.stringify(theme).replace(/.*/g, '') }}
  </div>
</template>

<script>
import PageControls from '@/components/PageControls'

import manager from '@/manager'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Unsupported',
  components: {
    PageControls
  },
  data: () => ({
    pageLoading: false,
    setUrl: false,
    location: undefined,
    styleDisabled: false,
    styleActiveGlobal: true,
    styleDisabledSites: []
  }),
  computed: {
    ...mapState([
      'theme',
      'savedUser'
    ]),
    sourceUrl () {
      if (this.$route.params.link && this.setUrl) {
        return manager.urls.BASE_ADDRESS + this.$route.params.link.replaceAll('&query:', '?')
      } else {
        return undefined
      }
    },
    allowedLinks () {
      return [
        /(start|login)\.schulportal\.hessen\.de/gi,
        /mo\d{4}\.schule\.hessen\.de/gi
      ]
    }
  },
  watch: {
    sourceUrl () {
      this.pageLoading = true
    },
    styleDisabled () {
      this.injectCss(!this.styleDisabled)
    },
    styleDisabledSites: {
      deep: true,
      handler () {
        if (!this.styleActiveGlobal) {
          this.styleDisabled = true
          return
        }
        this.styleDisabled = this.styleDisabledSites.includes(this.location.host + this.location.pathname)

        var savedUserData = this.savedUser.data
        savedUserData.styleDisabledSites = this.styleDisabledSites

        this.setSavedUserData(savedUserData)
      }
    },
    styleActiveGlobal () {
      if (!this.styleActiveGlobal) {
        this.styleDisabled = true
      } else {
        this.styleDisabled = this.styleDisabledSites.includes(this.location.host + this.location.pathname)
      }
    }
  },
  mounted () {
    this.setUrl = true
    try {
      this.styleDisabledSites = this.savedUser.data.styleDisabledSites
      if (!this.styleDisabledSites) {
        this.styleDisabledSites = []
      }
    } catch {}
  },
  updated () {
    this.injectCss(!this.styleDisabled)
  },
  methods: {
    ...mapActions([
      'setSavedUserData'
    ]),
    writeEvent (e) {
      console.log(e)
    },
    iframeLoad (e) {
      this.pageLoading = false

      const frame = e.target.contentWindow
      this.location = frame.location

      frame.onunload = this.iframeUnload

      if (this.styleActiveGlobal) {
        this.styleDisabled = this.styleDisabledSites.includes(this.location.host + this.location.pathname)
      } else this.styleDisabled = true

      this.injectCss(!this.styleDisabled)
      frame.document.documentElement.setAttribute('frame-host', frame.location.host)
      frame.document.documentElement.setAttribute('frame-path', frame.location.pathname)

      // A-tags open Browser
      frame.document.querySelectorAll('a').forEach(el => {
        // console.log(el.href, this.allowedLinks.filter(x => el.href.match(x)))
        if (!this.allowedLinks.filter(x => el.href.match(x)).length) {
          el.target = '_blank'
        } else {
          el.target = ''
        }
      })
    },
    iframeUnload (e) {
      this.pageLoading = true
    },
    injectCss (inject) {
      try {
        const frame = this.$refs.viewer.contentWindow

        /* eslint import/no-webpack-loader-syntax: off */
        const injectCss = require('!!raw-loader!@/assets/browser_inject/browser_inject.css').default

        var rootVars = Array.from(document.styleSheets)
          .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
          .reduce((acc, sheet) => (
            acc = [
              ...acc, ...Array.from(sheet.cssRules)
                .reduce((def, rule) => (
                  def = rule.selectorText === ':root'
                    ? [...def, ...Array.from(rule.style).filter(name => name.startsWith('--'))]
                    : def),
                [])
            ]),
          [])

        frame.document.querySelectorAll('#bl-injected-styles').forEach(x => x.remove())
        var style = frame.document.createElement('style')
        style.id = 'bl-injected-styles'

        style.innerHTML = `[frame-host='start.schulportal.hessen.de'] .navbar-custom,
          [frame-host='start.schulportal.hessen.de'] .header-top,
          [frame-host='start.schulportal.hessen.de'] .ccm-page #header .header-top.header-top-colored,
          [frame-host='start.schulportal.hessen.de'] .sticky-wrapper,
          [frame-host='start.schulportal.hessen.de'] .footer,
          [frame-host='start.schulportal.hessen.de'] #headlogo {
            display: none !important;
          }\n`

        if (inject) {
          style.innerHTML += ':root {\n' +
            rootVars
              .map(x => `${x}: ${getComputedStyle(document.documentElement).getPropertyValue(x)};`)
              .join('\n') +
          '}\n\n' + injectCss
        }

        frame.document.documentElement.append(style)
      } catch {}
    },
    disableStyle () {
      if (!this.styleActiveGlobal) {
        this.styleDisabled = true
        return
      }

      this.styleDisabled = !this.styleDisabled
      if (this.styleDisabled) {
        this.styleDisabledSites.push(this.location.host + this.location.pathname)
      } else {
        this.styleDisabledSites = this.styleDisabledSites.filter(x => x !== this.location.host + this.location.pathname)
      }
    }
  }
}
</script>
