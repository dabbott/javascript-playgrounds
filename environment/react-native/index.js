// import Events from './Events'
// import ModuleManager from './ModuleManager'

const {Events, ModuleManager} = require('webplayer')

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

const APP_NAME = 'App'

let firstRun = true
let didRegisterComponent = false

Events.on('app:before', () => {

  if (firstRun) {
    firstRun = false

    const {AppRegistry} = ModuleManager.require('react-native')

    // Override registerComponent in order to ignore the name used
    const registerComponent = AppRegistry.registerComponent.bind(AppRegistry)

    AppRegistry.registerComponent = (name, f) => {
      registerComponent(APP_NAME, f)
      didRegisterComponent = true
    }
  }

  if (didRegisterComponent) {
    const ReactDOM = ModuleManager.require('react-dom')

    const screenElement = document.querySelector('#app')

    ReactDOM.unmountComponentAtNode(screenElement)

    didRegisterComponent = false
  }

})

Events.on('app:after', ({name: entry}) => {

  const {AppRegistry} = ModuleManager.require('react-native')

  // Attempt to register the default export of the entry file
  if (!didRegisterComponent) {
    const EntryComponent = ModuleManager.requireCache[entry]

    if (EntryComponent && EntryComponent.default) {
      AppRegistry.registerComponent(APP_NAME, () => EntryComponent.default)
    }
  }

  // If no component was registered, bail out
  if (!didRegisterComponent) {
    return
  }

  const screenElement = document.querySelector('#app')

  // TODO handle errors
  AppRegistry.runApplication(APP_NAME, {
    rootTag: screenElement,
  })

  // After rendering, add {overflow: hidden} to prevent scrollbars
  if (screenElement.firstElementChild) {
    screenElement.firstElementChild.style.overflow = 'hidden'
  }

})
