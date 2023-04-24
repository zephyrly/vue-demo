// observe.js
import {newArrayProto} from './array'
class Observe{
    constructor(data){
        // Object.defineProperties只能劫持已存在的属性,($set等方案修复)
        //data.__ob__ = this; // 将data的this实例挂在到data的__ob__属性上

        // 实现数组的新增数据的劫持功能（see: ./array.js）,并且标识已被观测
        // 防止对象循环属性 __ob__ 进入死循环,我们需要将 __ob__ 设置不可枚举
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        
        if(Array.isArray(data)){
            // 重写数组方法 7个变异方法 进行数组本身的修改
            data.__proto__ = newArrayProto
            this.observeArray(data)
        }else {
            this.walk(data)
        }
    }
    walk(data){ // 循环遍历，对象属性依次劫持
        // Object.defineProperty  重新定义属性， 性能差
        Object.keys(data).forEach(key => defineReactive(data,key,data[key]))
    }

    observeArray(data) { // 观测数组
        data.forEach(item => observe(item))
    }
}

export function defineReactive(target,key,value){ //闭包
    observe(value) // 对data下的所有对象进行劫持
    Object.defineProperty(target,key,{
        get(){
            console.log('用户取值了',key)
            return value
        },
        set(newVal){``
            console.log('用户设置值了')
            if(newVal === value) return
            observe(newVal)
            value = newVal
        }
    })
}

export function observe(data){

    //对这个对象进行劫持
    if( typeof data !== 'object' || data === null){
        return // 只对对象进行劫持
    }
    if(data.__ob__ instanceof Observe){
        return data.__ob__
    }
    // 如果一个对象被劫持过了，那就不需要在被进行劫持()

    return new Observe(data);
}