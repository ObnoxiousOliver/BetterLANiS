<template>
  <div class="theme-item-component">
    <div class="theme-icon">
      <img
        v-if="theme.icon64"
        :src="theme.icon64"
      >
      <div v-else class="icon-placeholder">
        <i class="fas fa-swatchbook" />
      </div>
    </div>
    <div class="theme-info">
      <tooltip
        v-if="original"
        class="theme-original"
        placement="bottom"
      >
        <template #activator>
          <i class="fas fa-star" />
        </template>
        Originales Theme-Pack
      </tooltip>
      <h3 class="theme-name">
        {{ theme.name }}
      </h3>
      <div class="theme-details">
        <span v-if="theme.version" class="theme-version">
          v{{ theme.version }}
        </span>
        <span v-if="theme.author" class="theme-author">
          by {{ theme.author }}
        </span>
        <div v-if="theme.description" class="theme-description">
          {{ theme.description }}
        </div>
      </div>
    </div>
    <div v-if="!noArrow" class="arrow">
      <i class="bi bi-chevron-right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThemeItem',
  props: {
    theme: Object,
    original: Boolean,
    noArrow: Boolean
  }
}
</script>
