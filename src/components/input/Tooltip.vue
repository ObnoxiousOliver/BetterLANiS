<template>
  <div
    @mouseenter="activatorEnter"
    @mouseleave="activatorLeave"
    ref="activator"
    :class="[ 'tooltip-activator', this.class]"
  >
    <slot name="activator" />
  </div>
  <div
    v-if="showTooltip && manual"
    @click="showTooltip = false"
    :style="{ position: 'fixed', width: '100%', height: '100%' }"
  />
  <transition name="tooltip">
    <div
      v-show="showTooltip"
      :class="[
        'tooltip', manual ? 'can-interact' : '',
        variant ? ' tooltip-' + variant.split(' ').join(' tooltip-') : ''
      ]"
      ref="tooltip"
    >
      <div class="tooltip-box">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
import { createPopper } from '@popperjs/core'

export default {
  name: 'Tooltip',
  props: {
    placement: {
      type: String,
      default: 'top'
    },
    manual: {
      type: Boolean,
      default: false
    },
    class: String,
    variant: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    showTooltip: false
  }),
  watch: {
    showTooltip () {
      this.setPopper()
    }
  },
  methods: {
    close () {
      this.showTooltip = false
    },
    open () {
      this.showTooltip = true
    },
    activatorEnter () {
      if (!this.manual) {
        this.showTooltip = true
      }
    },
    activatorLeave () {
      if (!this.manual) {
        this.showTooltip = false
      }
    },
    setPopper () {
      var activator = this.$refs.activator.children[0]
      var tooltip = this.$refs.tooltip
      createPopper(activator, tooltip, {
        placement: this.placement,
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 5]
            }
          }
        ]
      })
    }
  }
}
</script>
