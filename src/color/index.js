export default {
  getContrastYIQ (hexColor) {
    var rgb = this.hexToRGB(hexColor)
    var yiq = ((rgb.r * 190) + (rgb.g * 500) + (rgb.b * 60)) / 1000
    return (yiq >= 128) ? '#000000' : '#ffffff'
  },
  pastelify (hexColor) {
    var hsv = this.RGBToHsv(this.hexToRGB(hexColor))

    return this.RGBToHex(this.hsvToRGB({
      h: hsv.h,
      s: hsv.v ? this.clamp(hsv.s, 0, 0.7) : 0,
      v: hsv.v > 0.05 ? hsv.v * 1.5 : 0.05
    }))
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
  }
}
