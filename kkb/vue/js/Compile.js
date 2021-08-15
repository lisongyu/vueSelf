class Compiler {
  constructor(el, vm) {
    // 判断类型
    this.$vm = vm
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    if (this.$el) {
      let fragment=this.node2fragment(this.$el)
      console.log(fragment)
      this.compile(fragment)
    }


  }
  node2fragment(node){
    let fragment=document.createDocumentFragment() // 创建文档碎片
    let firstChild;
    while(firstChild=node.firstChild){
      fragment.appendChild(firstChild)
    }
    return fragment
    
  }
  compile(node) {
    // 递归遍历文档碎片
    [...node.childNodes].forEach(node=>{
      // 判断类型
      if(this.isElementNode(node)){

      }else if(this.isInter(node)){
        console.log()
      }
      if(node.childNodes){
        this.compile(node)
      }
    })

  }
  // 判断是否是插值
  isInter(node){
    let reg=/\{\{(.+?)\}\}/g
    return node.nodeType===3&&reg.test(node.textContent)

  }
  // 是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }

}