// rollup默认可以导出一个对象，作为打包的配置文件

import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
    input: './src/index.js',  //入口
    output: {
        file: './dist/vue.js',  //出口
        name: 'Vue',
        format: 'umd',   // esm es6 commonjs iife自执行函数 umd全局挂在vue的变量
        sourcemap: true,  // 希望可以调试源代码
    },
    // 设置插件
    plugins:[
        babel({
           exclude:'node_modules/**'   // 排除不必要打包的文件
        }),
        resolve()
    ]
}