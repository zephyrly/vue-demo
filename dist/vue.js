(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  // 重写数组中部分方法

  var oldArrayProto = Array.prototype; // 获取数组原型

  // newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  var methods = [
  // 找到所有能修改原数组的方法
  'push', 'pop', 'shift', 'unshift', 'reserve', 'sort', 'splice'];
  methods.forEach(function (method) {
    // 重写数组方法
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //push.call(arr)

      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 函数调用原来的方法, 函数的劫持，切片编程
      var inserted;
      var ob = this.__ob__; // 拿到data上的设置的__ob__属性(实例)
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // arr.splice(0,1,3)
          break;
        case 'splice':
          // arr.splice(0,1,{a:1},{a:1})
          inserted = args.slice(2);
      }
      console.log('inserted====>', inserted); // 新增insert
      if (inserted) {
        // 对新增的内容再次进行观察
        ob.observeArray(inserted);
      }
      console.log('method', method);
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // Object.defineProperties只能劫持已存在的属性,($set等方案修复)
      //data.__ob__ = this; // 将data的this实例挂在到data的__ob__属性上

      // 实现数组的新增数据的劫持功能（see: ./array.js）,并且标识已被观测
      // 防止对象循环属性 __ob__ 进入死循环,我们需要将 __ob__ 设置不可枚举
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        // 重写数组方法 7个变异方法 进行数组本身的修改
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 循环遍历，对象属性依次劫持
        // Object.defineProperty  重新定义属性， 性能差
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 观测数组
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  function defineReactive(target, key, value) {
    //闭包
    observe(value); // 对data下的所有对象进行劫持
    Object.defineProperty(target, key, {
      get: function get() {
        console.log('用户取值了', key);
        return value;
      },
      set: function set(newVal) {
        console.log('用户设置值了');
        if (newVal === value) return;
        observe(newVal);
        value = newVal;
      }
    });
  }
  function observe(data) {
    //对这个对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    }
    // 如果一个对象被劫持过了，那就不需要在被进行劫持()

    return new Observe(data);
  }

  // state.js
  function initState(vm) {
    var opts = vm.$options; // 获取1options
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data; // data是函数或者对象
    typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // 数据劫持
    observe(data);
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  // compiler

  //1.将template转化为ast树
  //2.生成render(render方法执行后，返回虚拟dom)

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 开始标签<xxx>
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 结束标签</xxx>
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
  var startTagClose = /^\s*(\/?)>/;

  // vue3采用不是正则
  // 对模板进行编译处理
  function parseHTML(html) {
    // 解析一个删除一个，直到全部解析完成

    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; // 用于存放元素
    var currentParent; // 指向栈中的最后一个
    var root;
    function createASTElememt(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      var node = createASTElememt(tag, attrs); // 创建一个ast节点
      if (!root) {
        // 判断是否为空树
        root = node; // 如果为空，则当前的树为根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node; // currentParent为栈中的最后一个
    }

    function chars(text) {
      // 文本直接放到当前指向的节点中
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end() {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      // 获取开始标签
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: [] // 属性
        };

        advance(start[0].length);
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 匹配属性
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; // 不是开始标签
    }

    while (html) {
      // 如果textEnd == 0 说明是开始标签或者结束标签
      // 如果textEnd > 0 说明就是文本的结束位置
      var textEnd = html.indexOf('<');
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果
        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容
        if (text) {
          chars(text);
          advance(text.length); // 解析到的文本
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ''; //{namee,,value}
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // color:red;bacckground:red => {color:red}
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value)); // a:b,c:d,
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}"); // a:b,c:d
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //加了/g需要每次exec重置一下,每次匹配他会向后靠一位，导致匹配不到

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      //文本
      console.log(node);
      var text = node.text;
      if (!defaultTagRE.exec(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配位置 {{name}} swfrwqe  {{abc}}
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          console.log(index, '39');
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', "\n    ").concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }
  function compileToFunction(template) {
    // 将template转换成ast树
    var ast = parseHTML(template);

    //生成render方法(render方法执行后返回虚拟DOM)
    console.log(ast);
    ast = codegen(ast);
    console.log(ast);
    // render(){
    // }
  }

  //  initMinix

  // 给Vue增加init方法
  function initMinix(Vue) {
    // 给vue增加init方法
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // vue $options获取用户的配置

      // 我们使用 vue时 $nextTick $data $attr.....
      var vm = this;
      vm.$options = options; //将给用户的1选项挂载到实例上

      //初始化状态
      initState(vm);
      if (options.el) {
        vm.$mount(options.el); // 实现数据挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        // 先查找是否存在render函数
        var template; // 没有render查找是否存在template,没有template采用外部template
        if (!ops.template && el) {
          // 无模板，但存在el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 如果有el, 采用模板内容
          }
        }

        // 编译template模板
        if (template) {
          var render = compileToFunction(template);
          ops.render = render; // jsx最终会编译成h('xxx')
        }

        ops.render;

        // script 标签引用vue.config.js 这个编译过程在浏览器运行
        // runtime是不包含模板编译，整个编译打包时通过loader进行转义vue文件，runtime时不能使用template
      }
    };
  }

  // vue
  function Vue(options) {
    // options => 用户的选项
    this._init(options);
  }
  initMinix(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
