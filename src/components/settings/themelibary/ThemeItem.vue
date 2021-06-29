<template>
  <div class="theme-libary-theme-item-component">
    <div class="theme-controls">
      <tooltip>
        <template #activator>
          <bl-button variant="transparent small" class="download-btn"><i class="bi-download" /></bl-button>
        </template>
        Herunterladen
      </tooltip>
    </div>
    <button @click="$emit('themeselected')" class="theme-button">
      <div class="theme-image"></div>
      <div class="theme-icon">
        <img
          v-if="theme.icon64"
          :src="theme.icon64"
        >
        <div v-else class="icon-placeholder">
          <i class="fas fa-swatchbook" />
        </div>
      </div>
      <tooltip v-if="theme.author === 'ObnoxiousOliver'" class="theme-original" >
        <template #activator>
          <i class="fas fa-gem" />
        </template>
        Originales Theme-Pack
      </tooltip>
      <div class="theme-info">
        <div class="theme-header">
          <span class="theme-name">{{ theme.displayName }}</span><br>
          <span class="theme-original-name"> ({{ theme.name }})</span>
        </div>
        <div class="theme-details">
          <span class="theme-version">{{ theme.version }}</span> <span class="theme-author">by {{ theme.author }}</span>
        </div>
      </div>
    </button>
  </div>
</template>

<script>
import BlButton from '../../input/BlButton.vue'
export default {
  components: { BlButton },
  name: 'ThemeItem',
  props: {
    theme: Object
  }
}
</script>
