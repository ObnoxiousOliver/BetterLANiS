<template>
  <transition name="modal-component">
    <div v-if="active" class="modal-component">
      <div @click="$emit('closemodal')" class="modal-mask" />
      <div class="modal">
        <div
          tabindex="0"
          @click="$emit('closemodal')"
          class="modal-close-btn"
        >
          <i class="bi bi-x" />
        </div>
        <h2 class="modal-header">
          <slot name="header" />
        </h2>
        <div class="modal-content">
          <slot />
        </div>
        <slot name="footer" class="modal-footer" />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    active: Boolean
  }
}
</script>
