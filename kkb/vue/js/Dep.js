class Dep {
  constructor() {
    this.deps = []
  }
  addSub(watcher) {
    this.deps.push(watcher)

  }
  notify() {
    this.deps.forEach(watcher => watcher.update())
  }
}