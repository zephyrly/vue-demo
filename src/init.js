import { initState } from "./state"
import { compileToFunction } from './compiler/index'
import { callHook, mountComponent } from "./lifecycle"
import { mergeOptions } from "./utils"

// 给vue增加init方法
export function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
        // vue中,vm.$options 就是获取用户的配置
        const vm = this
        vm.$options = mergeOptions(this.constructor.options,options)  // 将用户的选项挂载到实例上
        // 初始化状态
        callHook(vm,'beforeCreate')
        initState(vm)
        callHook(vm,'created')

        if (options.el) {
            vm.$mount(options.el)   // 实现数据挂载
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)

        let ops = vm.$options
        if (!ops.render) {                 // 先查找有没有render函数
            let template                 // 没有render，在看有没有template，没有template，采用外部的template
            if (!ops.template && el) {     // 没有模板，但是有el
                template = el.outerHTML
            } else {
                if (el) {                 // 如果有el，则采用模板内容
                    template = ops.template
                }
            }
            // 写了temlate，就直接使用
            if (template) {
                // 这里我们需要对模板进行编译
                const render = compileToFunction(template)
                ops.render = render  // jsx最终编译成h('xxx',{xxx})
            }
        }
        mountComponent(vm,el)  // 组件挂载
        // console.log(ops.render)   // 最终我们获取render方法

        // script 变标签引用vue.global.js   这个编译过程是浏览器运行的
        // runtime 不包含模板编译，整个编译过程通过loader转义vue文件，
    }
}

