<template>
  <div class="setting-account-view-component">
    <h1 class="setting-page-header">Benutzer</h1>
    <gradient-picker :hasOpacity="true" />
  </div>
</template>

<script>
import GradientPicker from '../../components/input/colorpickers/GradientPicker.vue'
export default {
  name: 'Account',
  components: {
    GradientPicker
  }
}
</script>
