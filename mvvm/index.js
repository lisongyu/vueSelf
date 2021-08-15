// 基类

class Dep {
  constructor() {
    this.subs = []

  }

  // 订阅
  addSub(watcher) { // 添加watch
    this.subs.push(watcher)

  }

  // 发布
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}
// 观察者 (发布订阅) 观察者 被观察者

class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    // 默认先存放一个老值
    this.oldValue = this.get()
  }
  get() {
    Dep.target = this; // 先把自己放在this上
    // 取值 把这个观察者和数据关联起来
    let value = CompileUtil.getVal(this.vm, this.expr);
    Dep.target = null;
    return value
  }
  update() { // 更新操作 数据变化后，会调用观察者的update方法
    let newVal = CompileUtil.getVal(this.vm, this.expr);
    if (newVal != this.oloValue) {
      this.cb(newVal)
    }

  }
}

// vm.$watch(vm,'school.name',(newVal)=>{

//})
class Observer {
  constructor(data) {
    console.log(data)
    this.observer(data)

  }
  observer(data) {
    if (data && typeof data == 'object') {
      // 如果是对象
      for (let key in data) {
        this.defineReactive(data, key, data[key])
      }
    }
  }
  defineReactive(obj, key, value) {
    this.observer(value)
    let dep = new Dep() // 给每一个属性都加上一个具有发布订阅的功能
    Object.defineProperty(obj, key, {
      get() {
        // 创建watcher时 会渠道对应的内容，并且把watcher放到全局上
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        if (newValue != value) {
          this.observer(newValue)
          value = newValue
          dep.notify()
        }

      }
    })
  }
}
class Compiler {
  constructor(el, vm) {
    // 判断el属性是不是一个元素，如果不是元素，那就获取他
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    console.log(this.el)
    // 把当前节点中的元素获取到放到内存中
    this.vm = vm
    let fragment = this.node2fragment(this.el)
    // 把节点中的内容进行替换

    // 编译模版 用数据编译
    this.compile(fragment)
    // 把内容塞到页面中
    this.el.appendChild(fragment)
  }

  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isEvent(attrName) {
    console.log(attrName)
    return attrName.startsWith('@')

  }
  compileElement(node) {
    let attributes = node.attributes;// 类数组
    [...attributes].forEach(attr => {
      // console.log(attr)
      let { name, value: expr } = attr
      // 判断是不是指令
      if (this.isDirective(name)) {
        // console.log(node)
        let [, directive] = name.split('-')
        CompileUtil[directive](node, expr, this.vm);
      } else if (this.isEvent(name)) {

        let eventName = name.slice(1)
        CompileUtil.on(node, expr, this.vm, eventName)
      }
    })


  }
  // 编译文本
  compileText(node) {// 判断当前文本节点中内容是否包含{{}}
    let content = node.textContent

    let reg = /\{\{(.+?)\}\}/g
    if (reg.test(content)) {
      console.log(content, 'text')
      // 文本节点
      CompileUtil.text(node, content, this.vm)

    }
  }
  // 核心的编译
  compile(node) { // 用来编译内存中的dom节点
    let childNode = node.childNodes;
    // console.log(childNode);
    [...childNode].forEach(child => {
      if (this.isElementNode(child)) { //元素
        // console.log('element')
        this.compileElement(child)
        // 如果是元素，需要把自己传过去，再去遍历子节点
        this.compile(child)
      } else {
        this.compileText(child)
      }
    })
  }
  // 把节点移动到内存中
  node2fragment(node) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while (firstChild = node.firstChild) {
      // appendChild具有移动性
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  isElementNode(node) { // 是不是元素节点
    return node.nodeType === 1

  }
}

CompileUtil = {
  // 根据表达式取到对应的数据
  getVal(vm, expr) { // vm.$data
    return expr.split('.').reduce((data, current) => {
      return data[current]
    }, vm.$data)
  },
  setValue(vm, expr, value) {
    expr.split('.').reduce((data, current, index, arr) => {
      if (index == arr.length - 1) {
        return data[current] = value
      }
      return data[current]
    }, vm.$data)

  },
  on(node, expr, vm, eventName) {
    console.log(expr)
    node.addEventListener(eventName, (e) => {
      vm[expr].call(vm, e)
    })

  },
  // 解析v-model这个指令
  model(node, expr, vm) { // node是节点 expr 是表达式 vm是当前实例
    // 给输入框赋予value属性
    let fn = this.modelUpdater
    new Watcher(vm, expr, (newVal) => { // 给输入框添加一个观察者，如果稍后数据更新了会触发此方法，会拿到新值，给输入框赋予值
      fn(node, newVal)
    })
    let value = this.getVal(vm, expr)

    fn(node, value)

    node.addEventListener('input', (e) => {
      let getValue = e.target.value
      this.setValue(vm, expr, getValue)

    })
  },
  html() {

  },

  getContentValue(vm, expr) {
    let reg = /\{\{(.+?)\}\}/g
    // 遍历表达式将内容重新替换成一个完成的内容，返还回去
    return expr.replace(reg, (...args) => {
      return this.getVal(vm, args[1])
    })
  },
  text(node, expr, vm) {
    let fn = this.textUpdater
    // let value = this.getVal(vm,expr)
    // console.log(value)


    let reg = /\{\{(.+?)\}\}/g
    let content = expr.replace(reg, (...args) => {
      new Watcher(vm, args[1], (newVal) => { // 给表达式每个都加观察者
        fn(node, this.getContentValue(vm, expr)) // 返回了一个全的字符串
      })
      return this.getVal(vm, args[1])

    })

    fn(node, content)

  },

  modelUpdater(node, value) {
    node.value = value
  },
  textUpdater(node, value) {
    node.textContent = value
  }


}
class Vue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed;
    let methods = options.methods;
    if (this.$el) {
      // 把数据 全部转化成用Object.defineProperty来定义
      new Observer(this.$data)



      for (let key in computed) {
        Object.defineProperty(this.$data, key, {
          get: () => {
            console.log(3343)
            return computed[key].call(this)
          }
        })
      }


      for (let key in methods) {

        Object.defineProperty(this, key, {
          get() {

            return methods[key]
          }
        })
      }

      // 把数据取值操作 vm上的取值操作 都代理到vm.$data 上
      this.proxyVm(this.$data);

      new Compiler(this.$el, this)
    }
  }
  proxyVm(data) {
    for (let key in data) {
      Object.defineProperty(this, key, { // 实现可以通过vm取到对应的内容
        get() {
          return data[key] // 进行了转化操作
        }
      })
    }
  }

}