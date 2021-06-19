<template>
  <transition name="modal-component">
    <div v-if="active" :class="['modal-component', variant.split(' ').map(x => 'modal-' + x)]">
      <div @click="$emit('closemodal')" class="modal-mask" />
      <div class="modal">
        <button
          @click="$emit('closemodal')"
          class="modal-close-btn"
          ref="closeBtn"
        >
          <i class="bi bi-x" />
        </button>
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
    active: Boolean,
    variant: { type: String, default: '' }
  },
  watch: {
    active (value) {
      setTimeout(() => {
        if (value) {
          this.$refs.closeBtn.focus()
        }
      })
    }
  }
}
</script>
