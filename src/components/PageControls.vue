<template>
  <div class="page-controls-component">
    <tooltip placement="bottom">
      <template #activator>
        <button
          @click="$emit('style')"
          :class="[
            'page-control',
            'control-style',
            styleDisabled ? 'style-disabled' : '']"
        >
          <i class="fas fa-paint-brush" />
        </button>
      </template>
      <span v-if="styleDisabled">Thema für diese Seite anschalten</span>
      <span v-else>Thema für diese Seite ausschalten</span>
    </tooltip>
    <button
      ref="styleOptions"
      @click="$emit('styleOptions', $refs.styleOptions)"
      class="page-control control-style-options"
    >
      <i class="bi-chevron-down" />
    </button>
    <div class="divider" />
    <button @click="$emit('back')" class="page-control control-back">
      <i class="fas fa-arrow-left" />
    </button>
    <button @click="$emit('refresh')" class="page-control control-refresh">
      <div v-if="loading" class="loader" />
      <i v-else class="fas fa-sync" />
    </button>
    <div class="url">
      <span v-if="location" class="url-protocol">
        <tooltip placement="bottom" :variant="location.protocol === 'https:' ? '' : 'warning'">
          <template #activator>
            <i v-if="location.protocol === 'https:'" class="fas fa-lock" />
            <i v-else class="fas fa-exclamation-triangle warning" />
          </template>
          <span v-if="location.protocol === 'https:'">
            Diese Verbindung ist sicher
          </span>
          <span v-else class="warning">
            Diese Verbindung ist unsicher!
          </span>
        </tooltip>
        {{ location.protocol }}<span v-if="location.host">//</span>
      </span>
      <span v-if="location" class="url-domain">{{ location.host }}</span>
      <span v-if="location" class="url-path">{{ location.pathname }}{{ location.search }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageControls',
  props: {
    location: Object,
    loading: Boolean,
    styleDisabled: Boolean
  }
}
</script>
