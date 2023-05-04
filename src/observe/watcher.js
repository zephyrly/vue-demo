// watch.js
import Dep from "./dep";

// 1) 当创建渲染watcher的时候，将当前渲染watcher放到Dep.target上
// 2) 调用 _render() 会取值 走到get上

// 观察者模式实现自动更新
let id = 0;

// 不同组件有不同watcher 
class Watcher{
    constructor(vm,fn,options){
        this.id = id++;
        this.renderWatcher = options // 是否为渲染WATCHER
        this.getter = fn;  // getter意味调用这个函数可以发生取值
        this.deps = []; // 实现计算属性和部分清理工作
        this.depsId = new Set(); // 后续实现计算属性，和部分清理工作
        this.get();
    }

    addDep(dep){ // 一个组件 对应多个属性，重复不需要记录
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this)  // watcher 已经记住了dep,并且进行去重，此时dep记住了watcher
        }
    }

    get() {
        Dep.target = this; // 静态属性只有一份
        this.getter(); // 会去vm上取值 vm.
        Dep.target = null; // 渲染完毕后就清空
    }

    update(){
        console.log('update')
        this.get() // 重新进行渲染
    }

}

// 给每个属性加上一个dep,目的收集watcher

// 一个组件中，有很多属性， n个属性对应一个视图， n个dep对应一个watcher
// 1个属性对应多个组件 1个dep对应多个watcher
// 多对多关系

export default Watcher