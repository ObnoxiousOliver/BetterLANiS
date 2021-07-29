<template>
  <div class="timetable-view-component scroll auto">
    <div class="wrapper">
      <h1 class="app-header">
        <i class="fas fa-clock" /> Stundenplan
        <span v-if="loggedInUser.class"> der {{ loggedInUser.class }}</span>
      </h1>
      <div class="date-info">
        <div class="date-today">
          Heute: {{ dayOfWeekString }}, {{ today.format('DD.MM.YYYY') }}
        </div>
        <tooltip placement="bottom">
          <template #activator>
            <div class="week">
              <span :class="['a' ,abWeek === 'A' ? 'active' : '']">A</span>
              <span :class="['b' ,abWeek === 'B' ? 'active' : '']">B</span>
            </div>
          </template>
          Diese Woche ist eine {{ abWeek }}-Woche
        </tooltip>
      </div>
      <div v-if="timetables.length > 1 && timetable" class="date-panel scroll auto x">
        <div class="date-panel-buttons">
          <bl-button
            v-for="(date, dateIndex) in timetables.map(x => x.date)" :key="dateIndex"
            :variant="(date === timetable.date ? 'primary' : '') + ' no-caps'"
            @click="timetable = timetables[timetables.map(x => x.date).indexOf(date)]"
          >
            ab {{ dateNames[dateIndex].from }}
            <span v-if="dateNames[dateIndex].to" class="small">(bis {{ dateNames[dateIndex].to }})</span>
          </bl-button>
        </div>
      </div>
      <div class="timetable-container">
        <div
          v-if="timelineCursorTop"
          class="timetable-timeline-cursor"
          :style="{
            top: timelineCursorTop
          }"
        >
          <div class="timeline-cursor-arrow">Jetzt</div>
        </div>
        <div class="timetable-border">
          <table v-if="timetable" ref="timetable" class="timetable">
            <thead>
              <tr>
                <td class="timetable-data timetable-header">
                  Stunden
                </td>
                <td
                  :class="[
                    'timetable-data',
                    'timetable-header',
                    today.day() === 1 ? 'is-today' : ''
                  ]"
                >
                  Montag
                </td>
                <td
                  :class="[
                    'timetable-data',
                    'timetable-header',
                    today.day() === 2 ? 'is-today' : ''
                  ]"
                >
                  Dienstag
                </td>
                <td
                  :class="[
                    'timetable-data',
                    'timetable-header',
                    today.day() === 3 ? 'is-today' : ''
                  ]"
                >
                  Mittwoch
                </td>
                <td
                  :class="[
                    'timetable-data',
                    'timetable-header',
                    today.day() === 4 ? 'is-today' : ''
                  ]"
                >
                  Donnerstag
                </td>
                <td
                  :class="[
                    'timetable-data',
                    'timetable-header',
                    today.day() === 5 ? 'is-today' : ''
                  ]"
                >
                  Freitag
                </td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in timetable.lessions"
                :key="rowIndex"
                :class="[
                  'timetable-row', isEmpty(rowIndex) ? 'empty-row' : '',
                  hoveringRows.includes(rowIndex) ? 'hover' : ''
                ]"
                @mouseenter="hoveringRows.push(rowIndex)"
                @mouseleave="hoveringRows = []"
              >
                <td
                  class="timetable-data timetable-time"
                  @mouseenter="addHoveringRows(rowIndex, 1)"
                >
                  <span class="time-header">{{ rowIndex + 1 }}. Stunde</span>
                  <span class="time-start-end">{{ timetable.times[rowIndex].start }} - {{ timetable.times[rowIndex].end }}</span>
                </td>
                <td
                  v-for="(lession, columnIndex) in row"
                  :key="columnIndex"
                  :class="[
                    'timetable-data',
                    'timetable-lession',
                    hoveringRows.filter(x => rowIndex < x && x <= rowIndex + lession.span - 1).length
                      && !hoveringRows.includes(rowIndex)
                      ? 'hover' : '',
                    lession.subjects.length > 1 ? 'multiple-entrys' : ''
                  ]"
                  :ref="rowIndex + '-' + columnIndex"
                  :rowspan="lession.span"
                  @mouseenter="addHoveringRows(rowIndex, lession.span)"
                >
                  <!-- :style="{
                    '--background': lession.subjects.length === 1
                      ? getLessionColor(lession.subjects[0].name)
                      : '',
                    '--color': lession.subjects.length === 1
                      ? (getLessionColor(lession.subjects[0].name)
                        ? color.getContrastYIQ(getLessionColor(lession.subjects[0].name))
                        : '')
                      : ''
                  }" -->
                  <div
                    v-for="(subject, subjectIndex) in lession.subjects"
                    :key="'subject' + subjectIndex"
                    :class="['timetable-subject', subject.id === activeSubject ? 'active' : '']"
                    @mouseleave="activeSubject = undefined"
                    @mouseenter="activeSubject = subject.id"
                  >
                    <div class="subject-layout">
                      <span class="subject-name">
                        {{ subject.name }}
                      </span> <span
                        class="subject-room"
                        v-if="subject.room"
                      >{{ subject.room }}</span> <span
                        :class="['subject-week', abWeek === subject.week.toUpperCase() ? 'active' : '']"
                        v-if="subject.week"
                      >
                        {{ subject.week }}
                      </span><br>
                      <span
                        class="subject-teacher"
                        v-if="subject.teacher"
                      >
                        {{ subject.teacher }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <bl-button @click="downloadAsPDF">
        <i class="far fa-file-pdf" /> PDF herunterladen
      </bl-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters, mapState } from 'vuex'

import manager from '@/manager'
import color from '@/color'
import { ipcRenderer } from 'electron'
import fs from 'fs'

export default {
  name: 'Timetable',
  computed: {
    ...mapState([
      'apps',
      'loggedInUser'
    ]),
    ...mapGetters([
      'currentSchool'
    ]),
    timetables () {
      return this.apps.supported.timetable.data
    },
    abWeek () {
      return this.today.isoWeek() % 2 === 0 ? 'A' : 'B'
    },
    today () {
      return moment()
    },
    manager () {
      return manager
    },
    dayOfWeekString () {
      switch (this.today.day()) {
        default:
          return 'So'
        case 1:
          return 'Mo'
        case 2:
          return 'Di'
        case 3:
          return 'Mi'
        case 4:
          return 'Do'
        case 5:
          return 'Fr'
        case 6:
          return 'Sa'
      }
    },
    dateNames () {
      var dateNames = []
      if (this.timetables) {
        this.timetables.forEach((x, i) => {
          if (this.timetables.length < i + 2) {
            dateNames.push({
              from: moment(x.date).format('DD.MM.YYYY')
            })
          } else {
            var toDate = moment(this.timetables[i + 1].date)
            dateNames.push({
              from: moment(x.date).format('DD.MM.YYYY'),
              to: toDate.date(toDate.date() - 1).format('DD.MM.YYYY')
            })
          }
        })
      }
      return dateNames
    },
    color () {
      return color
    }
  },
  data: () => ({
    activeSubject: undefined,
    hoveringRows: [],
    timetable: { date: undefined },
    timelineCursorTop: 0,
    updateInterval: undefined
  }),
  methods: {
    ...mapActions([
      'notify'
    ]),
    isEmpty (row, timetable) {
      // if on current row is no lession check rows above
      if (this.timetable.lessions[row].filter(x => x.span).length === 0) {
        for (let i = 0; i < row; i++) {
          // if on current row is no continue checking
          if (this.timetable.lessions[i].filter(x => x.span > row - i).length === 0) {
            continue
          } else {
            return false
          }
        }
      } else {
        return false
      }
      return true
    },
    addHoveringRows (row, span) {
      this.hoveringRows = []
      this.hoveringRows.push(row)
      for (let i = 0; i < span; i++) {
        this.hoveringRows.push(row + i)
      }
    },
    downloadAsPDF () {
      ipcRenderer.send('saveDialog', {
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
        defaultPath: 'stundenplan_' + this.loggedInUser.username + '.pdf'
      })
      ipcRenderer.once('saveDialogRes', (e, save) => {
        if (save.canceled) return

        this.notify({
          title: 'Stundenplan',
          message: 'wird heruntergeladen...'
        })

        fetch(manager.urls.BASE_ADDRESS +
        this.apps.supported.timetable.link +
        `?e=1&a=detail_klasse&pdf=1${this.timetable.date ? `&date=${this.timetable.date}` : ''}`)
          .then(res => res.arrayBuffer())
          .then(data => {
            fs.writeFileSync(save.filePath, Buffer.from(data))
            require('child_process').exec(save.filePath)
          })
      })
    },
    getLessionColor (name) {
      var colors = [
        { s: ['D', 'Deu', 'Deutsch'], v: '#e43232' },
        { s: ['M', 'Mat', 'Mathe'], v: '#1a6bbb' },
        { s: ['E', 'Eng', 'English'], v: '#efdc50' },
        { s: ['G', 'Ge', 'Geschichte'], v: '#634022' },
        { s: ['Sp', 'Spo', 'Sport'], v: '#2d2833' },
        { s: ['Bio', 'Biologie', 'Ch'], v: '#108c37' },
        { s: ['Ek', 'Erd', 'Erdkunde'], v: '#104c2b' },
        { s: ['F', 'Fr', 'Franz', 'Französisch'], v: '#e49632' }
      ]

      try {
        return colors.find(x => x.s.includes(name)).v
      } catch { return '' }
    },
    updateTimeline () {
      try {
        const tt = this.$refs.timetable
        var theadHeight = tt.querySelector('thead').clientHeight
        var times = []
        tt.querySelectorAll('.timetable-row .timetable-time')
          .forEach((x, i) => times.push({
            height: x.getBoundingClientRect().height,
            start: moment(this.timetable.times[i].start, 'H:mm'),
            end: moment(this.timetable.times[i].end, 'H:mm')
          }))

        var now = moment()

        if (now.diff(times[0].start) < 0 || now.diff(times[times.length - 1].end) > 0) {
          this.timelineCursorTop = undefined
          return
        }

        var row = times.filter(x => now.diff(x.start, 'minutes') > 0).length - 1

        const lerp = (x, y, a) => x * (1 - a) + y * a
        const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a))

        this.timelineCursorTop = (times.map(x => x.height).reduce((a, b, i) => i >= row
          ? (i === row
            ? a + lerp(0, b, clamp(now.diff(times[i].start) / times[i].end.diff(times[i].start)))
            : a)
          : a + b
        , 0) + theadHeight) + 'px'
      } catch {}
    }
  },
  mounted () {
    this.timetable = this.timetables[0]

    var resizeOb = new ResizeObserver(this.updateTimeline)
    resizeOb.observe(this.$refs.timetable)
    setTimeout(this.updateTimeline)
    this.updateInterval = setInterval(this.updateTimeline, 1000 * 60)
  },
  unmounted () {
    clearInterval(this.updateInterval)
  }
}
</script>
