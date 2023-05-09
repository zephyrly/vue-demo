// lifecycle.js
import { createElementVNode, createTextVNode } from './vdom/index'
import Watcher from './observe/watcher'

function createElm(vnode) {
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        //标签
        vnode.el = document.createElement(tag) // 将真实节点与虚拟节点进行对应，后续方便修改属性
        patchProps(vnode.el, data)
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(JSON.stringify(text))
    }
    return vnode.el
}

function patchProps(el, props) {
    for (let key in props) {
        if (key === 'style') {
            // style(color:'red')
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

function patch(oldVNode, vnode) {
    // 初渲染流程
    const isRealElement = oldVNode.nodeType
    if (isRealElement) {
        const elm = oldVNode // 获取真实元素
        const parentElm = elm.parentNode // 拿到父元素
        let newElm = createElm(vnode) // 生成真实dom
        parentElm.insertBefore(newElm, elm.nextSibiling)
        parentElm.removeChild(elm) // 删除老节点
        console.log(newElm)
        return newElm
    } else {
        // diff 算法
    }
}

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
    vm.$el = el
    // 1.调用render方法产生虚拟节点,虚拟dom

    const updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, true)

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