<template>
  <div class="color-picker-component">
    <div
      v-if="hasPreview"
      class="preview"
    >
      <div :style="{ background: color, opacity: opacity / 100 }" />
    </div>
    <div
      @mousedown="palette_mousedown"
      class="palette"
      ref="palette"
      tabindex="1"
    >
      <div
        class="fill"
        :style="{ background: hueFill }"
      />
      <div
        class="cursor"
        :style="{
          background: color,
          top: (1 - hsv.v) * 100 + '%',
          left: hsv.s * 100 + '%'
        }"
      />
    </div>
    <input
      v-model="hsv.h"
      type="range"
      class="spectrum-slider"
      min="0"
      max="360"
    >
    <div class="input-container">
      <input
        v-model="red"
        type="range"
        class="red input-slider"
        min="0"
        max="255"
      >
      <input
        v-model="red"
        type="number"
        class="input-field input-small"
        min="0"
        max="255"
      >
    </div>
    <div class="input-container">
      <input
        v-model="green"
        type="range"
        class="green input-slider"
        min="0"
        max="255"
      >
      <input
        v-model="green"
        type="number"
        class="input-field input-small"
        min="0"
        max="255"
      >
    </div>
    <div class="input-container">
      <input
        v-model="blue"
        type="range"
        class="blue input-slider"
        min="0"
        max="255"
      >
      <input
        v-model="blue"
        type="number"
        class="input-field input-small"
        min="0"
        max="255"
      >
    </div>
    <div
      v-if="hasOpacity"
      class="input-container"
    >
      <input
        v-model="opacity"
        type="range"
        class="opacity input-slider"
        min="0"
        max="100"
      >
      <input
        v-model="opacity"
        type="number"
        class="input-field input-small"
        min="0"
        max="100"
      >
    </div>
    <input
      @blur="setHex"
      @keydown.enter="setHex"
      v-model="inputHex"
      type="text"
      :class="[
        'hex',
        'input-field',
        'input-small',
        inputHex.match(/^#([\da-f]{3}){1,2}$/i) ? '' : 'error'
      ]"
    >
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    hasOpacity: Boolean,
    hasPreview: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    hsv: {
      h: 0,
      s: 1,
      v: 1
    },
    opacity: 100,
    inputHex: ''
  }),
  computed: {
    color () {
      return this.RGBToHex(this.hsvToRGB(this.hsv))
    },
    hueFill () {
      return this.RGBToHex(this.hsvToRGB({
        h: this.hsv.h,
        s: 1,
        v: 1
      }))
    },
    red: {
      get () {
        return this.hsvToRGB(this.hsv).r
      },
      set (val) {
        this.hsv = this.RGBToHsv({
          r: this.clamp(val, 0, 255),
          g: this.green,
          b: this.blue
        })
      }
    },
    green: {
      get () {
        return this.hsvToRGB(this.hsv).g
      },
      set (val) {
        this.hsv = this.RGBToHsv({
          r: this.red,
          g: this.clamp(val, 0, 255),
          b: this.blue
        })
      }
    },
    blue: {
      get () {
        return this.hsvToRGB(this.hsv).b
      },
      set (val) {
        this.hsv = this.RGBToHsv({
          r: this.red,
          g: this.green,
          b: this.clamp(val, 0, 255)
        })
      }
    },
    hex: {
      get () {
        return this.RGBToHex(this.hsvToRGB(this.hsv))
      },
      set (val) {
        this.hsv = this.RGBToHsv(this.hexToRGB(val))
      }
    }
  },
  watch: {
    hsv: {
      handler () {
        this.inputHex = this.hex

        this.$emit('color-changed', this.hex, this.opacity / 100)
      },
      deep: true
    },
    opacity () {
      this.$emit('color-changed', this.hex, this.opacity / 100)
    }
  },
  methods: {
    setColor (hex, opacity) {
      this.hex = hex
      this.opacity = opacity * 100
    },
    palette_mousedown (e) {
      e.preventDefault()
      this.moveCursor(e)
      document.addEventListener('mouseup', this.palette_mouseup)
      document.addEventListener('mousemove', this.palette_mousemove)
    },
    palette_mouseup (e) {
      e.preventDefault()
      document.removeEventListener('mouseup', this.palette_mouseup)
      document.removeEventListener('mousemove', this.palette_mousemove)
    },
    palette_mousemove (e) {
      e.preventDefault()
      this.moveCursor(e)
    },
    moveCursor (e) {
      var palette = this.$refs.palette

      var rect = palette.getBoundingClientRect()
      var x = e.clientX - rect.left
      var y = e.clientY - rect.top
      this.hsv.s = this.clamp(x / palette.clientWidth, 0, 1)
      this.hsv.v = this.clamp(1 - y / palette.clientHeight, 0, 1)
    },
    setHex () {
      if (this.inputHex.match(/^#([\da-f]{3}){1,2}$/i)) {
        this.hex = this.inputHex
      } else {
        this.inputHex = this.hex
      }
    },
    hexToRGB (h) {
      let r = 0
      let g = 0
      let b = 0

      // 3 digits
      if (h.length === 4) {
        r = '0x' + h[1] + h[1]
        g = '0x' + h[2] + h[2]
        b = '0x' + h[3] + h[3]

      // 6 digits
      } else if (h.length === 7) {
        r = '0x' + h[1] + h[2]
        g = '0x' + h[3] + h[4]
        b = '0x' + h[5] + h[6]
      }

      return {
        r: parseInt(r),
        g: parseInt(g),
        b: parseInt(b)
      }
    },
    RGBToHex ({ r, g, b }) {
      r = r.toString(16)
      g = g.toString(16)
      b = b.toString(16)

      if (r.length === 1) {
        r = '0' + r
      }
      if (g.length === 1) {
        g = '0' + g
      }
      if (b.length === 1) {
        b = '0' + b
      }

      return '#' + r + g + b
    },
    RGBToHsv ({ r, g, b }) {
      r /= 255
      g /= 255
      b /= 255

      var max = Math.max(r, g, b)
      var min = Math.min(r, g, b)
      var h = max
      var s = max
      var v = max

      var d = max - min
      s = max === 0 ? 0 : d / max

      if (max === min) {
        h = 0 // achromatic
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h /= 6
        h *= 360
      }

      return { h, s, v }
    },
    hsvToRGB ({ h, s, v }) {
      var r, g, b
      var i
      var f, p, q, t

      h = this.clamp(h, 0, 360)
      s = this.clamp(s, 0, 1)
      v = this.clamp(v, 0, 1)

      h = h === 360 ? 0 : h

      if (s === 0) {
        // Achromatic (grey)
        r = g = b = v
        return {
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(b * 255)
        }
      }

      h /= 60 // sector 0 to 5
      i = Math.floor(h)
      f = h - i // factorial part of h
      p = v * (1 - s)
      q = v * (1 - s * f)
      t = v * (1 - s * (1 - f))

      switch (i) {
        case 0:
          r = v
          g = t
          b = p
          break
        case 1:
          r = q
          g = v
          b = p
          break
        case 2:
          r = p
          g = v
          b = t
          break
        case 3:
          r = p
          g = q
          b = v
          break
        case 4:
          r = t
          g = p
          b = v
          break
        default: // case 5:
          r = v
          g = p
          b = q
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      }
    },
    clamp (value, min, max) {
      return Math.min(Math.max(value, min), max)
    },
    midColor (rgb1, rgb2) {
      return {
        r: Math.round((rgb1.r + rgb2.r) / 2),
        g: Math.round((rgb1.g + rgb2.g) / 2),
        b: Math.round((rgb1.b + rgb2.b) / 2)
      }
    }
  },
  mounted () {
    this.inputHex = this.hex
  }
}
</script>
