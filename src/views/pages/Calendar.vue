<template>
  <div class="calendar-view-component scroll auto">
    <div class="wrapper" ref="wrapper">
      <h1 class="app-header">
        <i class="bi-calendar2-week-fill" /> Kalender
      </h1>

      <div class="calendar-container">
        <div class="calendar-controls">
          <bl-button class="last-month" @click="lastMonth">
            <i class="bi-chevron-left" />
          </bl-button>

          <div class="date-info">
            <h2 class="date-current-month">
              <i :class="['season-icon',
                'season-' + ['spring', 'summer', 'fall', 'winter']
                  .filter((x, i) => getSeason(currentMonth.month()) === i)[0],
                monthToIcon(currentMonth.month())]" />
              {{ monthToString(currentMonth.month()) }}
              {{ currentMonth.year() }}
            </h2>
            <tooltip class="date-today" placement="bottom">
              <template #activator>
                <button class="inline-btn" @click="goToTodaysMonth">
                  Heute: {{ today.format('DD.MM.YYYY') }}
                </button>
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

        <div class="calendar-panel">
          <h2><i class="bi-funnel-fill" /> Filter</h2>
          <div class="panel-controls">
            <input
              type="text"
              class="input-field event-search"
              placeholder="Nach Titel/Ort/Beschreibung suchen..."
            >
            <DropdownMenu
              @itemselected="categoryFilterSelected"
              :data="categoryFilter"
              class="category-dropdown"
            />
          </div>
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
              <button
                v-for="event in week.events"
                :key="event.id + event.start + event.span"
                :class="['event inline-btn', event.style, event.id === hoveringEvent ? 'active' : '']"
                :style="{
                  'grid-column': event.start + ' / span ' + event.span,
                  ...categories[event.raw.category] ? {
                    'background-color': color.pastelify(categories[event.raw.category].color),
                    color: color.getContrastYIQ(color.pastelify(categories[event.raw.category].color))
                  } : {}
                }"
                @mouseenter="hoveringEvent = event.id"
                @mouseleave="hoveringEvent = undefined"
                @click="selectedEvent = event"
                :tabindex="selectedEvent ? -1 : 0"
              >
                <div>
                  <i
                    v-if="categories[event.raw.category]"
                    :class="categories[event.raw.category].logo"
                  /> {{ event.name }}
                </div>
              </button>
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
      class="selected-event-modal"
    >
      <template #header>
        <div :style="{
          ...categories[selectedEvent.raw.category] ? {
            'background-color': color.pastelify(categories[selectedEvent.raw.category].color),
            color: color.getContrastYIQ(color.pastelify(categories[selectedEvent.raw.category].color))
          } : {}
        }" class="event-header">
        <i
          v-if="categories[selectedEvent.raw.category]"
          :class="categories[selectedEvent.raw.category].logo"
        />
          {{ selectedEvent.name }}
        </div>
      </template>
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
import color from '@/color'

import { mapState } from 'vuex'
import Modal from '@/components/Modal.vue'
import DropdownMenu from '@/components/input/DropdownMenu.vue'

export default {
  name: 'Calendar',
  components: {
    Modal,
    DropdownMenu
  },
  computed: {
    ...mapState([
      'apps'
    ]),
    today () {
      return moment()
    },
    currentMonth () {
      return moment(this.month)
    },
    categories () {
      return this.apps.supported.calendar.data.categories
    },
    categoryFilter () {
      return [
        { value: { id: 0 }, content: 'Alle Kategorien' },
        ...Object.values(this.categories).map(x => ({
          value: x,
          content: `<i class="${x.logo}" ></i> ${x.name}`
        }))
      ]
    },
    color () {
      return color
    }
  },
  data: () => ({
    hoveringEvent: undefined,
    selectedEvent: undefined,
    monthData: undefined,
    month: moment().format('YYYY-MM-01'),
    pastel: ''
  }),
  mounted () {
    manager.apps.supported.kalender.getMonth(this.month, data => {
      this.monthData = data
    })
  },
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
    },
    monthToIcon (monthIndex) {
      var monthArray = [
        'bi-flower3',
        'bi-brightness-high',
        'fas fa-leaf',
        'bi-snow'
      ]
      return monthArray[this.getSeason(monthIndex)]
    },
    getSeason (monthIndex) {
      var season = [3, 0, 1, 2, 3]
      return season[Math.floor((monthIndex + 1) / 3)]
    },
    categoryFilterSelected (category) {
    }
  }
}
</script>
