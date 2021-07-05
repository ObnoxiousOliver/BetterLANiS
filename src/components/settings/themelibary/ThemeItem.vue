<template>
  <div class="theme-libary-theme-item-component">
    <div class="theme-controls">
      <tooltip>
        <template #activator>
          <bl-button v-if="theme.downloadUrl && !isInstalled" class="download-btn"><i class="bi-download" /></bl-button>
        </template>
        Herunterladen
      </tooltip>
    </div>
    <button @click="$emit('themeselected')" class="theme-button">
      <div v-if="theme.preview" class="theme-image" :style="{ color: theme.preview['1'] }">
        <div class="theme-color1" :style="{ color: theme.preview['2'] }" />
        <div class="theme-color2" :style="{ color: theme.preview['3'] }" />
      </div>
      <div v-else class="theme-image" />
      <div class="theme-icon">
        <img
          v-if="theme.iconHref"
          :src="theme.iconHref"
        >
        <div
          v-else-if="theme.preview"
          class="icon-placeholder"
          :style="{ color: theme.preview['1'] }"
        >
          <i
            class="fas fa-swatchbook"
            :style="{ color: color.getContrastYIQ(theme.preview['1']) }"
          />
        </div>
        <div v-else class="icon-placeholder">
          <i class="fas fa-swatchbook" />
        </div>
      </div>
      <div v-if="theme.author === 'ObnoxiousOliver'" class="theme-tags">
        <span class="theme-original">
          <i class="fas fa-gem" /> Originales Thema<br>
        </span>
        <span class="theme-installed" v-if="isInstalled">
          <i class="fas fa-check" /> Installiert<br>
        </span>
      </div>
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
import color from '@/color'

export default {
  name: 'ThemeItem',
  props: {
    theme: Object,
    isInstalled: Boolean
  },
  computed: {
    color () {
      return color
    }
  }
}
</script>
