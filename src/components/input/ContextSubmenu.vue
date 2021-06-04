<template>
  <button
    ref="button"
    @click="$refs.menu.open()"
    class="context-submenu-button"
  >
    <slot />
    <i class="arrow bi bi-chevron-right" />
  </button>
  <context-menu
    ref="menu"
    :target="target"
  >
    <slot name="menu" />
  </context-menu>
</template>

<script>
export default {
  name: 'ContextSubmenu',
  computed: {
    target () {
      return {
        getBoundingClientRect: () => this.$refs.button.getBoundingClientRect()
      }
    }
  }
}
</script>
