module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    },
    i18n: {
      locale: 'de',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
}
