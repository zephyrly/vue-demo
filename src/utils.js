const starts = {}

const LIFTCYCLE = [
    'beforeCreate',
    'created',
    'mounted'
]
LIFTCYCLE.forEach(hook => {
    starts[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})
export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeFiled(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeFiled(key)
        }
    }

    function mergeFiled(key) {
        // 策略模式 减少if / else
        if (starts[key]) {
            options[key] = starts[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]

        }
    }
    return options
}