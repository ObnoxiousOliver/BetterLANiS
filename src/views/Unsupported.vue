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

      var frame = e.target.contentWindow
      this.location = frame.location

      // Inject CSS
      var style = document.createElement('style')
      style.innerHTML = `
        * {
          transition: background-color 0.2s;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: Poppins;
        }
        .navbar-custom, .header-top, .ccm-page #header .header-top.header-top-colored, .sticky-wrapper, .footer, #headlogo {
          display: none !important;
        }
        body {
          overflow: auto;
          font-family: Heebo;
        }
      `
      frame.document.head.append(style)

      // A-tags open Browser
      frame.document.querySelectorAll('a').forEach(el => {
        // console.log(el.href, this.allowedLinks.filter(x => el.href.match(x)))
        if (!this.allowedLinks.filter(x => el.href.match(x)).length) {
          el.target = '_blank'
        }
      })
    }
  }
}
</script>
