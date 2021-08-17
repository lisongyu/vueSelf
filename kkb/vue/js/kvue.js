class KVue {
  constructor(options) {
    this.$data = options.data;
    this.$el = options.el
    this.$options = options;
    new Observer(this.$data)
    // 代理
    this.proxyVm(this.$data)
    new Compiler(this.$el, this)
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




