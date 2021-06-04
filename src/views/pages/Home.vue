<template>
  <div class="home-view-component scroll auto">
    <div class="wrapper">
      <h1 class="app-header"><i class="fas fa-home" /> Startseite</h1>
      <div class="card warning">
        <div class="card-header">
          <i class="fas fa-exclamation-triangle"/> Achtung
        </div>
        <div class="card-body">
          Diese Version steht noch unter starker Entwickelung.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Home',
  computed: {
    ...mapState(['apps'])
  }
}
</script>
