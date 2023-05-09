// watch.js
import Dep, { popTarget, pushTarget } from "./dep";

// 1) 当创建渲染watcher的时候，将当前渲染watcher放到Dep.target上
// 2) 调用 _render() 会取值 走到get上

// 观察者模式实现自动更新
let id = 0;

// 不同组件有不同watcher 
class Watcher{
    constructor(vm,exportFn,options, cb){
        this.id = id++;
        this.vm = vm;
        this.renderWatcher = options // 是否为渲染WATCHER
        
        if(typeof exportFn === 'string'){
            this.getter = function(){
                return vm[exportFn]
            }
        } else {
            this.getter = exportFn;  // getter意味调用这个函数可以发生取值
        }
        this.deps = []; // 实现计算属性和部分清理工作
        this.depsId = new Set(); // 后续实现计算属性，和部分清理工作

        this.lazy = options.lazy;
        this.dirty = this.lazy; // 缓存值

        this.user = options.user;
        this.cb = cb;
        
        this.value = this.lazy ? undefined : this.get();
    }

    addDep(dep){ // 一个组件 对应多个属性，重复不需要记录
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)  // watcher 已经记住了dep,并且进行去重，此时dep记住了watcher
        }
    }

    evaluate(){
        this.value = this.get(); // 获取过户函数的返回值,标识为脏
        this.dirty = false;
    }

    get() {
        pushTarget(this)
        // Dep.target = this; // 静态属性只有一份
        let value = this.getter.call(this.vm); // 会去vm上取值 vm._update(vm._render) 取值naame,age
        // Dep.target = null; // 渲染完毕后就清空
        popTarget()
        return value
    }

    depend(){
        let i = this.deps.length
        while(i--){
            // dep.depends
            this.deps[i].depend(); // 让计算属性也收集渲染watcher
        }
    }

    update(){
        if(this.lazy){
            // 如果是计算属性 ,则标记值为脏数据, 
            this.dirty = true
        } else {
            queueWatcher(this);
            // this.get() // 重新进行渲染
        }
    }

    run() {
        let oldValue = this.value;
        let newValue = this.get(); // 渲染的时候用的是最新的vm进行渲染
        if(this.user){
            this.cb.call(this.vm,newValue, oldValue)
        }
    }

}

let queue = []
let has = {}
let pendding = false // 防抖

function flushSchedulerQueue(){
    let flushQueue = queue.slice(0);
    queue=[];
    has ={};
    pendding = false;
    flushQueue.forEach(q => q.run()); // 刷新过程中会有新的watcher,重新进入queue
}
function queueWatcher(watcher){
    let id = watcher.id;
    if(!has[id]){
        queue.push(watcher);
        has[id] = true;
        // 不管update执行多少次，但最终只执行一轮刷新操作

        if(!pendding){
            nextTick(flushSchedulerQueue,0)  // 在主栈js执行完成后，定时器执行数据更新
            pendding = true;
        }
    }
    
}

let callbacks = [];
let waiting = false;

function flushCallbacks(){
    let cbs = callbacks.slice(0)
    waiting =true
    callbacks = []
    cbs.forEach(cb =>cb()) // 按顺序执行  
}
// vue中使用优雅降级方式执行nextTick,
// 内部首先使用Promise （ie不兼容），MutationObserver(h5浏览器的api), ie中的setImmediate，setImmediate
let timerFunc;
if(Promise){
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if(MutationObserver){
    let observer = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1);
    observer.observe(textNode,{
        characterData:true
    })
    timerFunc = () => {
        textNode.textContent = 2
    }
} else if(setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb){ // 内部，外部执行顺序
    callbacks.push(cb) // 维护nextTick中的callback
    if(!waiting) {
        timerFunc()
        waiting = true
    }
}

// 给每个属性加上一个dep,目的收集watcher

// 一个组件中，有很多属性， n个属性对应一个视图， n个dep对应一个watcher
// 1个属性对应多个组件 1个dep对应多个watcher
// 多对多关系

export default Watcher