<template>
  <div :class="['theme-item-component']">
    <div class="theme-icon">
      <img
        v-if="theme.icon64"
        :src="theme.icon64"
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
    <div class="theme-info">
      <div class="theme-header">
        <h3 class="theme-name">
          {{ theme.name }}
        </h3>
        <div v-if="original" class="theme-original">
          <i class="fas fa-gem" /> Originales Thema
        </div>
      </div>
      <div class="theme-details">
        <span v-if="theme.version" class="theme-version">
          v{{ theme.version }}
        </span>
        <span v-if="theme.author" class="theme-author">
          by {{ theme.author }}
        </span>
      </div>
      <div v-if="theme.description" class="theme-description">
        {{ theme.description }}
      </div>
    </div>
  </div>
</template>

<script>
import color from '@/color'

export default {
  name: 'ThemeItem',
  props: {
    theme: Object,
    original: Boolean
  },
  computed: {
    color () {
      return color
    }
  }
}
</script>
