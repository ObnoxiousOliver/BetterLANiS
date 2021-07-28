<template>
  <div class="calendar-view-component scroll auto">
    <div class="wrapper" ref="wrapper">
      <h1 class="app-header">
        <i class="bi-calendar2-week-fill" /> Kalender
      </h1>

      <div class="calendar-panel">
        <h2><i class="bi-funnel-fill" /> Filter</h2>
        <div class="panel-controls">
          <input
            type="text"
            class="input-field event-search"
            placeholder="Nach Titel/Ort/Beschreibung suchen..."
            v-model="searchString"
          >
          <DropdownMenu
            @itemselected="categoryFilterSelected"
            :data="categoryFilter"
            class="category-dropdown"
          />
          <DropdownMenu
            @itemselected="calendarViewSelected"
            :data="calendarViews"
            :defaultIndex="0"
            class="calendar-view-dropdown"
            ref="calendarViewDropdown"
          />
        </div>
      </div>

      <div v-if="calendarView === 'year'" class="calendar-container view-year">
        <div class="calendar-controls">
          <bl-button class="last" @click="lastYear" @click.ctrl="lastDecade">
            <i class="bi-chevron-left" />
          </bl-button>

          <div class="date-info">
            <h2 class="date-current">
              <!-- <i
                v-if="yearToIcon(currentDate.year())"
                :class="yearToIcon(currentDate.year()).i"
                :style="{
                  color: yearToIcon(currentDate.year()).c,
                  '-webkit-text-stroke': color.getContrastYIQ(yearToIcon(currentDate.year()).c) + ' 1px'
                }"
              /> -->
              {{ currentDate.year() }}
            </h2>
            <tooltip class="date-today" placement="bottom">
              <template #activator>
                <button class="inline-btn" @click="goToToday">
                  Heute: {{ today.format('DD.MM.YYYY') }}
                </button>
              </template>
              Gehe zum
              {{ today.format('DD.MM.YYYY') }}
            </tooltip>
          </div>

          <bl-button class="next" @click="nextYear" @click.ctrl="nextDecade">
            <i class="bi-chevron-right" />
          </bl-button>
        </div>

        <div
          v-if="yearData"
          class="calendar"
        >
          <div
            class="events"
            v-for="month in yearData"
            :key="month.date.format('YYYY-MM-DD')"
          >
            <transition name="event-month">
              <h2
                class="event-month"
                v-show="month.events.filter(e => matchesSearch(e)).length"
              >
                {{ monthToString(month.date.month()) }} {{ month.date.year() }}
              </h2>
            </transition>
            <div
              v-for="event in month.events"
              :key="event.id"
              class="event-container"
            >
              <transition name="event">
                <button
                  @click="selectedEvent = event"
                  class="event"
                  v-show="matchesSearch(event)"
                >
                  <div class="event-category" :style="{
                    ...categories[event.raw.category] ? {
                        '--background': color.pastelify(categories[event.raw.category].color),
                        '--color': color.getContrastYIQ(color.pastelify(categories[event.raw.category].color))
                      } : {}
                    }"
                  >
                    <i
                      v-if="categories[event.raw.category]"
                      :class="mapIcon(categories[event.raw.category].logo)"
                    />
                    <i v-else class="bi-three-dots" />
                  </div>
                  <div
                    v-if="moment(event.raw.Anfang).format('YYYY-MM-DD') !== moment(event.raw.Ende).format('YYYY-MM-DD')"
                    class="event-date"
                  >
                    {{ moment(event.raw.Anfang).format('DD.MM.YYYY') }}<br>
                    - {{ moment(event.raw.Ende).format('DD.MM.YYYY') }}
                  </div>
                  <div v-else class="event-date">
                    {{ moment(event.raw.Anfang).format('DD.MM.YYYY') }}
                  </div>
                  <h3 class="event-name">{{ event.name }}</h3>
                </button>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="calendarView === 'week'" class="calendar-container view-week">
        <div class="calendar-controls">
          <bl-button class="last" @click="lastWeek" @click.ctrl="lastWeek">
            <i class="bi-chevron-left" />
          </bl-button>

          <div class="date-info">
            <h2 class="date-current">
              KW {{ currentDate.isoWeek() }}
              <span class="small secondary">({{ moment(currentDate).weekday(1).format('DD.MM') }} -
              {{ moment(currentDate).weekday(7).format('DD.MM.YYYY') }})</span>
            </h2>
            <tooltip class="date-today" placement="bottom">
              <template #activator>
                <button class="inline-btn" @click="goToToday">
                  Heute: {{ today.format('DD.MM.YYYY') }}
                </button>
              </template>
              Gehe zum
              {{ today.format('DD.MM.YYYY') }}
            </tooltip>
          </div>

          <bl-button class="next" @click="nextWeek" @click.ctrl="nextWeek">
            <i class="bi-chevron-right" />
          </bl-button>
        </div>

        <div v-if="weekData" class="calendar-table">
          <div class="calendar-header">
            <div class="cell">Montag</div>
            <div class="cell">Dienstag</div>
            <div class="cell">Mittwoch</div>
            <div class="cell">Donnerstag</div>
            <div class="cell">Freitag</div>
            <div class="cell">Samstag</div>
            <div class="cell">Sonntag</div>
          </div>
          <div class="calendar-row">
            <div class="row-skeleton">
              <div
                v-for="(_, dayIndex) in 7"
                :key="dayIndex"
                :class="[
                  'cell',
                  moment(currentDate).weekday(dayIndex + 1).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
                    ? 'is-today' : ''
                ]"
              >
                <div />
              </div>
            </div>

            <div class="row-header">
              <div
                v-for="(_, dayIndex) in 7"
                :key="dayIndex"
                :class="[
                  'cell',
                  moment(currentDate).weekday(dayIndex + 1).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
                    ? 'is-today' : ''
                ]"
              >
                {{ moment(currentDate).weekday(dayIndex + 1).date() }}
              </div>
            </div>

            <div class="events">
              <button
                v-for="event in weekData.week"
                :key="`${event.id}:${weekData.start}`"
                :class="['event inline-btn', event.style, event.id === hoveringEvent ? 'active' : '']"
                :style="{
                  'grid-column': event.start + ' / span ' + event.span,
                  opacity: matchesSearch(event) ? '' : '0.1',
                  ...categories[event.raw.category] ? {
                    '--background': color.pastelify(categories[event.raw.category].color),
                    '--color': color.getContrastYIQ(color.pastelify(categories[event.raw.category].color))
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
                    :class="mapIcon(categories[event.raw.category].logo)"
                  /> {{ event.name }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="calendar-container view-month">
        <div class="calendar-controls">
          <bl-button class="last" @click="lastMonth">
            <i class="bi-chevron-left" />
          </bl-button>

          <div class="date-info">
            <h2 class="date-current">
              <i :class="['season-icon',
                'season-' + ['spring', 'summer', 'fall', 'winter']
                  .filter((x, i) => getSeason(currentDate.month()) === i)[0],
                monthToIcon(currentDate.month())]"
              />
              {{ monthToString(currentDate.month()) }}
              {{ currentDate.year() }}
            </h2>
            <tooltip class="date-today" placement="bottom">
              <template #activator>
                <button class="inline-btn" @click="goToToday">
                  Heute: {{ today.format('DD.MM.YYYY') }}
                </button>
              </template>
              Gehe zum
              {{ today.format('DD.MM.YYYY') }}
            </tooltip>
          </div>

          <bl-button class="next" @click="nextMonth">
            <i class="bi-chevron-right" />
          </bl-button>
        </div>

        <!-- Calendar View -->
        <div
          v-if="monthData"
          class="calendar-table"
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
                :key="`${event.id}:${week.dates[weekIndex].date}`"
                :class="['event inline-btn', event.style, event.id === hoveringEvent ? 'active' : '']"
                :style="{
                  'grid-column': event.start + ' / span ' + event.span,
                  opacity: matchesSearch(event) ? '' : '0.1',
                  ...categories[event.raw.category] ? {
                    '--background': color.pastelify(categories[event.raw.category].color),
                    '--color': color.getContrastYIQ(color.pastelify(categories[event.raw.category].color))
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
                    :class="mapIcon(categories[event.raw.category].logo)"
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
      :active="selectedEvent !== undefined"
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
          :class="mapIcon(categories[selectedEvent.raw.category].logo)"
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
import icons from '@/icons'

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
    currentDate () {
      return moment(this.date)
    },
    categories () {
      return this.apps.supported.calendar.data.categories
    },
    categoryFilter () {
      return [
        { value: {}, content: 'Alle Kategorien' },
        ...Object.values(this.categories).map(x => ({
          value: x,
          content: `<i class="${icons.mapIcon(x.logo)}" ></i> ${x.name}`
        }))
      ]
    },
    color () {
      return color
    },
    moment () {
      return moment
    },
    calendarViews () {
      return [
        { value: 'year', content: '<i class=\u0022bi-list-ul\u0022></i> Jahr' },
        { value: 'month', content: '<i class=\u0022bi-calendar2-week\u0022></i> Monat' },
        { value: 'week', content: '<i class=\u0022bi-layout-three-columns\u0022></i> Woche' }
      ]
    }
  },
  data: () => ({
    hoveringEvent: undefined,
    selectedEvent: undefined,
    monthData: undefined,
    weekData: undefined,
    date: moment().format('YYYY-MM-DD'),
    yearData: undefined,
    calendarView: undefined,
    searchString: '',
    filterCategory: 0
  }),
  mounted () {
    this.$refs.calendarViewDropdown.setIndex(1)
  },
  watch: {
    calendarView (val) {
      this.updateCalendar()
    }
  },
  methods: {
    mapIcon (icon) {
      return icons.mapIcon(icon)
    },
    isToday (week, day) {
      var target = moment(this.monthData.start)
      target.date(target.date() + week * 7 + day)
      return this.today.format('YYYY-MM-DD') === target.format('YYYY-MM-DD')
    },
    nextWeek () {
      this.date = moment(this.date).isoWeek(moment(this.date).isoWeek() + 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    lastWeek () {
      this.date = moment(this.date).isoWeek(moment(this.date).isoWeek() - 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    nextMonth () {
      this.date = moment(this.date).month(moment(this.date).month() + 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    lastMonth () {
      this.date = moment(this.date).month(moment(this.date).month() - 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    nextYear (e) {
      if (e.ctrlKey) return
      this.date = moment(this.date).year(moment(this.date).year() + 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    lastYear (e) {
      if (e.ctrlKey) return
      this.date = moment(this.date).year(moment(this.date).year() - 1).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    nextDecade () {
      this.date = moment(this.date).year(moment(this.date).year() + 10).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    lastDecade () {
      this.date = moment(this.date).year(moment(this.date).year() - 10).format('YYYY-MM-DD')
      this.updateCalendar()
    },
    goToToday () {
      this.date = this.today.format('YYYY-MM-DD')
      this.updateCalendar()
    },
    updateCalendar () {
      switch (this.calendarView) {
        case 'year':
          this.updateYearCalendar()
          break
        case 'week':
          this.updateWeekCalendar()
          break
        default:
          this.updateMonthCalendar()
          break
      }
    },
    updateWeekCalendar () {
      manager.apps.supported.kalender.getWeek(this.date, data => {
        this.weekData = data
      })
    },
    updateMonthCalendar () {
      manager.apps.supported.kalender.getMonth(this.date, data => {
        this.monthData = data
      })
    },
    updateYearCalendar () {
      manager.apps.supported.kalender.getYear(this.date, data => {
        this.yearData = data
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
        'Juli',
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
    yearToIcon (year) {
      var yearArray = [
        /* 00 */ undefined,
        /* 01 */ { c: '#555', i: 'fas fa-smog' },
        /* 02 */ { c: '#fff791', i: 'fas fa-charging-station' },
        /* 03 */ { c: '#aaa', i: 'fas fa-space-shuttle' },
        /* 04 */ { c: '#000', i: 'fas fa-fist-raised' },
        /* 05 */ { c: '#4ec0f7', i: 'fas fa-atom' },
        /* 06 */ { c: '#ff0', i: 'fas fa-radiation' },
        /* 07 */ { c: '#7dda17', i: 'fas fa-biohazard' },
        /* 08 */ { c: '#f11', i: 'fas fa-skull-crossbones' },
        /* 09 */ { c: '#5fcc44', i: 'fas fa-seedling' },
        /* 10 */ { c: '#b71752', i: 'fas fa-virus' },
        /* 11 */ { c: '#999', i: 'fas fa-mobile' },
        /* 12 */ { c: '#ff6ba8', i: 'fas fa-peace' },
        /* 13 */ { c: '#f11', i: 'fas fa-heart-broken' },
        /* 14 */ { c: '#111', i: 'fas fa-industry' }
      ]

      return yearArray[this.getYearEvolutionIndex(year)]
    },
    getSeason (monthIndex) {
      var season = [3, 0, 1, 2, 3]
      return season[Math.floor((monthIndex + 1) / 3)]
    },
    getYearEvolutionIndex (y) {
      function r (min, max) {
        return y >= min && y < max
      }

      switch (true) {
        default: return 0
        case (r(1850, 1939)): return 14
        case (r(1939, 1946)): return 13
        case (r(1946, 1980)): return 12
        case (r(1980, 2020)): return 11
        case (r(2020, 2022)): return 10
        case (r(2022, 2100)): return 1
        case (r(2100, 2250)): return 2
        case (r(2250, 2310)): return 3
        case (r(2310, 2350)): return 4
        case (r(2350, 2380)): return 5
        case (r(2380, 2400)): return 6
        case (r(2400, 2420)): return 7
        case (r(2420, 3200)): return 8
        case (r(3200, Infinity)): return 9
      }
    },
    categoryFilterSelected (category) {
      this.filterCategory = category.value.id
    },
    calendarViewSelected (view) {
      this.calendarView = view.value
    },
    matchesSearch (event) {
      if (this.filterCategory) {
        if (this.filterCategory !== parseInt(event.raw.category)) return false
      }

      if (this.searchString.trim() !== '') {
        const keywords = this.searchString.trim().toLowerCase().split(' ')
        return keywords.every(key =>
          event.name.toLowerCase().includes(key) ||
          (event.raw.Ort
            ? event.raw.Ort.toLowerCase().includes(key)
            : false) ||
          (event.raw.description
            ? event.raw.description.toLowerCase().includes(key)
            : false))
      } else return true
    },
    getHeight (e) {
      console.log(e)
    }
  }
}
</script>
