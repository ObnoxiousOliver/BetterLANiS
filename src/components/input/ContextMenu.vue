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
    target: Object
  },
  data: () => ({
    contextOpen: false,
    contextShow: false
  }),
  methods: {
    open () {
      this.contextOpen = true
      document.addEventListener('mousedown', this.close)
      document.addEventListener('keydown', this.close)

      const x = window.event.clientX
      const y = window.event.clientY

      setTimeout(() => {
        var contextMenu = this.$refs.contextMenu

        this.contextShow = true
        createPopper(this.target || {
          getBoundingClientRect: () => ({
            width: 0,
            height: 0,
            top: y,
            left: x,
            right: x,
            bottom: y
          })
        }, contextMenu, { placement: this.target ? 'right-start' : 'bottom-start' })

        setTimeout(() => {
          this.$refs.contextMenu.querySelector('.menu-content > button:not([disabled]), .menu-content > a:not([disabled])').focus()
        })
      })
    },
    close (e) {
      if (!e.path.includes(this.$refs.contextMenu)) {
        this.contextOpen = false
        this.contextShow = false
        document.removeEventListener('mousedown', this.close)
      }
    },
    menuClicked (e) {
      var buttonClass = e.target.getAttribute('class')
      if (buttonClass ? !buttonClass.split(' ').includes('context-submenu-button') : true) {
        this.close({ path: [] })
      }
    }
  }
}
</script>
