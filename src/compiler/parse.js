// compiler

//1.将template转化为ast树
//2.生成render(render方法执行后，返回虚拟dom)

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 开始标签<xxx>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 结束标签</xxx>
const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性

const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
const startTagClose = /^\s*(\/?)>/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// vue3采用不是正则
// 对模板进行编译处理
export function parseHTML(html) {    // 解析一个删除一个，直到全部解析完成

    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = []  // 用于存放元素
    let currentParent    // 指向栈中的最后一个
    let root
    function createASTElememt(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs) {
        let node = createASTElememt(tag, attrs)    // 创建一个ast节点
        if (!root) {  // 判断是否为空树
            root = node     // 如果为空，则当前的树为根节点
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node     // currentParent为栈中的最后一个
    }
    function chars(text) {      // 文本直接放到当前指向的节点中
        text = text.replace(/\s/g, '')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end() {
        let node = stack.pop()
        currentParent = stack[stack.length - 1]
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {    // 获取开始标签
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],   //标签名
                attrs: []                // 属性
            }
            advance(start[0].length)
            let attr, end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {   // 匹配属性
                advance(attr[0].length)
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5]})
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false  // 不是开始标签
    }
    while (html) {
        // 如果textEnd == 0 说明是开始标签或者结束标签
        // 如果textEnd > 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {
            const startTagMatch = parseStartTag()   // 开始标签的匹配结果
            if (startTagMatch) {  // 解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                chars(text)
                advance(text.length)    // 解析到的文本
            }
           
        }
    }
    return root
}
