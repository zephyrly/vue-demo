import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';

export default [
    {
      input: pkg.main,
      output: [
        {
          name: 'W',
          file: pkg.browser,
          format: 'umd'
        }
      ],
      plugins: [
          resolve(), // so Rollup can find `ms`
          commonjs(), // so Rollup can convert `ms` to an ES module
          //json(), // so Rollup can read file `.json`
          terser() // so minify
      ]
      }
  ];