<template>
  <div class="settings-panel-component">
    <div class="scroll auto">
      <bl-button
        @click="$emit('openSettings', 'Appearance')"
        variant="static transparent"
        :class="['setting-link', activePage === 'Appearance' ? 'page-active' : '']"
      >
        <i class="setting-icon fas fa-swatchbook" /> Erscheinungsbild
      </bl-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPanel',
  props: {
    activePage: String
  }
}
</script>
