<template>
  <div class="unsupported-view-component">
    <PageControls
      @back="$refs.viewer.contentWindow.history.back()"
      @refresh="$refs.viewer.contentWindow.location.reload()"
      :location="location"
    />
    <div class="browser">
      <iframe
        ref="viewer"
        :src="sourceUrl"
      />
      <transition name="loading">
        <div
          class="page-loading"
          v-if="pageLoading"
        >
          <div class="loader" />
        </div>
      </transition>
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
      style.innerText = `
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
      // background: #111;
      // color: #fff;
      // .panel {
      //   background: #222;
      //   border: none;
      // }
      // .panel-info > .panel-heading, .panel-heading {
      //   background-color: unset;
      //   color: #fff;
      //   font-family: Poppins;
      //   font-size: 1.5rem;
      //   border-bottom: 1px solid #444;
      // }
      // .panel-footer {
      //   background-color: #333;
      //   border-top: 1px solid #444;
      // }
      // .list-group-item:not([data-key="mycourses"]):not([data-key="sitesettings"]):not([data-key="coursehome"]) {
      //   background-color: unset;
      //   border: 1px solid #444;
      // }
      // .table-striped>tbody>tr:nth-of-type(odd) {
      //   background-color: #ffffff05;
      // }
      // .table-hover>tbody>tr:hover {
      //   background-color: #fff2;
      // }
      // .table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th, .table>thead>tr>th {
      //   border-top: 1px solid #444;
      //   border-bottom: 0;
      // }
      // #region-main, .card, #page-enrol-users #filterform, .que .history, .userprofile .profile_tree section, .groupinfobox, .well, [data-region="drawer"] {
      //   background: #222;
      // }
      // .list-group-item-action {
      //   color: #aaa
      // }
      // .bg-light {
      //   background-color: inherit !important;
      // }
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
