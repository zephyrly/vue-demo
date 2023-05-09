import { mergeOptions } from "./utils"


export function initGlobalApi(Vue) {
    // 静态方法
    // -----策略模式
    Vue.options = {}
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this
    }
}