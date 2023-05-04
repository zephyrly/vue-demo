let id = 0;

class Dep{
    constructor() {
        this.id = id++; // s属性的dep要收集的watcher
        this.subs = []; // 收集依赖
    }

    depend(){
        // 如果页面有两个相同属性，会重复添加dep
        Dep.target.addDep(this)
        // this.subs.push()
        // dep 和 watch 是多对多关系，
        // dep对应多个watcher 一个属性可以在多规格组件中使用
        // 一个watcher对应多个dep 一个组件由多个属性组成 
    }

    addSub(watcher){
        this.subs.push(watcher)
    }

    notify(){
        this.subs.forEach(watcher => watcher.update()); // 告诉watcher要更新了
    }
}
Dep.target = null

export default Dep