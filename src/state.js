// state.js
import { observe } from './observe/index'


export function initState(vm){
    const opts = vm.$options; // 获取options
    if(opts.data){
        initData(vm)
    }
}

function proxy(vm, target, key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newVal){
            vm[target][key] = newVal
        }
    })
}

export function initData(vm){
    let data = vm.$options.data; // data是函数或者对象
    typeof data === 'function'? data.call(vm): data

    vm._data = data
    // 数据劫持
    observe(data)

    for(let key in data){
        proxy(vm, '_data', key)
    }
}