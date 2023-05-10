// state.js
import { observe } from './observe/index'
import Dep from './observe/dep'
import Watcher, { nextTick } from './observe/watcher'

//  处理new Vue中的值
export function initState(vm) {
    const opts = vm.$options // 获取options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newVal) {
            vm[target][key] = newVal
        },
    })
}

export function initData(vm) {
    let data = vm.$options.data // data是函数或者对象
    typeof data === 'function' ? data.call(vm) : data

    vm._data = data
    // 数据劫持
    observe(data)

    for (let key in data) {
        proxy(vm, '_data', key)
    }
}

export function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = (vm._computedWatchers = {}) // 将计算属性watcheer保存到vm上
    for (let key in computed) {
        let userDef = computed[key]

        // 监听计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get

        // 如果直接new watcher 默认执行fn
        watchers[key] = new Watcher(vm, fn, { lazy: true })

        defineComputed(vm, key, userDef)
    }
}

export function initWatch(vm) {
    const watch = vm.$options.watch

    for (let key in watch) {
        const handler = watch[key] // 支付串 数组 函数

        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                creatWatcher(vm, key, handler)
            }
        } else {
            creatWatcher(vm, key, handler)
        }
    }
}

function creatWatcher(vm, key, handler) {
    if (typeof handler === 'string') {
        handler = vm[handler]
    }

    return vm.$watch(key, handler)
}

function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => {})

    //  通过实例拿到属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter,
    })
}

// 计算属性不会收集依赖， 只会让自己的依赖收集依赖
function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key] // 获取到对应属性watcher
        if (watcher.dirty) {
            watcher.evaluate() // 执行后会在计算属性中，渲染watcher后创建一个计算属性的watcher
        }
        if (Dep.target) {
            // 如果计算属性出栈后 还要渲染watcher 需要将计算属性的watcher 去收集上一层的渲染watcher
            watcher.depend()
        }
        return watcher.value // 返回watcher的值
    }
}

export function initStateMixin(Vue) {
    // 绥中转换的都是$watch
    Vue.prototype.$nextTick = nextTick
    Vue.prototype.$watch = function (exportFn, cb, options = {}) {
        new Watcher(this, exportFn, { user: true }, cb)
    }
}
