import WindowHook from './WindowHook'
import Events from './Events'
import ModuleManager from './ModuleManager'

// Begin listening for events from the parent frame
WindowHook.onMessage((data) => {
  const {type, payload} = data

  console.log('Player message', type, payload)

  Events.emit(type, payload)
})

// Catch errors and pass them to the parent frame
window.onerror = (message, source, line) => {
  WindowHook.postMessage({
    type: 'error',
    payload: {message, line},
  })

  return true
}

Events.on('eval', payload => eval(payload))

Events.on('module:provide', ({name, code}) => ModuleManager.provide(name, code))

Events.on('module:require', ({name}) => ModuleManager.require(name))

window.webplayer = {
  WindowHook,
  Events,
  ModuleManager,
}
