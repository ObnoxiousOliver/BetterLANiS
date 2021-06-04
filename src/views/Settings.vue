<template>
  <div class="settings-view-component">
    <div class="settings-page">
      <component :is="page" />
    </div>
    <!-- <div class="sidebar">
      <SettingsSidebar @go-to="goTo" />
    </div>
    <div class="content scroll auto">
      <div class="setting-view">
        <transition>
          <component :is="openSettingTab" />
        </transition>
      </div>
    </div> -->
  </div>
</template>

<script>
import Account from './settings/Account'
import Appearance from './settings/Appearance'

// import SettingsSidebar from '@/components/settings/SettingsSidebar'

export default {
  name: 'Settings',
  components: {
    // SettingsSidebar,
    Account,
    Appearance
  },
  props: {
    page: String
  }
}
</script>
