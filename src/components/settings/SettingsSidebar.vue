<template>
  <div class="settings-sidebar-component scroll y auto thin">
    <h2>Einstellung</h2>
    <div
      v-for="(setting, index) in settings"
      :key="index"
    >
      <bl-button
        v-if="setting.divider === undefined"
        variant="transparent nospacing static"
        @click="onNavButtonClick(setting)"
      >
        <span v-html="setting.html" />
      </bl-button>
      <h3
        v-else
        class="divider"
        v-html="setting.divider"
      />
    </div>
    <h3 class="divider">
      <i class="fas fa-external-link-alt" />&nbsp;&nbsp;Kontakte
    </h3>
    <div class="contact">
      <bl-button variant="transparent small nospacing static">
        <i class="fab fa-youtube" />
      </bl-button>
      <bl-button variant="transparent small nospacing static">
        <i class="fab fa-github" />
      </bl-button>
      <bl-button variant="transparent small nospacing static">
        <i class="fab fa-discord" />
      </bl-button>
      <bl-button variant="transparent small nospacing static">
        <i class="fas fa-globe-europe" />
      </bl-button>
    </div>
    <bl-button variant="transparent nospacing static">
      <i class="fas fa-bug" /> Bug melden?
    </bl-button>
  </div>
</template>

<script>
export default {
  name: 'SettingsSidebar',
  data: () => ({
    settings: [
      {
        divider:
          '<i class="fas fa-user-cog"></i>&nbsp;&nbsp;Benutzereinstellungen'
      },
      {
        html: '<i class="fas fa-user-circle"></i>&nbsp;Benutzer',
        to: 'Account'
      },
      {
        html: 'Abmelden&nbsp;<i class="fas fa-sign-out-alt"></i>',
        emit: 'Logout'
      },
      {
        divider: '<i class="fas fa-eye"></i>&nbsp;&nbsp;Erscheinung'
      },
      {
        html: '<i class="fas fa-desktop"></i>&nbsp;Bildschirm',
        to: 'Display'
      },
      {
        html: '<i class="fas fa-palette"></i>&nbsp;Aussehen',
        to: 'Appearance'
      },
      {
        html: '<i class="fas fa-language"></i>&nbsp;Sprache',
        to: 'Account'
      },
      {
        divider: '<i class="fas fa-cogs"></i>&nbsp;&nbsp;Systemeinstellungen'
      },
      {
        html: '<i class="fab fa-windows"></i>&nbsp;Windows',
        to: 'Account'
      },
      {
        html: '<i class="fas fa-bell"></i>&nbsp;Benachrichtigungen',
        to: 'Account'
      }
    ]
  }),
  methods: {
    onNavButtonClick (setting) {
      if (setting.emit) this.$emit('on' + setting.emit)
      if (setting.to) this.$emit('go-to', setting.to)
    }
  }
}
</script>
