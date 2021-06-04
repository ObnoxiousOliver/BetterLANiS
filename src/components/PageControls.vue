<template>
  <div class="page-controls-component">
    <button @click="$emit('back')" id="back" class="page-control">
      <i class="fas fa-arrow-left" />
    </button>
    <button @click="$emit('refresh')" id="refresh" class="page-control">
      <i class="fas fa-sync" />
    </button>
    <div class="url">
      <span v-if="location" class="url-protocol">
        <tooltip placement="bottom-start" :variant="location.protocol === 'https:' ? '' : 'warning'">
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
    location: Object
  }
}
</script>
