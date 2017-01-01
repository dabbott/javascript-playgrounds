import ReactDOM from 'react-dom'
import { AppRegistry } from 'react-native-web'
import { ModuleManager } from 'webplayer'

const APP_NAME = 'App'

export default class ReactNativeEnvironment {

  firstRun = true
  didRegisterComponent = false

  appendRootElement() {
    const rootElement = document.createElement('div')
    rootElement.id = 'app'
    document.body.appendChild(rootElement)

    return rootElement
  }

  patchAppRegistry() {

    // Override registerComponent in order to ignore the name used
    const registerComponent = AppRegistry.registerComponent.bind(AppRegistry)

    AppRegistry.registerComponent = (name, f) => {
      registerComponent(APP_NAME, f)
      this.didRegisterComponent = true
    }
  }

  before = () => {
    if (this.firstRun) {
      this.firstRun = false
      this.rootElement = this.appendRootElement()
      this.patchAppRegistry()
    }

    if (this.didRegisterComponent) {
      this.didRegisterComponent = false
      ReactDOM.unmountComponentAtNode(this.rootElement)
    }
  }

  after = ({name: entry}) => {

    // Attempt to register the default export of the entry file
    if (!this.didRegisterComponent) {
      const EntryComponent = ModuleManager.requireCache[entry]

      if (EntryComponent && EntryComponent.default) {
        AppRegistry.registerComponent(APP_NAME, () => EntryComponent.default)
      }
    }

    // If no component was registered, bail out
    if (!this.didRegisterComponent) {
      return
    }

    // TODO handle errors differently here than global handler?
    AppRegistry.runApplication(APP_NAME, {
      rootTag: this.rootElement,
    })

    // After rendering, add {overflow: hidden} to prevent scrollbars
    if (this.rootElement.firstElementChild) {
      this.rootElement.firstElementChild.style.overflow = 'hidden'
    }
  }
}
