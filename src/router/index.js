import { createRouter, createWebHashHistory } from 'vue-router'

// Views
import Unsupported from '@/views/Unsupported'
import Home from '@/views/pages/Home'
import Timetable from '@/views/pages/Timetable'
import Calendar from '@/views/pages/Calendar'

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Home
  },
  {
    path: '/unsupported/:link',
    name: 'Interner Browser',
    component: Unsupported
  },
  {
    path: '/timetable',
    name: 'Stundenplan',
    component: Timetable
  },
  {
    path: '/calendar',
    name: 'Kalender',
    component: Calendar
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
