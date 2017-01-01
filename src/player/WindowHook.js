
class WindowHook {
  postMessage(data) {
    parent.postMessage(JSON.stringify(data), '*')
  }

  onMessage(listener) {
    window.addEventListener('message', (e) => {
      listener(e.data)
    })
  }
}

export default new WindowHook()
