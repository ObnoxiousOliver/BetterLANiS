<template>
  <router-link :to="to" class="app-button-component">
    <div class="app-button-icon">
      <i :class="icon" />
    </div>
    <div class="app-button-name">
      <slot/>
    </div>
  </router-link>
  <!-- <button @click="$emit('menuopen')" class="context-menu-button">
    <i class="fas fa-ellipsis-v" />
  </button> -->
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    icon: String,
    to: { type: String, default: '' }
  }
}
</script>
