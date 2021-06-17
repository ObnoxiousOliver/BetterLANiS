<template>
  <div class="gradient-picker-component">
    <div class="gradient-types">
      <tooltip placement="bottom">
        <template #activator>
          <bl-button
            class="solid first"
            :variant="'small' + (gradientType === 'solid' ? ' primary' : '')"
            @click="gradientType = 'solid'"
          >
            <div class="icon"><div /></div>
          </bl-button>
        </template>
        Solid-Color
      </tooltip>
      <tooltip placement="bottom">
        <template #activator>
          <bl-button
            class="linear"
            :variant="'small' + (gradientType === 'linear' ? ' primary' : '')"
            @click="gradientType = 'linear'"
          >
            <div class="icon"><div /></div>
          </bl-button>
        </template>
        Linear-Gradient
      </tooltip>
      <tooltip placement="bottom">
        <template #activator>
          <bl-button
            class="radial"
            :variant="'small' + (gradientType === 'radial' ? ' primary' : '')"
            @click="gradientType = 'radial'"
          >
            <div class="icon"><div /></div>
          </bl-button>
        </template>
        Radial-Gradient
      </tooltip>
      <tooltip placement="bottom">
        <template #activator>
          <bl-button
            class="repeating-linear"
            :variant="'small' + (gradientType === 'repeating-linear' ? ' primary' : '')"
            @click="gradientType = 'repeating-linear'"
          >
            <div class="icon"><div /></div>
          </bl-button>
        </template>
        Repeating-Radial-Gradient
      </tooltip>
      <tooltip placement="bottom">
        <template #activator>
          <bl-button
            class="repeating-radial last"
            :variant="'small' + (gradientType === 'repeating-radial' ? ' primary' : '')"
            @click="gradientType = 'repeating-radial'"
          >
            <div class="icon"><div /></div>
          </bl-button>
        </template>
        Repeating-Radial-Gradient
      </tooltip>
    </div>
    <div v-if="gradientType !== 'solid'" class="gradient-controls">
      <div class="preview">
        <div :style="{ background: fill }"/>
      </div>
      <div class="gradient">
        <div class="gradient-preview">
          <div :style="{ background: gradient }"/>
        </div>
        <div
          @mousedown="key_mousedown"
          ref="keys"
          class="keys"
        >
          <div
            v-for="(key, index) in keys"
            :key="index"
            @mousedown="selectedKey = index"
            :class="['key', selectedKey === index ? 'active' : '']"
            :style="{ left: key.offset * 100 + '%' }"
          >
            <div :style="{ background: key.color, opacity: key.opacity }" />
            <div class="key-arrow" />
          </div>
        </div>
      </div>
      <div class="controls">
        <input
          v-model="selectedKey"
          type="number"
          class="input-field input-small"
          min="0"
          :max="keys.length - 1"
        >
        <input
          v-model="keyOffset"
          type="number"
          class="input-field input-small"
          min="0"
          max="100"
        >
        <bl-button
          @click="removeKey"
          class="remove"
          variant="small"
          :disabled="keys.length <= 2"
        >
          <i class="fas fa-minus" />
        </bl-button>
        <bl-button
          @click="addKey"
          class="add"
          variant="small"
        >
          <i class="fas fa-plus" />
        </bl-button>
      </div>
    </div>
    <ColorPicker
      ref="colorPicker"
      @color-changed="colorChanged"
      :hasPreview="gradientType === 'solid'"
      :hasOpacity="hasOpacity"
    />
  </div>
</template>

<script>
import ColorPicker from './ColorPicker.vue'
export default {
  name: 'GradientPicker',
  components: {
    ColorPicker
  },
  props: {
    hasOpacity: Boolean
  },
  computed: {
    gradient () {
      return 'linear-gradient(90deg,' + this.gradientRaw + ')'
    },
    gradientRaw () {
      var key = [...this.keys]
      this.sortKeys()
      return key.map(x => {
        var opacityHex = Math.round(x.opacity * 255).toString(16)
        if (opacityHex.length === 1) {
          opacityHex = '0' + opacityHex
        }
        return x.color + opacityHex + ' ' + x.offset * 100 + '%'
      }).join(',')
    },
    fill () {
      switch (this.gradientType) {
        case 'solid':
          return this.colorPickerColor.hex + Math.round(this.colorPickerColor.opacity * 255).toString(16).padStart(2, '0')
        case 'radial':
          return this.gradientType + '-gradient(' + this.gradientRaw + ')'
        case 'repeating-linear':
          return this.gradientType + '-gradient(90deg,' + this.gradientRaw + ')'
        case 'repeating-radial':
          return this.gradientType + '-gradient(' + this.gradientRaw + ')'
        default:
          return 'linear-gradient(90deg,' + this.gradientRaw + ')'
      }
    },
    keyOffset: {
      get () {
        return Math.round(this.keys[this.selectedKey].offset * 100)
      },
      set (val) {
        this.keys[this.selectedKey].offset = this.clamp(val, 0, 100) / 100
      }
    },
    selectedKey: {
      get () { return this.selectedIndex },
      set (val) {
        this.selectedIndex = this.clamp(val, 0, this.keys.length - 1)
      }
    }
  },
  data: () => ({
    orientation: 90,
    keys: [
      { offset: 0, color: '#000000', opacity: 1 },
      { offset: 1, color: '#ff0000', opacity: 1 }
    ],
    selectedIndex: 0,
    gradientType: 'linear',
    colorPickerColor: { hex: '#ff0000', opacity: 1 }
  }),
  watch: {
    fill (fill) {
      this.$emit('fill-changed', fill)
    },
    gradientType () {
      this.$refs.colorPicker.setColor(this.keys[this.selectedKey].color, this.keys[this.selectedKey].opacity)
    },
    selectedKey (val) {
      this.$refs.colorPicker.setColor(this.keys[val].color, this.keys[val].opacity)
    }
  },
  mounted () {
    this.$refs.colorPicker.setColor(this.keys[this.selectedKey].color, this.keys[this.selectedKey].opacity)
    this.$emit('fill-changed', this.fill)
  },
  methods: {
    colorChanged (hex, opacity) {
      this.colorPickerColor = { hex, opacity }
      if (this.gradientType !== 'solid') {
        this.keys[this.selectedKey].color = hex
        this.keys[this.selectedKey].opacity = opacity
      }
    },
    addKey () {
      var cp = this.$refs.colorPicker

      this.sortKeys()
      var selected = this.keys[this.selectedKey]
      var neighbour = this.keys[this.selectedKey - 1] || this.keys[this.selectedKey + 1]
      this.keys.push({
        offset: this.mid(selected.offset, neighbour.offset),
        color: cp.RGBToHex(cp.midColor(cp.hexToRGB(selected.color), cp.hexToRGB(neighbour.color))),
        opacity: this.mid(selected.opacity, neighbour.opacity)
      })
      this.selectedKey = this.keys.length - 1
      this.$refs.colorPicker.setColor(this.keys[this.selectedKey].color, this.keys[this.selectedKey].opacity)
      this.sortKeys()
    },
    removeKey () {
      if (this.keys.length > 2) {
        this.keys.splice(this.selectedKey, 1)
        if (this.selectedKey > this.keys.length - 1) {
          this.selectedKey -= 1
        }
        this.$refs.colorPicker.setColor(this.keys[this.selectedKey].color, this.keys[this.selectedKey].opacity)
      }
    },
    sortKeys () {
      var selected = this.keys[this.selectedKey]
      this.keys.sort((a, b) => a.offset - b.offset)
      this.selectedKey = this.keys.indexOf(selected)
    },
    key_mousedown (e) {
      e.preventDefault()
      document.addEventListener('mouseup', this.key_mouseup)
      document.addEventListener('mousemove', this.key_mousemove)
    },
    key_mouseup (e) {
      e.preventDefault()
      document.removeEventListener('mouseup', this.key_mouseup)
      document.removeEventListener('mousemove', this.key_mousemove)
    },
    key_mousemove (e) {
      e.preventDefault()
      this.moveKey(e)
    },
    moveKey (e) {
      var keys = this.$refs.keys

      var rect = keys.getBoundingClientRect()
      var x = e.clientX - rect.left
      this.keys[this.selectedKey].offset = this.clamp(x / keys.clientWidth, 0, 1)
    },
    clamp (value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    mid (num1, num2) {
      return (num1 + num2) / 2
    }
  }
}
</script>
