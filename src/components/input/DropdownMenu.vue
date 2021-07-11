<template>
  <div
    class="dropdown-menu-component"
    @keydown.esc="closeDropdown"
  >
    <button
      @click="toggleDropdown"
      @mousewheel="dropdownScroll"
      @keydown.up="indexUp"
      @keydown.down="indexDown"
      :class="['dropdown-btn', dropdownOpen ? 'is-open' : '']"
      ref="dropdownButton"
    >
      <div class="dropdown-content" v-html="data[selectedIndex] ? data[selectedIndex].content : ''" />
      <div class="dropdown-arrow">
        <i class="bi-chevron-down" />
      </div>
    </button>
    <transition name="dropdown">
      <div v-if="dropdownOpen" class="dropdown scroll y auto thin">
        <button
          v-for="(item, index) in data"
          @click="selectedIndex = index"
          :key="index"
          :class="['dropdown-option', selectedIndex === index ? 'active' : '']"
          v-html="item.content"
        />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownMenu',
  props: {
    data: Array
  },
  data: () => ({
    selectedIndex: 0,
    dropdownOpen: false
  }),
  watch: {
    selectedIndex (val) {
      this.$emit('itemselected', this.data[val])
    }
  },
  mounted () {
  },
  methods: {
    dropdownScroll (e) {
      if (e.deltaY > 0) this.indexDown()
      else this.indexUp()
    },
    indexDown () {
      if (this.selectedIndex < this.data.length - 1) this.selectedIndex += 1
    },
    indexUp () {
      if (this.selectedIndex > 0) this.selectedIndex -= 1
    },
    toggleDropdown () {
      if (this.dropdownOpen) this.closeDropdown()
      else this.openDropdown()
    },
    openDropdown () {
      this.dropdownOpen = true
      setTimeout(() => {
        document.addEventListener('click', this.documentClick)
        document.addEventListener('keydown', this.documentKeydown)
      })
    },
    closeDropdown () {
      this.dropdownOpen = false
      document.removeEventListener('click', this.documentClick)
      document.removeEventListener('keydown', this.documentKeydown)
    },
    documentClick () {
      this.closeDropdown()
    },
    documentKeydown (e) {
      console.log(e)
      if (!e.path.includes(this.$el)) {
        this.closeDropdown()
      }
    }
  }
}
</script>
