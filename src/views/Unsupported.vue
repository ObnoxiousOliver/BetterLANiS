<template>
  <div class="unsupported-view-component">
    <PageControls
      @back="$refs.viewer.contentWindow.history.back(); this.pageLoading = true"
      @refresh="$refs.viewer.contentWindow.location.reload(); this.pageLoading = true"
      :location="location"
      :loading="pageLoading"
    />
    <div class="browser">
      <iframe
        @load="iframeLoad"
        ref="viewer"
        :src="sourceUrl"
      />
    </div>
  </div>
</template>

<script>
import PageControls from '@/components/PageControls'

import manager from '@/manager'
import { mapState } from 'vuex'

export default {
  name: 'Unsupported',
  components: {
    PageControls
  },
  data: () => ({
    pageLoading: false,
    setUrl: false,
    location: undefined
  }),
  computed: {
    ...mapState([
      'theme'
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
    }
  },
  mounted () {
    this.setUrl = true
  },
  methods: {
    writeEvent (e) {
      console.log(e)
    },
    iframeLoad (e) {
      this.pageLoading = false

      const frame = e.target.contentWindow
      this.location = frame.location

      this.injectCss(true)
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
    injectCss (inject) {
      try {
        const frame = this.$refs.viewer.contentWindow

        if (!inject) {
          frame.document.querySelectorAll('bl-injected-styles').forEach(x => x.remove())
          return
        }

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

        frame.document.querySelectorAll('bl-injected-styles').forEach(x => x.remove())
        var style = frame.document.createElement('style')
        style.id = 'bl-injected-styles'
        style.innerHTML = ':root {\n' +
          rootVars
            .map(x => `${x}: ${getComputedStyle(document.documentElement).getPropertyValue(x)};`)
            .join('\n') +
        '}\n\n' + injectCss

        frame.document.documentElement.append(style)
      } catch {}
    }
  }
}
</script>
