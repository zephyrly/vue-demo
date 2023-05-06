// vue
import { initMinix } from "./init"
import { initLifeCycle } from "./lifecycle"
import { nextTick } from "./observe/watcher"

function Vue(options){ // options => 用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick
initMinix(Vue)
initLifeCycle(Vue)

export default Vue