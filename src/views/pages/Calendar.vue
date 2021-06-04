<template>
  <div class="calendar-view-component scroll auto">
    <div class="wrapper">
      <h1 class="app-header"><i class="bi-calendar2-week" /> Kalender</h1>
      <bl-button
        @click="lastMonth"
        variant="static small"
      >Last</bl-button>
      <bl-button
        @click="nextMonth"
        variant="static small"
      >Next</bl-button>
      <div
        v-if="monthData"
        class="calendar month-view"
      >
        <div class="calendar-header">
          <div class="cell">KW</div>
          <div class="cell">Montag</div>
          <div class="cell">Dienstag</div>
          <div class="cell">Mittwoch</div>
          <div class="cell">Donnerstag</div>
          <div class="cell">Freitag</div>
          <div class="cell">Samstag</div>
          <div class="cell">Sonntag</div>
        </div>
        <div
          v-for="(week, weekIndex) in monthData.weeks"
          :key="weekIndex"
          class="calendar-row"
        >
          <div class="row-week cell">
            <span>{{ monthData.weekNumbers[weekIndex] }}</span>
          </div>
          <div class="row-skeleton">
            <div
              v-for="(_, dayIndex) in 7"
              :key="dayIndex"
              :class="['cell', isToday(weekIndex, dayIndex) ? 'is-today' : '']"
            >
              <div />
            </div>
          </div>
          <div class="row-header">
            <div
              v-for="(date, dayIndex) in week.dates"
              :key="dayIndex"
              :class="[
                'cell',
                isToday(weekIndex, dayIndex) ? 'is-today' : '',
                date.thisMonth ? '' : 'not-this-month'
              ]"
            >
              {{ date.date }}
            </div>
          </div>
          <div class="events">
            <div
              v-for="(event, eventIndex) in week.events"
              :key="eventIndex"
              :class="['event', event.style, event.id === hoveringEvent ? 'active' : '']"
              :style="{
                'grid-column': event.start + ' / span ' + event.span
              }"
              @mouseenter="hoveringEvent = event.id"
              @mouseleave="hoveringEvent = undefined"
              @click="selectedEvent = event"
            >
              <div>
                {{ event.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal :active="selectedEvent" @closemodal="selectedEvent = undefined">
      <template #header>{{ selectedEvent.name }}</template>
      <div class="event-details">
        <div v-if="selectedEvent.raw.description" class="event-description">{{ selectedEvent.raw.description }}</div>
        <div v-else class="event-no-description">Keine Beschreibung</div>
        {{ formatDate(selectedEvent.raw.Anfang) }}
      </div>
    </Modal>
  </div>
</template>

<script>
import moment from 'moment'
import manager from '@/manager'
import { mapState } from 'vuex'
import Modal from '../../components/Modal.vue'

export default {
  name: 'Calendar',
  components: { Modal },
  computed: {
    ...mapState([
      'apps'
    ])
  },
  data: () => ({
    hoveringEvent: undefined,
    selectedEvent: undefined,
    monthData: undefined,
    month: moment().format('YYYY-MM-01')
  }),
  methods: {
    isToday (week, day) {
      var today = moment()
      var target = moment(this.monthData.start)
      target.date(target.date() + week * 7 + day)
      return today.format('YYYY-MM-DD') === target.format('YYYY-MM-DD')
    },
    nextMonth () {
      this.month = moment(this.month).month(moment(this.month).month() + 1).format('YYYY-MM-01')

      manager.apps.supported.kalender.getMonth(this.month, data => {
        this.monthData = data
        // console.log(data)
      })
    },
    lastMonth () {
      this.month = moment(this.month).month(moment(this.month).month() - 1).format('YYYY-MM-01')

      manager.apps.supported.kalender.getMonth(this.month, data => {
        this.monthData = data
        // console.log(data)
      })
    },
    formatDate (date) {
      return moment(date).format('DD.MM.YYYY')
    }
  },
  mounted () {
    manager.apps.supported.kalender.getMonth(this.month, data => {
      this.monthData = data
    })
  }
}
</script>
