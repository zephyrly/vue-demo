// 重写数组中部分方法

let oldArrayProto = Array.prototype; // 获取数组原型

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods = [ // 找到所有能修改原数组的方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reserve',
    'sort',
    'splice'
]

methods.forEach(method => {
    // 重写数组方法
    newArrayProto[method] = function(...args){
        //push.call(arr)

        const result = oldArrayProto[method].call(this,...args) // 函数调用原来的方法, 函数的劫持，切片编程(函数切面)
        let inserted;
        let ob = this.__ob__ // 拿到data上的设置的__ob__属性(实例)
        switch(method) {
            case 'push':
            case 'unshift':
                inserted = args; // arr.splice(0,1,3)
                break
            case 'splice': // arr.splice(0,1,{a:1},{a:1})
                inserted = args.slice(2)
            default: 
                break
        }
        console.log('inserted====>',inserted,this) // 新增insert
        if(inserted){
            // 对新增的内容再次进行观察
            ob.observeArray(inserted)
        }

        console.log('method',method)
        return result
    }
})