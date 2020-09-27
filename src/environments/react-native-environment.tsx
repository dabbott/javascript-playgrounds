import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
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
  initialize(options: EnvironmentOptions) {
    this.nodeModules['react-native'] = ReactNative

    Object.assign(window, {
      ReactNative,
    })

    return super.initialize(options)
  }

  beforeEvaluate({ host }: BeforeEvaluateOptions) {
    if (ReactNative.AppRegistry.getAppKeys().length > 0) {
      ReactDOM.unmountComponentAtNode(host)
    }
  }

  afterEvaluate({ context, host }: AfterEvaluateOptions) {
    const { AppRegistry, Dimensions } = ReactNative

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
