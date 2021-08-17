// 每一个响应式对象，伴生一个Observer实例
class Observer {
  constructor(data) {

    this.observer(data)

  }
  observer(data) {
    if (typeof data !== 'object' || data == null) {
      return
    }
    Object.keys(data).forEach(key => this.defineReactive(data, key, data[key]))
  }
  defineReactive(data, key, value) {
    this.observer(value)
    // 每执行一次defineReactive,就创建一个Dep实例
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        debugger
        if (newValue !== value) {
        
          this.observer(newValue)
          value = newValue
          // 通知更新
          dep.notify()
        }

      }
    })
  }
}