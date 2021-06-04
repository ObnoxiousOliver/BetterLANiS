import { createRouter, createWebHashHistory } from 'vue-router'

// Views
import Unsupported from '@/views/Unsupported'
import Home from '@/views/pages/Home'
import Timetable from '@/views/pages/Timetable'
import Calendar from '@/views/pages/Calendar'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/unsupported/:link',
    name: 'Unsupported',
    component: Unsupported
  },
  {
    path: '/timetable',
    name: 'Timetable',
    component: Timetable
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
