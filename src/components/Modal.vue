<template>
  <transition name="modal-component">
    <div
      @keydown.esc="this.$emit('closemodal')"
      v-if="active"
      :class="['modal-component', variant.split(' ').map(x => 'modal-' + x)]"
    >
      <div @click="$emit('closemodal')" class="modal-mask" />
      <div class="modal" tabindex="0">
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
    variant: {
      type: String,
      default: ''
    },
    nofocus: {
      type: Array,
      default: undefined
    }
  },
  computed: {
    focusElements () {
      // get all focusable Elements
      return [...document.querySelectorAll('a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.hasAttribute('disabled') && el.hasAttribute('tabindex') ? el.getAttribute('tabindex') !== '-1' : true)
    }
  },
  watch: {
    active (value) {
      setTimeout(() => {
        if (value) {
          this.$refs.closeBtn.focus()

          if (this.nofocus) {
            this.nofocus.forEach(el => el.addEventListener('focusin', this.goToNextFocusableElement))
          }
        } else {
          if (this.nofocus) {
            this.nofocus.forEach(el => el.removeEventListener('focusin', this.goToNextFocusableElement))
          }
        }
      })
    }
  },
  methods: {
    goToNextFocusableElement (e) {
      var fe = this.focusElements

      // Check if tabbed forwards or backwards
      if (fe.indexOf(e.target) > fe.indexOf(e.relatedTarget)) {
        fe[
          fe.indexOf(e.target) + 1 <= fe.length - 1
            ? fe.indexOf(e.target) + 1
            : 0
        ].focus()
      } else if (fe.indexOf(e.target) < fe.indexOf(e.relatedTarget)) {
        fe[
          fe.indexOf(e.target) - 1 >= 0
            ? fe.indexOf(e.target) - 1
            : fe.length - 1
        ].focus()
      }
    }
  }
}
</script>
