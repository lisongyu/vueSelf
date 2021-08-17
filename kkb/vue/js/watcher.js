// Watcher：小秘书，界面中的一个依赖对应一个小秘书
class Watcher{
  constructor(vm,key,updateFn){
    this.vm=vm
    this.key=key
    this.updateFn=updateFn

  }
  getVal(){
    return this.key.split('.').reduce((data,cur)=>{
      return data[cur]
    },this.vm)
  }
  // 管家调用
  update(){
    let getValue=this.getVal()
    // 闯入当前最新值给更新函数
    this.updateFn.call(thi.vm,getValue)
  }
}