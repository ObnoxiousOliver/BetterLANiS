<template>
  <div class="component-news-renderer scroll y auto">
    <div v-if="date" class="news-date">Veröffentlicht am {{ date }}</div>
    <div class="news-content" v-html="newsHtml"/>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'NewsRenderer',
  props: {
    version: String,
    repo: Object
  },
  data: () => ({
    newsHtml: '<div class="loader-container"><div class="loader"></div>Lade...</div>',
    date: ''
  }),
  mounted () {
    fetch(`https://api.github.com/repos/${this.repo.gitUser}/${this.repo.gitRepo}/releases`,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from('*:' + this.repo.token).toString('base64')
        }
      })
      .then(res => res.json())
      .then(data => {
        try {
          const release = data.filter(x => x.body)[0]
          this.newsHtml = release.body
          this.date = moment(release.published_at).format('DD.MM.YYYY')
        } catch {
          this.newsHtml = '<p class="no-news">Keine Neuigkeiten für diese Version</p>'
        }
      })
  }
}
</script>
