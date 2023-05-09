import { parseHTML } from "./parse"

function genProps(attrs){
    let str = '' //{namee,,value}
    for(let i = 0;i<attrs.length;i++) {
        let attr = attrs[i]

        if(attr.name === 'style'){
            // color:red;bacckground:red => {color:red}
            let obj = {}

            attr.value.split(';').forEach(item=>{
                let [key, value] = item.split(':');
                obj[key] = value;
            })
            attr.value = obj
        }

        str+=`${attr.name}:${JSON.stringify(attr.value)},`  // a:b,c:d,
    }
    return `{${str.slice(0,-1)}}` // a:b,c:d
}

var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;  //加了/g需要每次exec重置一下,每次匹配他会向后靠一位，导致匹配不到

function gen(node){
    if(node.type === 1) {
        return codegen(node);
    } else {
        //文本
        let text = node.text
        if(!defaultTagRE.exec(text)){
            return `_v(${JSON.stringify(text)})`
        } else {
            let tokens = [];
            let match
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)){

                let index = match.index; // 匹配位置 {{name}} swfrwqe  {{abc}}
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)))
                }

                // console.log(index,'39',tokens)
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }

            return `_v(${tokens.join('+')})`
        } 
    }
}

function genChildren(children){
    return children.map(child => gen(child)).join(',')
}

function codegen(ast){
    let children = genChildren(ast.children)
    let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs): 'null' }
    ${
        ast.children.length?`,${children}`:''
    })`
    return code
}

export function compileToFunction(template) {

    // 将template转换成ast树
    let ast = parseHTML(template)

    //生成render方法(render方法执行后返回虚拟DOM)

    let code = codegen(ast);
    //with(this){
    //     console.log(this.a)
    // }
    code = `with(this){return ${code}}`
    let render = new Function(code)  //根据代码生成render函数

    return render
}
