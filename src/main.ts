import './styles/base.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

// The page renders after the browser's own jump to a #link, so do the jump again once it exists.
if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
