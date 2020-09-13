import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactNative from 'react-native-web'
import hasProperty from '../utils/hasProperty'
import type { IEnvironment } from './IEnvironment'

const DEFAULT_APP_NAME = 'Main Export'

const modules: Record<string, unknown> = {}

const Environment: IEnvironment = {
  initialize() {
    modules['react'] = React
    modules['react-dom'] = ReactDOM
    modules['react-native'] = ReactNative
    modules['prop-types'] = PropTypes

    Object.assign(window, {
      React,
      ReactDOM,
      ReactNative,
      PropTypes,
    })

    return Promise.resolve()
  },

  hasModule(name: string): boolean {
    return modules.hasOwnProperty(name)
  },

  requireModule(name: string): unknown {
    return modules.hasOwnProperty(name) ? modules[name] : undefined
  },

  beforeEvaluate({ host }: { host?: HTMLDivElement }) {
    if (ReactNative.AppRegistry.getAppKeys().length > 0 && host) {
      ReactDOM.unmountComponentAtNode(host)
    }
  },

  afterEvaluate({ entry, host }: { entry: string; host: HTMLDivElement }) {
    const { AppRegistry, Dimensions } = ReactNative

    // Attempt to register the default export of the entry file
    if (
      AppRegistry.getAppKeys().length === 0 ||
      (AppRegistry.getAppKeys().length === 1 &&
        AppRegistry.getAppKeys()[0] === DEFAULT_APP_NAME)
    ) {
      const EntryComponent = window._requireCache[entry]

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
  },
}

export default Environment
