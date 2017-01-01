class Events {

  _eventMap = {}

  _getListeners(eventName) {
    const {_eventMap} = this

    if (!_eventMap[eventName]) {
      _eventMap[eventName] = []
    }

    return _eventMap[eventName]
  }

  on(eventName, f) {
    const listeners = this._getListeners(eventName)

    listeners.push(f)

    return this.removeListener.bind(this, eventName, f)
  }

  prependListener(eventName, f) {
    const listeners = this._getListeners(eventName)

    listeners.unshift(f)

    return this.removeListener.bind(this, eventName, f)
  }

  removeListener(eventName, f) {
    const listeners = this._getListeners(eventName)
    const index = listeners.indexOf(f)

    if (index >= 0) {
      listeners.splice(index, 1)
    }
  }

  invokeListeners(listeners, ...args) {
    for (let i = 0; i < listeners.length; i++) {
      const result = listeners[i](...args)

      // If a listener returns false, end the listener chain and return a
      // function to invoke the remaining listeners
      if (result === false) {
        const remaining = listeners.slice(i + 1)

        return this.invokeListeners.bind(this, remaining)
      }
    }

    return null
  }

  emit(eventName, ...args) {
    const listeners = this._getListeners(eventName)

    return this.invokeListeners(listeners, ...args)
  }

}

export default new Events()
