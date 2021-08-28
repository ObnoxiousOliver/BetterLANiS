<template>
  <transition name="context-menu">
    <div
      ref="contextMenu"
      v-if="contextOpen"
      v-show="contextShow"
      class="context-menu"
    >
      <div class="menu-content" @click="menuClicked">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
import { createPopper } from '@popperjs/core'

export default {
  name: 'ContextMenu',
  props: {
    stayActive: Boolean
  },
  data: () => ({
    contextOpen: false,
    contextShow: false
  }),
  methods: {
    open (target) {
      this.contextOpen = true
      document.addEventListener('mousedown', this.close)
      document.addEventListener('keydown', this.close)

      const x = window.event.clientX
      const y = window.event.clientY

      setTimeout(() => {
        var contextMenu = this.$refs.contextMenu

        var useTarget = target !== undefined

        this.contextShow = true
        createPopper(
          useTarget
            ? target
            : { getBoundingClientRect: () => ({ width: 0, height: 0, top: y, left: x, right: x, bottom: y }) },
          contextMenu, { placement: 'bottom-start' })

        setTimeout(() => {
          this.$refs.contextMenu.querySelector('.menu-content > button:not([disabled]), .menu-content > a:not([disabled])').focus()
        })
      })
    },
    close (e) {
      if (!e) {
        this.contextOpen = false
        this.contextShow = false
        document.removeEventListener('mousedown', this.close)
        document.removeEventListener('keydown', this.close)
      } else if (!e.path.includes(this.$refs.contextMenu)) {
        this.contextOpen = false
        this.contextShow = false
        document.removeEventListener('mousedown', this.close)
        document.removeEventListener('keydown', this.close)
      }
    },
    menuClicked (e) {
      if (this.stayActive) return
      var buttonClass = e.target.getAttribute('class')
      if (buttonClass ? !buttonClass.split(' ').includes('context-submenu-button') : true) {
        this.close()
      }
    }
  }
}
</script>
