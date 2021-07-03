<template>
  <div class="settings-view-component">
    <div class="settings-page">
      <transition name="settings-page" mode="out-in">
        <component :is="page" />
      </transition>
    </div>
  </div>
</template>

<script>
import Appearance from './settings/Appearance'
import ThemeLibary from './settings/ThemesLibary'
import Accessibility from './settings/Accessibility'
import System from './settings/System'

export default {
  name: 'Settings',
  components: {
    Appearance,
    ThemeLibary,
    Accessibility,
    System
  },
  props: {
    page: String
  }
}
</script>
