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
    }
  },
  watch: {
    sourceUrl () {
      this.pageLoading = true
    }
  },
  mounted () {
    this.setUrl = true

    this.$refs.viewer.addEventListener('load', () => {
      var frame = this.$refs.viewer.contentWindow
      this.location = frame.location
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
      frame.document.querySelectorAll('a').forEach(el => {
        if (el.href.startsWith('http')) {
          if (!el.href.includes('schulportal.hessen.de') && !el.href.includes('.schule.hessen.de')) {
            el.target = '_blank'
          }
        } else {
          el.target = undefined
        }
      })
      this.pageLoading = false
    })
  }
}
</script>
