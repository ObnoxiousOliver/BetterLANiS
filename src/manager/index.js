import json5 from 'json5'
import moment from 'moment'

const BASE_ADDRESS = 'https://start.schulportal.hessen.de/'
const LOGIN_ADDRESS = 'https://login.schulportal.hessen.de/'

export default {
  urls: {
    BASE_ADDRESS: BASE_ADDRESS,
    LOGIN_ADDRESS: LOGIN_ADDRESS
  },
  apps: {
    hidden: ['logout'],
    supported: {
      stundenplan: {
        name: 'timetable',
        route: '/timetable',
        icon: 'fas fa-clock',
        getData (link, callback) {
          fetch(BASE_ADDRESS + link, {
            headers: {
              'cache-control': 'no-cache',
              pragma: 'no-cache'
            }
          })
            .then(res => res.text())
            .then(data => {
              const parser = new DOMParser()
              const doc = parser.parseFromString(data, 'text/html')
              var dateSelect = doc.querySelector('#dateSelect')
              var dates = [{ getAttribute: () => '' }]

              var timetables = []

              if (dateSelect) {
                dates = dateSelect.getElementsByTagName('option')
              }

              dates.forEach((x, i) => {
                var date = x.getAttribute('value')
                fetch(BASE_ADDRESS + link, {
                  headers: {
                    'cache-control': 'no-cache',
                    pragma: 'no-cache'
                  },
                  body: `date=${date}`,
                  method: 'POST'
                })
                  .then(res => res.text())
                  .then(data => {
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(data, 'text/html')
                    const table = doc.querySelector('#all table')

                    var timetable = {
                      times: [],
                      lessions: []
                    }

                    table.querySelectorAll('tbody > tr').forEach((row, rowIndex) => {
                      timetable.lessions[rowIndex] = []
                      row.querySelectorAll('td').forEach((column, columnIndex) => {
                        if (columnIndex === 0) {
                          var startEnd = column.querySelector('.VonBis').textContent.split('-')

                          timetable.times[rowIndex] = {
                            start: startEnd[0].trim(),
                            end: startEnd[1].trim()
                          }
                        } else {
                          var lession = {
                            span: 1,
                            subjects: []
                          }

                          lession.span = parseInt(column.getAttribute('rowspan'))
                          column.querySelectorAll('.stunde').forEach((subject) => {
                            var html = subject.innerHTML

                            var badge = subject.querySelector('.badge')

                            var id = subject.getAttribute('data-mix')
                            var name = html.slice(html.indexOf('<b>') + 3, html.indexOf('</b>')).trim()
                            var room = badge
                              ? html.slice(html.indexOf('</b>') + 4, html.indexOf('<span')).trim()
                              : html.slice(html.indexOf('</b>') + 4, html.indexOf('<br>')).trim()
                            var teacher = html.slice(html.indexOf('<small>') + 7, html.indexOf('</small>')).trim()
                            var week = badge ? badge.textContent : undefined
                            lession.subjects.push({ id, name, room, teacher, week })
                          })

                          timetable.lessions[rowIndex].push(lession)
                        }
                      })
                    })

                    timetables.splice(i, 0, { ...timetable, date })

                    if (timetables.length === dates.length) {
                      timetables.sort((a, b) => moment(a.date).diff(moment(b.date)))
                      callback(timetables)
                    }
                  })
              })
            })
        }
      },
      kalender: {
        name: 'calendar',
        route: '/calendar',
        icon: 'bi-calendar2-week-fill',
        getData (link, callback) {
          fetch(BASE_ADDRESS + link)
            .then(res => res.text())
            .then(data => {
              const parser = new DOMParser()
              const doc = parser.parseFromString(data, 'text/html')
              const script = doc.querySelector('#content > script:nth-child(9):not(src)').text

              var categories = {}

              script.split(';')
                .filter(x => x.trim().startsWith('categories.push'))
                .map(x => x.substring(x.indexOf('(') + 1, x.indexOf(')')))
                .map(x => json5.parse(x))
                .forEach(x => { categories[x.id] = x })

              var ret = { categories }
              callback(ret)
            })
          // callback(link)
        },
        getMonth (dateString, callback) {
          var startEndD = moment(dateString)
          startEndD.date(1)
          startEndD.date(2 - (startEndD.weekday() || 7))
          var start = startEndD.format('YYYY-MM-DD')

          startEndD.date((startEndD.date() + 6 * 7) - 1)
          var end = startEndD.format('YYYY-MM-DD')

          var weekD = moment(start)
          var weekNumbers = []
          var weeks = []
          for (let index = 0; index < 6; index++) {
            weekNumbers.push(weekD.isoWeek())

            var dates = []
            for (let index = 0; index < 7; index++) {
              dates.push({
                date: weekD.date(),
                thisMonth: weekD.month() === moment(dateString).month()
              })
              // +1 day
              weekD.date(weekD.date() + 1)
            }
            weeks.push({ dates, events: [] })
          }

          fetch('https://start.schulportal.hessen.de/kalender.php', {
            headers: {
              accept: 'application/json, text/javascript, */*; q=0.01',
              'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'cache-control': 'no-cache',
              pragma: 'no-cache'
            },
            body: `f=getEvents&start=${start}&end=${end}`,
            method: 'POST'
          }).then(res => res.json())
            .then(data => {
              data.forEach(e => setEvent(e, false))

              function setEvent (event, toNewLine) {
                var evStyle = [toNewLine ? 'no-start' : '']
                if (moment(start).diff(event.start) >= 0) {
                  event.start = start

                  if (!toNewLine) {
                    evStyle.push('no-start')
                  }
                }
                if (moment(event.end).date(moment(event.end).date() + 1).diff(end) >= 0) {
                  event.end = moment(end).date(moment(end).date() + 1).format('YYYY-MM-DD')

                  evStyle.push('no-end')
                }

                var weekIndex = weekNumbers.indexOf(moment(event.start).isoWeek())

                var evStart = moment(event.start).day() || 7
                var evSpan = Math.ceil(moment.duration(moment(event.end).diff(event.start)).asDays())

                // If event exceeds week, go to new line
                if (evSpan + evStart - 1 > 7) {
                  // console.log(data)
                  evSpan = 8 - evStart

                  var nextLineEvent = { ...event }
                  nextLineEvent.start = moment(nextLineEvent.start).date(moment(nextLineEvent.start).date() + evSpan).format('YYYY-MM-DD')
                  evStyle.push('no-end')

                  setEvent(nextLineEvent, true)
                }

                weeks[weekIndex].events.push({
                  id: event.Id,
                  name: event.title,
                  start: evStart,
                  span: evSpan,
                  style: evStyle,
                  raw: event
                })
              }

              var monthData = { start, end, weekNumbers, weeks }
              callback(monthData)
            })
        }
      }
    }
  },
  loginLanis (user2, password, schoolId, callback) {
    const user = `${schoolId}.${user2}`
    const body = `user2=${user2}&user=${user}&password=${password}`

    fetch(LOGIN_ADDRESS + `?i=${schoolId}`, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        pragma: 'no-cache'
      },
      referrer: 'https://login.schulportal.hessen.de/?i=5137',
      body,
      method: 'POST'
    }).then(() => {
      if (callback) this.isLoggedIn((success, err) => callback(success, err))
    }).catch(e => {
      if (callback) this.isLoggedIn((success, err) => callback(success, err))
    })
  },
  isLoggedIn (callback) {
    var ret = false

    fetch(BASE_ADDRESS + 'startseite.php?a=ajax&f=apps', {
      method: 'GET',
      headers: {
        pragma: 'no-cache',
        'cache-control': 'no-cache'
      }
    })
      .then(res => res.text())
      .then(data => {
        try {
          var parsedData = JSON.parse(data)
          ret = parsedData.entrys !== undefined
        } catch {
          ret = false
        }
        if (callback) callback(ret)
      }).catch((e) => {
        if (callback) callback(ret, e)
      })
  },
  getApps (callback) {
    fetch(BASE_ADDRESS + 'startseite.php?a=ajax&f=apps')
      .then(res => res.json())
      .then(data => callback(data))
  }
}
