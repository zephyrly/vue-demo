// vue
import { compileToFunction } from './compiler'
import { initGlobalApi } from './global-api'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'
import { createElm, patch } from './vdom/patch'

function Vue(options) {
    // options => 用户的选项
    this._init(options)
}

initMixin(Vue) // 扩展init方法
initLifeCycle(Vue) // m_update vm._render
initGlobalApi(Vue) // 全局api的实现
initStateMixin(Vue) // 实现nextTick ,$watch

// ----------------观察虚拟dom前后变化------------------------

let render1 = compileToFunction(`
<ul key="a" a="1" style="color:red">
<li key="a">a</li>
<li key="b">b</li>
<li key="c">c</li>
</ul>`)
let vm1 = new Vue({ data: { name: 'ok' } })
let prevVnode = render1.call(vm1)

let el = createElm(prevVnode)
document.body.appendChild(el)

let render2 = compileToFunction(
    `<ul key="a" a="1" style="color:red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">c</li>
    </ul>`
)
let vm2 = new Vue({ data: { name: 'okzfans' } })
let nextVnode = render2.call(vm2)

// 直接替换节点，老节点，会导致性能开销打
// let newEl = createElm(nextVnode)
// el.parentNode.replaceChild(newEl,el)

setTimeout(() => {
    patch(prevVnode, nextVnode)
}, 1000)

console.log('prevVnode', prevVnode)

export default Vue
