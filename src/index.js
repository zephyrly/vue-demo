// vue
import { initMinix } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'

function Vue(options) {
    // options => 用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick
initMinix(Vue)
initLifeCycle(Vue)

// 绥中转换的都是$watch
Vue.prototype.$watch = function (exportFn, cb, options = {}) {
    new Watcher(this, exportFn, { user: true }, cb)
}

export default Vue


