module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraFiles: [
          {
            from: 'public/resources',
            to: 'resources',
            filter: '**/*'
          }
        ]
      }
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
