// observe.js
import {newArrayProto} from './array'
import Dep from './dep'
class Observe{
    constructor(data){

        // 给每个对象都进行收集
        this.dep = new Dep();

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
    let childOb = observe(value) // 对data下的所有对象进行劫持 ，， childOb依赖收集
    let dep = new Dep(); // 每个属性都有dep
    Object.defineProperty(target,key,{
        get(){
            if(Dep.target){
                dep.depend()  // 让属性收集器记住当前watcher
                if(childOb){
                    childOb.dep.depend();  //让数组和对象也能实现依赖收集
                    if(Array.isArray(value)){
                        dependArray(value)
                    }
                }
            }
            console.log('用户取值了',key)
            return value
        },
        set(newVal){
            console.log('用户设置值了')
            if(newVal === value) return
            observe(newVal)
            value = newVal
            dep.notify() // 通知watcher进行更新
        }
    })
}

// 递归收集数组下的数组依赖，进行依赖收集
function dependArray(value){
    for(let i  =0; i< value.lenght;i++){
        let current = value[i]
        current.__ob__&&current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current)
        }
    }
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