export default {
  getContrastYIQ (hexcolor) {
    function hexToRGB (h) {
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
    }

    var rgb = hexToRGB(hexcolor)
    var yiq = ((rgb.r * 190) + (rgb.g * 500) + (rgb.b * 60)) / 1000
    return (yiq >= 128) ? '#000000' : '#ffffff'
  }
}
