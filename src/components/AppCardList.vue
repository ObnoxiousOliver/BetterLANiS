<template>
  <div class="app-card-list-component">
    <div
      class="scroll x auto thin"
      ref="scroller"
    >
      <transition-group
        name="app"
        tag="div"
        class="app-card-container"
      >
        <slot/>
      </transition-group>
    </div>
    <bl-button tabindex="-1" v-if="isScrollbarVisible" @click="scroll('left')" class="scroll-btn scroll-btn-left">
      <i class="bi-chevron-left" />
    </bl-button>
    <bl-button tabindex="-1" v-if="isScrollbarVisible" @click="scroll('right')" class="scroll-btn scroll-btn-right">
      <i class="bi-chevron-right" />
    </bl-button>
  </div>
</template>

<script>
export default {
  name: 'AppCardList',
  data: () => ({
    isScrollbarVisible: false
  }),
  mounted () {
    const scroller = this.$refs.scroller
    this.isScrollbarVisible = scroller.scrollWidth > scroller.clientWidth

    this.$el.addEventListener('mouseover', () => {
      const scroller = this.$refs.scroller
      this.isScrollbarVisible = scroller.scrollWidth > scroller.clientWidth
    })
  },
  methods: {
    scroll (dir) {
      const scroller = this.$refs.scroller
      const scrollInterval = scroller.clientWidth / 2
      // scroller.querySelector('.app-card-component + .app-card-component').getBoundingClientRect().x -
      // scroller.querySelector('.app-card-component').getBoundingClientRect().x

      switch (dir) {
        case 'left':
          scroller.scrollLeft -= scrollInterval
          break
        case 'right':
          scroller.scrollLeft += scrollInterval
          break
      }
    }
  }
}
</script>
