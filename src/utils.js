// src/util/index.js
// 定义生命周期
export const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
]

// 合并策略
const strats = {}

//生命周期合并策略
function mergeHook(parentVal, childVal) {
    // 如果有儿子
    if (childVal) {
        if (parentVal) {
            // 合并成一个数组
            return parentVal.concat(childVal)
        } else {
            // 包装成一个数组
            return [childVal]
        }
    } else {
        return parentVal
    }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach((hook) => {
    strats[hook] = mergeHook
})

// mixin核心方法
export function mergeOptions(parent, child) {
    const options = {}
    // 遍历父亲
    for (let k in parent) {
        mergeFiled(k)
    }
    // 父亲没有 儿子有
    for (let k in child) {
        if (!parent.hasOwnProperty(k)) {
            mergeFiled(k)
        }
    }

    //真正合并字段方法
    function mergeFiled(k) {
        if (strats[k]) {
            options[k] = strats[k](parent[k], child[k])
        } else {
            // 默认策略
            options[k] = child[k] ? child[k] : parent[k]
        }
    }
    return options
}
