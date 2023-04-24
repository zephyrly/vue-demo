// vue
import { initMinix } from "./init"
function Vue(options){ // options => 用户的选项
    this._init(options)
}

initMinix(Vue)

export default Vue