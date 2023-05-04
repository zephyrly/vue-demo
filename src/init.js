//  initMinix
// init.js
import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle'

// 给Vue增加init方法
export function initMinix(Vue) {
    // 给vue增加init方法
Vue.prototype._init = function (options) {
        // 用于初始化操作
        // vue $options获取用户的配置

        // 我们使用 vue时 $nextTick $data $attr.....
        const vm = this
        vm.$options = options //将给用户的1选项挂载到实例上

        //初始化状态
        initState(vm)
        if (options.el) {
            vm.$mount(options.el) // 实现数据挂载
        }
    }
Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        let ops = vm.$options
        if (!ops.render) {   
            // 先查找是否存在render函数
            let template // 没有render查找是否存在template,没有template采用外部template
            if (!ops.template && el) {
                // 无模板，但存在el
                template = el.outerHTML
            } else {
                if (el) {
                    template = ops.template // 如果有el, 采用模板内容
                }
            }

            // 编译template模板
            if (template && el) {
                const render = compileToFunction(template)
                ops.render = render // jsx最终会编译成h('xxx')
            }
            ops.render
            console.log('ast树形结构',ops.render)

            // script 标签引用vue.config.js 这个编译过程在浏览器运行
            // runtime是不包含模板编译，整个编译打包时通过loader进行转义vue文件，runtime时不能使用template
        }
        mountComponent(vm,el); // 组件挂载
    }
}
