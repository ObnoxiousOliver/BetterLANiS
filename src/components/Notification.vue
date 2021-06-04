<template>
  <div :class="['notification-component', notification.style ? notification.style.split(' ').map(x => x ? 'notification-' + x : '') : '']">
    <span v-if="notification.title" class="notification-title">{{ notification.title }}: </span>
    <span class="notification-message">{{ notification.message }}</span>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    notification: Object
  }
}
</script>
