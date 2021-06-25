<template>
  <div class="calendar-view-component scroll auto">
    <div class="wrapper" ref="wrapper">
      <h1 class="app-header">
        <i class="bi-calendar2-week-fill" /> Kalender
      </h1>
      <div class="calendar-controls">
        <bl-button class="last-month" @click="lastMonth">
          <i class="bi-chevron-left" />
        </bl-button>

        <div class="date-info">
          <h2 class="date-current-month">
            {{ monthToString(currentMonth.month()) }}
            {{ currentMonth.year() }}
          </h2>
          <tooltip class="date-today" placement="bottom">
            <template #activator>
              <div tabindex="0" @click="goToTodaysMonth">
                Heute: {{ today.format('DD.MM.YYYY') }}
              </div>
            </template>
            Gehe zum
            {{ monthToString(today.month()) }}
            {{ today.year() }}
          </tooltip>
        </div>

        <bl-button class="next-month" @click="nextMonth">
          <i class="bi-chevron-right" />
        </bl-button>
      </div>

      <!-- Calendar View -->
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
              :tabindex="selectedEvent ? -1 : 0"
            >
              <div>
                {{ event.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popup Modal for selected Event -->
    <Modal
      @closemodal="selectedEvent = undefined"
      :active="selectedEvent"
      :nofocus="[$refs.wrapper]"
    >
      <template #header>{{ selectedEvent.name }}</template>
      <div class="event-details">
        <div v-if="selectedEvent.raw.description" v-html="selectedEvent.raw.description" class="event-description" />
        <div v-else class="event-no-description">Keine Beschreibung</div>
        vom {{ formatDate(selectedEvent.raw.Anfang) }}
        bis {{ formatDate(selectedEvent.raw.Ende) }}
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
    ]),
    today () {
      return moment()
    },
    currentMonth () {
      return moment(this.month)
    }
  },
  data: () => ({
    hoveringEvent: undefined,
    selectedEvent: undefined,
    monthData: undefined,
    month: moment().format('YYYY-MM-01')
  }),
  methods: {
    isToday (week, day) {
      var target = moment(this.monthData.start)
      target.date(target.date() + week * 7 + day)
      return this.today.format('YYYY-MM-DD') === target.format('YYYY-MM-DD')
    },
    nextMonth () {
      this.month = moment(this.month).month(moment(this.month).month() + 1).format('YYYY-MM-01')
      this.updateCalendar()
    },
    lastMonth () {
      this.month = moment(this.month).month(moment(this.month).month() - 1).format('YYYY-MM-01')
      this.updateCalendar()
    },
    goToTodaysMonth () {
      this.month = this.today.format('YYYY-MM-01')
      this.updateCalendar()
    },
    updateCalendar () {
      manager.apps.supported.kalender.getMonth(this.month, data => {
        this.monthData = data
        // console.log(data)
      })
    },
    formatDate (date) {
      return moment(date).format('DD.MM.YYYY')
    },
    monthToString (monthIndex) {
      var monthArray = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'July',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
      ]
      return monthArray[monthIndex]
    }
  },
  mounted () {
    manager.apps.supported.kalender.getMonth(this.month, data => {
      this.monthData = data
    })
  }
}
</script>
