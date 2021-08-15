// 每一个响应式对象，伴生一个Observer实例
class Observer{
  constructor(data){

    this.observer(data)
 
  }
  observer(data){
    if(typeof obj !== 'object' || obj ==null){
      return 
    }
    Object.keys(data).forEach(key=>this.defineReactive(data,key,obj[key]))
  }
  defineReactive(data,key,value){
    this.observer(value)
    Object.defineProperty(data,key,{
      get(){
        return value
      },
      set(newValue){
        if(newValue!==value){
          this.observer(newValue)
          value=newValue
        }
        
      }
    })
  }
}