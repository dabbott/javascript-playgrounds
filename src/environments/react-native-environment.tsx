import type ReactDOM from 'react-dom'
import * as ReactNative from 'react-native-web'
import hasProperty from '../utils/hasProperty'
import type { EnvironmentOptions } from './IEnvironment'
import {
  AfterEvaluateOptions,
  BeforeEvaluateOptions,
  JavaScriptEnvironment,
} from './javascript-environment'

const DEFAULT_APP_NAME = 'Main Export'

class ReactNativeEnvironment extends JavaScriptEnvironment {
  lastReactDOM: typeof ReactDOM | null = null
  lastReactNative: typeof ReactNative | null = null

  initialize(options: EnvironmentOptions) {
    if (options.registerBundledModules) {
      this.nodeModules['react-native'] = ReactNative

      Object.assign(window, {
        ReactNative,
      })
    }

    return super.initialize(options)
  }

  beforeEvaluate({ host }: BeforeEvaluateOptions) {
    const currentReactNative = this.lastReactNative

    if (
      currentReactNative &&
      currentReactNative.AppRegistry.getAppKeys().length > 0
    ) {
      this.lastReactDOM?.unmountComponentAtNode(host)
    }
  }

  afterEvaluate({ context, host, require }: AfterEvaluateOptions) {
    const currentReactNative = require('react-native') as typeof ReactNative
    const currentReactDOM = require('react-dom') as typeof ReactDOM

    this.lastReactNative = currentReactNative
    this.lastReactDOM = currentReactDOM

    const { AppRegistry, Dimensions } = currentReactNative

    // Attempt to register the default export of the entry file
    if (
      AppRegistry.getAppKeys().length === 0 ||
      (AppRegistry.getAppKeys().length === 1 &&
        AppRegistry.getAppKeys()[0] === DEFAULT_APP_NAME)
    ) {
      const EntryComponent = context.requireCache[context.entry]

      if (
        EntryComponent &&
        typeof EntryComponent === 'object' &&
        hasProperty(EntryComponent, 'default')
      ) {
        AppRegistry.registerComponent(
          DEFAULT_APP_NAME,
          () => EntryComponent.default
        )
      }
    }

    const appKeys = AppRegistry.getAppKeys()

    // If no component was registered, bail out
    if (appKeys.length === 0) return

    // Initialize window dimensions (sometimes this doesn't happen automatically?)
    Dimensions._update()

    AppRegistry.runApplication(appKeys[0], {
      rootTag: host,
    })

    const renderedElement = host.firstElementChild as HTMLElement | undefined

    // After rendering, add 'overflow: hidden' to prevent scrollbars
    if (renderedElement) {
      renderedElement.style.overflow = 'hidden'
    }
  }
}

export default new ReactNativeEnvironment()
