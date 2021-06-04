import { createApp } from 'vue'
import App from './App'
import router from './router'
import store from './store'
import BlButton from './components/input/BlButton'
import Tooltip from './components/input/Tooltip'
import ContextMenu from './components/input/ContextMenu'
import ContextSubmenu from './components/input/ContextSubmenu'

createApp(App)
  .use(store)
  .use(router)
  .component('bl-button', BlButton)
  .component('tooltip', Tooltip)
  .component('context-menu', ContextMenu)
  .component('context-submenu', ContextSubmenu)
  .mount('#app-mount')
