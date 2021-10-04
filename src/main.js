import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
// import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css
import '@/styles/common.scss' 

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon.
import './permission' // permission control
import './utils/error-log' // error log
 
import { getDicts } from '@/api/system/config/dict-data'
import { getConfigKey } from '@/api/system/config/params'
import { addDateRange,selectDictLabel,handleTree,parseTime } from '@/utils/currency'

Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.handleTree = handleTree

Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type:"success"})
}

Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type:"error"})
}

import * as filters from './filters' // global filters
import permission from './directive/permission'

Vue.use(permission)

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
  // locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
