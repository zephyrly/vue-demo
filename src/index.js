// vue
import { initMinix } from "./init"
import { initLifeCycle } from "./lifecycle"

function Vue(options){ // options => 用户的选项
    this._init(options)
}

initMinix(Vue)
initLifeCycle(Vue)

export default Vue