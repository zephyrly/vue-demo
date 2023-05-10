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

          // console.log(index,'39',tokens)
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

  // src/util/index.js
  // 定义生命周期
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];

  // 合并策略
  var strats = {};

  //生命周期合并策略
  function mergeHook(parentVal, childVal) {
    // 如果有儿子
    if (childVal) {
      if (parentVal) {
        // 合并成一个数组
        return parentVal.concat(childVal);
      } else {
        // 包装成一个数组
        return [childVal];
      }
    } else {
      return parentVal;
    }
  }

  // 为生命周期添加合并策略
  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  // mixin核心方法
  function mergeOptions(parent, child) {
    var options = {};
    // 遍历父亲
    for (var k in parent) {
      mergeFiled(k);
    }
    // 父亲没有 儿子有
    for (var _k in child) {
      if (!parent.hasOwnProperty(_k)) {
        mergeFiled(_k);
      }
    }

    //真正合并字段方法
    function mergeFiled(k) {
      if (strats[k]) {
        options[k] = strats[k](parent[k], child[k]);
      } else {
        // 默认策略
        options[k] = child[k] ? child[k] : parent[k];
      }
    }
    return options;
  }

  function initGlobalApi(Vue) {
    // 静态方法
    // -----策略模式
    Vue.options = {};
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
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
      // console.log('inserted====>',inserted,this) // 新增insert
      if (inserted) {
        // 对新增的内容再次进行观察
        ob.observeArray(inserted);
      }

      //
      // console.log(ob)
      ob.dep.notify(); // 数组变化通知对应的notify
      // console.log('method',method)
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
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

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

  // 1) 当创建渲染watcher的时候，将当前渲染watcher放到Dep.target上
  // 2) 调用 _render() 会取值 走到get上

  // 观察者模式实现自动更新
  var id = 0;

  // 不同组件有不同watcher
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exportFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.vm = vm;
      this.renderWatcher = options; // 是否为渲染WATCHER

      if (typeof exportFn === 'string') {
        this.getter = function () {
          //用户watcher传过来的可能是一个字符串   类似a.a.a.a.b
          var path = exprOrFn.split('.');
          var obj = vm;
          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]]; //vm.a.a.a.a.b
          }

          return obj;
        };
      } else {
        this.getter = exportFn; // getter意味调用这个函数可以发生取值
      }

      this.deps = []; // 实现计算属性和部分清理工作
      this.depsId = new Set(); // 后续实现计算属性，和部分清理工作

      this.lazy = options.lazy;
      this.dirty = this.lazy; // 缓存值

      this.user = options.user;
      this.cb = cb;
      this.value = this.lazy ? undefined : this.get();
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
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); // 获取过户函数的返回值,标识为脏
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this);
        // Dep.target = this; // 静态属性只有一份
        var value = this.getter.call(this.vm); // 会去vm上取值 vm._update(vm._render) 取值naame,age
        // Dep.target = null; // 渲染完毕后就清空
        popTarget();
        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          // dep.depends
          this.deps[i].depend(); // 让计算属性也收集渲染watcher
        }
      }
    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 如果是计算属性 ,则标记值为脏数据,
          this.dirty = true;
        } else {
          queueWatcher(this);
          // this.get() // 重新进行渲染
        }
      }

      // run() {
      //     let oldValue = this.value;
      //     let newValue = this.get(); // 渲染的时候用的是最新的vm进行渲染
      //     if(this.user){
      //         this.cb.call(this.vm,newValue, oldValue)
      //     }
      // }
    }, {
      key: "run",
      value: function run() {
        var newVal = this.get(); //新值
        var oldVal = this.value; //老值
        this.value = newVal; //跟着之后  老值就成为了现在的值
        if (this.user) {
          if (newVal !== oldVal || isObject(newVal)) {
            this.cb.call(this.vm, newVal, oldVal);
          }
        }
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

  // state.js

  //  处理new Vue中的值
  function initState(vm) {
    var opts = vm.$options; // 获取options
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      initComputed(vm);
    }
    if (opts.watch) {
      initWatch(vm);
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
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {}; // 将计算属性watcheer保存到vm上
    for (var key in computed) {
      var userDef = computed[key];

      // 监听计算属性中get的变化
      var fn = typeof userDef === 'function' ? userDef : userDef.get;

      // 如果直接new watcher 默认执行fn
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; // 支付串 数组 函数

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          creatWatcher(vm, key, handler);
        }
      } else {
        creatWatcher(vm, key, handler);
      }
    }
  }
  function creatWatcher(vm, key, handler) {
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
  }
  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    var setter = userDef.set || function () {};

    //  通过实例拿到属性
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  // 计算属性不会收集依赖， 只会让自己的依赖收集依赖
  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key]; // 获取到对应属性watcher
      if (watcher.dirty) {
        watcher.evaluate(); // 执行后会在计算属性中，渲染watcher后创建一个计算属性的watcher
      }

      if (Dep.target) {
        // 如果计算属性出栈后 还要渲染watcher 需要将计算属性的watcher 去收集上一层的渲染watcher
        watcher.depend();
      }
      return watcher.value; // 返回watcher的值
    };
  }

  function initStateMixin(Vue) {
    // 绥中转换的都是$watch
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exportFn, cb) {
      new Watcher(this, exportFn, {
        user: true
      }, cb);
    };
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
    return vnode(vm, tag, key, data, children);
  }

  // _v()
  function createTextVNode(vm, text) {
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

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      //标签
      vnode.el = document.createElement(tag); // 将真实节点与虚拟节点进行对应，后续方便修改属性
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(JSON.stringify(text));
    }
    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};
    for (var key in oldStyles) {
      // 老节点样式有，新的没有，删除
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }
    for (var _key in oldProps) {
      // 老节点属性有
      if (!props[_key]) {
        // 新的属性没有，删除
        el.removeAttribute(_key);
      }
    }
    for (var _key2 in props) {
      // 新的覆盖老的
      if (_key2 === 'style') {
        // style(color:'red')
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
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
    } else {
      // diff 算法
      patchVnode(oldVNode, vnode);
    }
  }

  // diff算法
  function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
      // tag === tag  key === key
      // 用老节点的父亲 进行替换

      var _el = createElm(vnode);
      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    }

    // 文本的情况 文本期望比较文本内容
    var el = vnode.el = oldVNode.el; //复用老的文本节点
    if (!oldVNode.tag) {
      // 是文本
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text; // 用新的文本覆盖老的
      }
    }

    // 标签 是标签需要比对标签的属性
    patchProps(el, oldVNode.data, vnode.data);

    // 比较子节点 一方有，一方无

    var oldChildren = oldVNode.children || {};
    var newChildren = vnode.children || {};
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整diff
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      // old没有，新的有
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      // old有，新的没有
      el.innerHTML = ''; // 循环删除
    }

    return el;
  }
  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  // diff算法核心 采用双指针的方式 对比新老vnode的儿子节点
  function updateChildren(parent, oldCh, newCh) {
    var oldStartIndex = 0; //老儿子的起始下标
    var oldStartVnode = oldCh[0]; //老儿子的第一个节点
    var oldEndIndex = oldCh.length - 1; //老儿子的结束下标
    var oldEndVnode = oldCh[oldEndIndex]; //老儿子的起结束节点

    var newStartIndex = 0; //同上  新儿子的
    var newStartVnode = newCh[0];
    var newEndIndex = newCh.length - 1;
    var newEndVnode = newCh[newEndIndex];

    // 根据key来创建老的儿子的index映射表  类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (item, index) {
        map[item.key] = index;
      });
      return map;
    }
    // 生成的映射表
    var map = makeIndexByKey(oldCh);

    // 只有当新老儿子的双指标的起始位置不大于结束位置的时候  才能循环 一方停止了就需要结束循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // 因为暴力对比过程把移动的vnode置为 undefined 如果不存在vnode节点 直接跳过
      if (!oldStartVnode) {
        oldStartVnode = oldCh[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldCh[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 头和头对比 依次向后追加
        patch(oldStartVnode, newStartVnode); //递归比较儿子以及他们的子节点
        oldStartVnode = oldCh[++oldStartIndex];
        newStartVnode = newCh[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        //尾和尾对比 依次向前追加
        patch(oldEndVnode, newEndVnode);
        oldEndVnode = oldCh[--oldEndIndex];
        newEndVnode = newCh[--newEndIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 老的头和新的尾相同 把老的头部移动到尾部
        patch(oldStartVnode, newEndVnode);
        parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //insertBefore可以移动或者插入真实dom
        oldStartVnode = oldCh[++oldStartIndex];
        newEndVnode = newCh[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 老的尾和新的头相同 把老的尾部移动到头部
        patch(oldEndVnode, newStartVnode);
        parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldCh[--oldEndIndex];
        newStartVnode = newCh[++newStartIndex];
      } else {
        // 上述四种情况都不满足 那么需要暴力对比
        // 根据老的子节点的key和index的映射表 从新的开始子节点进行查找 如果可以找到就进行移动操作 如果找不到则直接进行插入
        var moveIndex = map[newStartVnode.key];
        if (!moveIndex) {
          // 老的节点找不到  直接插入
          parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        } else {
          var moveVnode = oldCh[moveIndex]; //找得到就拿到老的节点
          oldCh[moveIndex] = undefined; //这个是占位操作 避免数组塌陷  防止老节点移动走了之后破坏了初始的映射表位置
          parent.insertBefore(moveVnode.el, oldStartVnode.el); //把找到的节点移动到最前面
          patch(moveVnode, newStartVnode);
        }
        newStartVnode = newCh[++newStartIndex]; // 将新节点往后移动一位
      }
    }
    // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部
    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
        var ele = newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el;
        parent.insertBefore(createElm(newCh[i]), ele);
      }
    }
    // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var child = oldCh[_i];
        if (child != undefined) {
          parent.removeChild(child.el);
        }
      }
    }
  }

  // lifecycle.js
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
      // console.log('_render')
      // 让vm中的this指向vm
      return this.$options.render.call(vm);
    };
  }

  function mountComponent(vm, el) {
    // 1.调用render方法产生虚拟节点,虚拟dom
    vm.$el = el;
    // 引入watcher的概念 这里注册一个渲染watcher 执行vm._update(vm._render())方法渲染视图
    callHook(vm, "beforeMount"); //初始渲染之前
    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, function () {
      callHook(vm, "beforeUpdate"); //更新之前
    }, true);
    callHook(vm, "mounted"); //渲染完成之后
    // 2.根据虚拟dom产生真实dom
    // 3.插入el元素中
  }

  // vue核心流程：
  // 1.创造了响应式数据
  // 2.模板转化成ast语法树
  // 3.将ast语法树转换成render函数
  // 4.后续每次进行数据跟心只需要执行render函数就行，无需执行ast语法树转化过程

  // render函数会产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点来创造真实dom

  function callHook(vm, hook) {
    console.log(hook);
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  // 给vue增加init方法
  function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
      // vue中,vm.$options 就是获取用户的配置
      var vm = this;
      vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂载到实例上
      // 初始化状态
      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created');
      if (options.el) {
        vm.$mount(options.el); // 实现数据挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        // 先查找有没有render函数
        var template; // 没有render，在看有没有template，没有template，采用外部的template
        if (!ops.template && el) {
          // 没有模板，但是有el
          template = el.outerHTML;
        } else {
          if (el) {
            // 如果有el，则采用模板内容
            template = ops.template;
          }
        }
        // 写了temlate，就直接使用
        if (template) {
          // 这里我们需要对模板进行编译
          var render = compileToFunction(template);
          ops.render = render; // jsx最终编译成h('xxx',{xxx})
        }
      }

      mountComponent(vm, el); // 组件挂载
      // console.log(ops.render)   // 最终我们获取render方法

      // script 变标签引用vue.global.js   这个编译过程是浏览器运行的
      // runtime 不包含模板编译，整个编译过程通过loader转义vue文件，
    };
  }

  // vue
  function Vue(options) {
    // options => 用户的选项
    this._init(options);
  }
  initMixin(Vue); // 扩展init方法
  initLifeCycle(Vue); // m_update vm._render
  initGlobalApi(Vue); // 全局api的实现
  initStateMixin(Vue); // 实现nextTick ,$watch

  // ----------------观察虚拟dom前后变化------------------------

  var render1 = compileToFunction("\n<ul key=\"a\" a=\"1\" style=\"color:red\">\n<li key=\"a\">a</li>\n<li key=\"b\">b</li>\n<li key=\"c\">c</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: 'ok'
    }
  });
  var prevVnode = render1.call(vm1);
  var el = createElm(prevVnode);
  document.body.appendChild(el);
  var render2 = compileToFunction("<ul key=\"a\" a=\"1\" style=\"color:red\">\n    <li key=\"a\">a</li>\n    <li key=\"b\">b</li>\n    <li key=\"c\">c</li>\n    <li key=\"d\">c</li>\n    </ul>");
  var vm2 = new Vue({
    data: {
      name: 'okzfans'
    }
  });
  var nextVnode = render2.call(vm2);

  // 直接替换节点，老节点，会导致性能开销打
  // let newEl = createElm(nextVnode)
  // el.parentNode.replaceChild(newEl,el)

  setTimeout(function () {
    patch(prevVnode, nextVnode);
  }, 1000);
  console.log('prevVnode', prevVnode);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
