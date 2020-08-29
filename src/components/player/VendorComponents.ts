import $scriptjs from 'scriptjs'
import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactNative from 'react-native-web'
import PropTypes from 'prop-types'

import * as Networking from '../../utils/Networking'

// Stubs for registering and getting vendor components
const components: Record<string, unknown> = {}
const requires: Record<string, string> = {}

// Allow for keypaths for use in namespacing (Org.Component.Blah)
const getObjectFromKeyPath = (data: any, keyPath: string): unknown => {
  return keyPath
    .split('.')
    .reduce((prev: any, curr: string) => prev[curr], data)
}

type ExternalComponentDescription = [string, string, string]
type ModuleComponentDescription = [string, string]
type ComponentDescription =
  | ModuleComponentDescription
  | ExternalComponentDescription

// Currently there are two kinds of components:
// - "externals", which use register/get. These store the *actual value*
// - "modules", which use define/require. These store *just the code* and must
//   be executed in the module wrapper before use.
// TODO figure out how to merge these
export default class VendorComponents {
  // Register an external
  // name: name used in import/require
  // value: external to resolve
  static register(name: string, value: unknown) {
    components[name] = value
  }

  // Get an external by name
  static get(name: string) {
    return components[name]
  }

  // Register a module
  // name: name used in import/require
  // code: module code to execute
  static define(name: string, code: string) {
    requires[name] = code
  }

  // Get a module by name
  static require(name: string) {
    return requires[name]
  }

  static loadModules(modules: ModuleComponentDescription[]) {
    return Promise.all(
      modules.map(async ([name, url]) => {
        const text = await Networking.get(url)

        VendorComponents.define(name, text)
      })
    )
  }

  static loadExternals(externals: ExternalComponentDescription[]) {
    return new Promise((resolve) => {
      if (externals.length === 0) {
        resolve()
        return
      }

      const urls = externals.map((vc) => vc[2])

      $scriptjs(urls, () => {
        externals.forEach(([requireName, windowName]) => {
          // Inject into vendor components
          VendorComponents.register(
            requireName,
            getObjectFromKeyPath(window, windowName)
          )
        })
        resolve()
      })
    })
  }

  // Load components from urls
  static load(components: ComponentDescription[], callback: () => void) {
    // Necessary for dependency mapping
    window.React = React
    window.ReactNative = ReactNative
    // Add default export, although it's uncommon
    ;(window.ReactNative as any).default = ReactNative
    window.ReactDOM = ReactDOM
    window.PropTypes = PropTypes

    // For backwards compatibility (should only be react-native-animatable example)
    ;(React as any).PropTypes = PropTypes

    // Format is an array of 2-element arrays [[ require-name, url ]]
    const modules = components.filter(
      (vc) => vc.length === 2
    ) as ModuleComponentDescription[]

    // Format is an array of 3-element arrays [[ require-name, window-name, url ]]
    const externals = components.filter(
      (vc) => vc.length === 3
    ) as ExternalComponentDescription[]

    Promise.all([
      this.loadModules(modules),
      this.loadExternals(externals),
    ]).then(callback)
  }
}
