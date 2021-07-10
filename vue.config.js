/* eslint-disable no-template-curly-in-string */
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
        ],
        win: {
          artifactName: 'Better-LANiS-Setup-${version}.${ext}'
        },
        linux: {
          artifactName: 'Better-LANiS.${ext}'
        }
      }
    },
    i18n: {
      locale: 'de',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: false
    }
  }
}
