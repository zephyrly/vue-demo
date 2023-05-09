// vue
import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'

function Vue(options) {
    // options => 用户的选项
    this._init(options)
}


initMixin(Vue)
initLifeCycle(Vue)
initGlobalApi(Vue)
initStateMixin(Vue)

export default Vue


