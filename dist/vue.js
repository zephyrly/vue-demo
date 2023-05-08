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

      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 函数调用原来的方法, 函数的劫持，切片编程(函数切面)
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
      console.log('inserted====>', inserted, this); // 新增insert
      if (inserted) {
        // 对新增的内容再次进行观察
        ob.observeArray(inserted);
      }

      //
      console.log(ob);
      ob.dep.notify(); // 数组变化通知对应的notify
      console.log('method', method);
      return result;
    };
  });

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; // s属性的dep要收集的watcher
      this.subs = []; // 收集依赖
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 如果页面有两个相同属性，会重复添加dep
        Dep.target.addDep(this);
        // this.subs.push()
        // dep 和 watch 是多对多关系，
        // dep对应多个watcher 一个属性可以在多规格组件中使用
        // 一个watcher对应多个dep 一个组件由多个属性组成 
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        }); // 告诉watcher要更新了
      }
    }]);
    return Dep;
  }();
  Dep.target = null;

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // 给每个对象都进行收集
      this.dep = new Dep();

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
    var childOb = observe(value); // 对data下的所有对象进行劫持 ，， childOb依赖收集
    var dep = new Dep(); // 每个属性都有dep
    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 让属性收集器记住当前watcher
          if (childOb) {
            childOb.dep.depend(); //让数组和对象也能实现依赖收集
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        console.log('用户取值了', key);
        return value;
      },
      set: function set(newVal) {
        console.log('用户设置值了');
        if (newVal === value) return;
        observe(newVal);
        value = newVal;
        dep.notify(); // 通知watcher进行更新
      }
    });
  }

  // 递归收集数组下的数组依赖，进行依赖收集
  function dependArray(value) {
    for (var i = 0; i < value.lenght; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
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
    var opts = vm.$options; // 获取options
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
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
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
          console.log(index, '39', tokens);
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

    var code = codegen(ast);
    //with(this){
    //     console.log(this.a)
    // }
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); //根据代码生成render函数

    return render;
  }

  // vdom index.js
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (data === null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, data.key, data, children);
  }

  // _v()
  function createTextVNode(vm, text) {
    console.log('texttexttexttext', text);
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // 与ast的区别，ast做的语法层面的转化,描述的是语法本身（css,js,html）
  // vnode 描述的dom元素，可以增加一些自定义属性(js)
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
      // .......
    };
  }

  // 1) 当创建渲染watcher的时候，将当前渲染watcher放到Dep.target上
  // 2) 调用 _render() 会取值 走到get上

  // 观察者模式实现自动更新
  var id = 0;

  // 不同组件有不同watcher 
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; // 是否为渲染WATCHER
      this.getter = fn; // getter意味调用这个函数可以发生取值
      this.deps = []; // 实现计算属性和部分清理工作
      this.depsId = new Set(); // 后续实现计算属性，和部分清理工作
      this.get();
    }
    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件 对应多个属性，重复不需要记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher 已经记住了dep,并且进行去重，此时dep记住了watcher
        }
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this; // 静态属性只有一份
        this.getter(); // 会去vm上取值 vm.
        Dep.target = null; // 渲染完毕后就清空
      }
    }, {
      key: "update",
      value: function update() {
        queueWatcher(this);
        // this.get() // 重新进行渲染
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var has = {};
  var pendding = false; // 防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pendding = false;
    flushQueue.forEach(function (q) {
      return q.run();
    }); // 刷新过程中会有新的watcher,重新进入queue
  }

  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      // 不管update执行多少次，但最终只执行一轮刷新操作

      if (!pendding) {
        nextTick(flushSchedulerQueue); // 在主栈js执行完成后，定时器执行数据更新
        pendding = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = true;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); // 按顺序执行  
  }
  // vue中使用优雅降级方式执行nextTick,
  // 内部首先使用Promise （ie不兼容），MutationObserver(h5浏览器的api), ie中的setImmediate，setImmediate
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    // 内部，外部执行顺序
    callbacks.push(cb); // 维护nextTick中的callback
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }

  // lifecycle.js
  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      //标签
      vnode.el = document.createElement(tag); // 将真实节点与虚拟节点进行对应，后续方便修改属性
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(JSON.stringify(text));
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        // style(color:'red')
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    // 初渲染流程
    var isRealElement = oldVNode.nodeType;
    if (isRealElement) {
      var elm = oldVNode; // 获取真实元素
      var parentElm = elm.parentNode; // 拿到父元素
      var newElm = createElm(vnode); // 生成真实dom
      parentElm.insertBefore(newElm, elm.nextSibiling);
      parentElm.removeChild(elm); // 删除老节点
      console.log(newElm);
      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    // 虚拟dom转换真实dom
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;

      // patch 初始化，更新功能

      vm.$el = patch(el, vnode);
    };

    // _c('div',{},...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (value !== 'object') {
        return value;
      }
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      var vm = this;
      console.log('_render');
      // 让vm中的this指向vm
      return this.$options.render.call(vm);
    };
  }

  function mountComponent(vm, el) {
    vm.$el = el;
    // 1.调用render方法产生虚拟节点,虚拟dom

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, true);

    // 2.根据虚拟dom产生真实dom

    // 3.插入el元素中
  }

  // vue核心流程  1)创建响应式数据  2）模板转换ast语法树
  // 3)将ast语法树转换成render函数 4)后续每次数据更新可以只执行render函数(无需再次执行ast转换)
  // render函数会去产生虚拟节点
  // 根据生成的虚拟节点创建真实DOM

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
        if (template && el) {
          var render = compileToFunction(template);
          ops.render = render; // jsx最终会编译成h('xxx')
        }

        ops.render;
        console.log('ast树形结构', ops.render);

        // script 标签引用vue.config.js 这个编译过程在浏览器运行
        // runtime是不包含模板编译，整个编译打包时通过loader进行转义vue文件，runtime时不能使用template
      }

      mountComponent(vm, el); // 组件挂载
    };
  }

  // vue
  function Vue(options) {
    // options => 用户的选项
    this._init(options);
  }
  Vue.prototype.$nextTick = nextTick;
  initMinix(Vue);
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
