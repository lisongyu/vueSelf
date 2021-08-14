// 基类

class Compiler {
  constructor(el, vm) {
    // 判断el属性是不是一个元素，如果不是元素，那就获取他
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    console.log(this.el)
    // 把当前节点中的元素获取到放到内存中
    this.vm=vm
    let fragment = this.node2fragment(this.el)
    // 把节点中的内容进行替换

    // 编译模版 用数据编译
    this.compile(fragment)
    // 把内容塞到页面中
    this.el.appendChild(fragment)
  }

  isDirective(attrName){
    return attrName.startsWith('v-')
  }
  compileElement(node){
    let attributes=node.attributes;// 类数组
    [...attributes].forEach(attr=>{
      // console.log(attr)
      let {name,value:expr}=attr
      // 判断是不是指令
      if(this.isDirective(name)){
        // console.log(node)
        let [,directive]=name.split('-')
        CompileUtil[directive](node,expr,this.vm);
      }
    })


  }
  // 编译文本
  compileText(node){// 判断当前文本节点中内容是否包含{{}}
    let content=node.textContent
   
    let reg=/\{\{(.+?)\}\}/
    if(reg.test(content)){
      console.log(content,'text')
      // 文本节点
      CompileUtil.text(node,RegExp.$1,this.vm)

    }
  }
  // 核心的编译
  compile(node){ // 用来编译内存中的dom节点
    let childNode=node.childNodes;
    // console.log(childNode);
    [...childNode].forEach(child=>{
      if(this.isElementNode(child)){ //元素
        // console.log('element')
        this.compileElement(child)
        // 如果是元素，需要把自己传过去，再去遍历子节点
        this.compile(child)
      }else{
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

CompileUtil={
  // 根据表达式取到对应的数据
  getVal(vm,expr){ // vm.$data
   return expr.split('.').reduce((data,current)=>{
      return data[current]
    },vm.$data)


  },
  model(node,expr,vm){ // node是节点 expr 是表达式 vm是当前实例
    // 给输入框赋予value属性
    let fn=this.modelUpdater
    let value = this.getVal(vm,expr)
    fn(node,value)
  },
  html(){

  },
  text(node,expr,vm){
    let fn=this.textUpdater
    let value = this.getVal(vm,expr)
    console.log(value)
    fn(node,value)

  },
 
  modelUpdater(node,value){
    node.value=value
  },
  textUpdater(node,value){
    node.textContent=value
  }

  
}
class Vue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    if (this.$el) {
      new Compiler(this.$el, this)
    }
  }

}