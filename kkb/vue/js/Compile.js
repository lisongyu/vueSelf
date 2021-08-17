class Compiler {
  constructor(el, vm) {
    // 判断类型
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      let fragment = this.node2fragment(this.$el)
      console.log(fragment)
      this.compile(fragment)

      // 把内容塞到页面中
      this.$el.appendChild(fragment)
    }


  }
  node2fragment(node) {
    let fragment = document.createDocumentFragment() // 创建文档碎片
    let firstChild;
    while (firstChild = node.firstChild) {
      fragment.appendChild(firstChild)
    }
    return fragment

  }
  compile(node) {
    // 递归遍历文档碎片
    [...node.childNodes].forEach(node => {
      // 判断类型
      if (this.isElementNode(node)) {
        this.compileElement(node)
        if (node.childNodes) {
          this.compile(node)
        }

      } else if (this.isInter(node)) {
        this.compileText(node)
      }

    })

  }
  compileElement(node) {
    // 获取节点属性
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value
      // 判断属性的类型
      console.log(this.isDirective(attrName))
      if (this.isDirective(attrName)) {
        const dir = attrName.substring(2);

        this[dir] && this[dir](node, exp)
      }
    })

  }

  // 文本指令
  text(node, exp) {
   
    node.textContent = this.getVal(exp)
  }
  html(node,exp){
    node.innerHTML = this.getVal(exp)
  }
  // 所有动态绑定都需要创建更新函数以及对应的watcher实例
  update(node,exp,dir){
    // textUpdater
    // 初始化
    const fn=this[dir+'Updater']
    fn&&fn(node,this.$vm[exp])

    //更新
  }
  // 获取值
  getVal(expr) {
    return expr.split('.').reduce((data, cur) => {

      return data[cur]
    }, this.$vm)
  }
  // 插值文本编译
  compileText(node) {
    // 获取匹配表达式
    let reg = /\{\{(.+?)\}\}/g
    // 取值，获取值，然后进行赋值
    let expr = node.textContent
    let content = expr.replace(reg, (...args) => {
      return this.getVal(args[1])
    })
    console.log(content)
    node.textContent = content

  }
  // 判断是否是插值
  isInter(node) {
    let reg = /\{\{(.+?)\}\}/g
    return node.nodeType === 3 && reg.test(node.textContent)

  }
  isDirective(attrName) {
    return attrName.indexOf('k-') === 0
  }
  // 是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }

}