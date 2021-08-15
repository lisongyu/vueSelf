 class KVue{
   constructor(options){
    this.$data=options.data;
    this.$el=options.el
    this.$options=options;
    new Observer(this.$data)
    new Compiler(this.$el,this)


    // 代理
    proxy(this)
   

   }
 }
// 将¥data中的key代理到实例上
 function proxy(vm){
  Object.keys(vm.$data).forEach(key=>{
    Object.defineProperty(vm,key,{
      get(){
        return vm.$data[key]
      },
      set(v){
        vm.$data[key]=v
      }
    })
  })
 }



