import { isSameVnode } from '.'

export function createElm(vnode) {
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        //标签
        vnode.el = document.createElement(tag) // 将真实节点与虚拟节点进行对应，后续方便修改属性
        patchProps(vnode.el, {}, data)
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(JSON.stringify(text))
    }
    return vnode.el
}

export function patchProps(el, oldProps = {}, props = {}) {
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}

    for (let key in oldStyles) {
        // 老节点样式有，新的没有，删除
        if (!newStyles[key]) {
            el.style[key] = ''
        }
    }

    for (let key in oldProps) {
        // 老节点属性有
        if (!props[key]) {
            // 新的属性没有，删除
            el.removeAttribute(key)
        }
    }

    for (let key in props) {
        // 新的覆盖老的
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

export function patch(oldVNode, vnode) {
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
        patchVnode(oldVNode, vnode)
    }
}

// diff算法
function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
        // tag === tag  key === key
        // 用老节点的父亲 进行替换

        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }

    // 文本的情况 文本期望比较文本内容
    let el = (vnode.el = oldVNode.el) //复用老的文本节点
    if (!oldVNode.tag) {
        // 是文本
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 用新的文本覆盖老的
        }
    }

    // 标签 是标签需要比对标签的属性
    patchProps(el, oldVNode.data, vnode.data)

    // 比较子节点 一方有，一方无

    let oldChildren = oldVNode.children || {}
    let newChildren = vnode.children || {}
    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整diff
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) {
        // old没有，新的有
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
        // old有，新的没有
        el.innerHTML = '' // 循环删除
    }

    return el
}

function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

// diff算法核心 采用双指针的方式 对比新老vnode的儿子节点
function updateChildren(parent, oldCh, newCh) {
    let oldStartIndex = 0 //老儿子的起始下标
    let oldStartVnode = oldCh[0] //老儿子的第一个节点
    let oldEndIndex = oldCh.length - 1 //老儿子的结束下标
    let oldEndVnode = oldCh[oldEndIndex] //老儿子的起结束节点

    let newStartIndex = 0 //同上  新儿子的
    let newStartVnode = newCh[0]
    let newEndIndex = newCh.length - 1
    let newEndVnode = newCh[newEndIndex]

    // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
    function makeIndexByKey(children) {
        let map = {}
        children.forEach((item, index) => {
            map[item.key] = index
        })
        return map
    }
    // 生成的映射表
    let map = makeIndexByKey(oldCh)

    // 只有当新老儿子的双指标的起始位置不大于结束位置的时候  才能循环 一方停止了就需要结束循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 因为暴力对比过程把移动的vnode置为 undefined 如果不存在vnode节点 直接跳过
        if (!oldStartVnode) {
            oldStartVnode = oldCh[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldCh[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // 头和头对比 依次向后追加
            patch(oldStartVnode, newStartVnode) //递归比较儿子以及他们的子节点
            oldStartVnode = oldCh[++oldStartIndex]
            newStartVnode = newCh[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            //尾和尾对比 依次向前追加
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldCh[--oldEndIndex]
            newEndVnode = newCh[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 老的头和新的尾相同 把老的头部移动到尾部
            patch(oldStartVnode, newEndVnode)
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling) //insertBefore可以移动或者插入真实dom
            oldStartVnode = oldCh[++oldStartIndex]
            newEndVnode = newCh[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 老的尾和新的头相同 把老的尾部移动到头部
            patch(oldEndVnode, newStartVnode)
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldCh[--oldEndIndex]
            newStartVnode = newCh[++newStartIndex]
        } else {
            // 上述四种情况都不满足 那么需要暴力对比
            // 根据老的子节点的key和index的映射表 从新的开始子节点进行查找 如果可以找到就进行移动操作 如果找不到则直接进行插入
            let moveIndex = map[newStartVnode.key]
            if (!moveIndex) {
                // 老的节点找不到  直接插入
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else {
                let moveVnode = oldCh[moveIndex] //找得到就拿到老的节点
                oldCh[moveIndex] = undefined //这个是占位操作 避免数组塌陷  防止老节点移动走了之后破坏了初始的映射表位置
                parent.insertBefore(moveVnode.el, oldStartVnode.el) //把找到的节点移动到最前面
                patch(moveVnode, newStartVnode)
            }
            newStartVnode = newCh[++newStartIndex] // 将新节点往后移动一位
        }
    }
    // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
            const ele = newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el
            parent.insertBefore(createElm(newCh[i]), ele)
        }
    }
    // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldCh[i]
            if (child != undefined) {
                parent.removeChild(child.el)
            }
        }
    }
}
