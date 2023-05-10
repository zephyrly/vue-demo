// lifecycle.js
import { createElementVNode, createTextVNode } from './vdom/index'
import Watcher from './observe/watcher'
import { patch } from './vdom/patch'

export function initLifeCycle(Vue) {
    // 虚拟dom转换真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el

        // patch 初始化，更新功能

        vm.$el = patch(el, vnode)
    }

    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }

    // _v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if (value !== 'object') {
            return value
        }
        return JSON.stringify(value)
    }

    Vue.prototype._render = function () {
        const vm = this
        // console.log('_render')
        // 让vm中的this指向vm
        return this.$options.render.call(vm)
        console.log('_render') // 通过ast语法转义后生成的render方法
    }
}

export function mountComponent(vm, el) {
    // 1.调用render方法产生虚拟节点,虚拟dom
    vm.$el = el;
    // 引入watcher的概念 这里注册一个渲染watcher 执行vm._update(vm._render())方法渲染视图
    callHook(vm, "beforeMount"); //初始渲染之前
    let updateComponent = () => {
      vm._update(vm._render());
    };
    new Watcher(
      vm,
      updateComponent,
      () => {
        callHook(vm, "beforeUpdate"); //更新之前
      },
      true
    );
    callHook(vm, "mounted"); //渲染完成之后
    // 2.根据虚拟dom产生真实dom
    // 3.插入el元素中
  }

// vue核心流程：
// 1.创造了响应式数据
// 2.模板转化成ast语法树
// 3.将ast语法树转换成render函数
// 4.后续每次进行数据跟心只需要执行render函数就行，无需执行ast语法树转化过程

// render函数会产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点来创造真实dom

export function callHook(vm, hook) {
    console.log(hook)
    const handlers = vm.$options[hook]
    if(handlers){
        handlers.forEach(handler=>handler.call(vm))
    }
}