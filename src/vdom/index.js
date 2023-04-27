// vdom index.js
export function createElementVNode(vm, tag, data = {}, ...children) {
    if(data === null){
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode(vm, tag, data.key, data, children)
}

// _v()
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}


// 与ast的区别，ast做的语法层面的转化,描述的是语法本身（css,js,html）
// vnode 描述的dom元素，可以增加一些自定义属性(js)
function vnode(vm, tag, key, data, children,text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        // .......
    }
}
