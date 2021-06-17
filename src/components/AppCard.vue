<template>
  <div class="app-card-component">
    <router-link :to="to" class="app-card-body">
      <div class="app-card-icon">
        <i :class="icon" />
      </div>
      <div class="app-card-name">
        <slot/>
      </div>
    </router-link>
    <button @click="$emit('menuopen')" class="context-menu-button">
      <i class="fas fa-ellipsis-v" />
    </button>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    icon: String,
    to: { type: String, default: '' }
  }
}
</script>
