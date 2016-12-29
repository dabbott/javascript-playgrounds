import $scriptjs from 'scriptjs'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactNative from 'react-native-web'

import * as Networking from '../../utils/Networking'

// Stubs for registering and getting vendor components
const components = {}
const requires = {}

// Allow for keypaths for use in namespacing (Org.Component.Blah)
const getObjectFromKeyPath = (data, keyPath) => {
  return keyPath.split('.').reduce((prev, curr) => prev[curr], data)
}

// Currently there are two kinds of components:
// - "externals", which use register/get. These store the *actual value*
// - "modules", which use define/require. These store *just the code* and must
//   be executed in the module wrapper before use.
// TODO figure out how to merge these
export default class VendorComponents {

  // Register an external
  // name: name used in import/require
  // value: external to resolve
  static register(name, value) {
    components[name] = value
  }

  // Get an external by name
  static get(name) {
    return components[name]
  }

  // Register a module
  // name: name used in import/require
  // code: module code to execute
  static define(name, code) {
    requires[name] = code
  }

  // Get a module by name
  static require(name) {
    return requires[name]
  }

  static loadModules(modules) {
    return Promise.all(
      modules.map(async ([name, url]) => {
        const text = await Networking.get(url)

        VendorComponents.define(name, text)
      })
    )
  }

  static loadExternals(externals) {
    return new Promise(resolve => {
      if (externals.length === 0) {
        resolve()
        return
      }

      const urls = externals.map(vc => vc[2])

      $scriptjs(urls, () => {
        externals.forEach(([requireName, windowName]) => {
          // Inject into vendor components
          VendorComponents.register(requireName, getObjectFromKeyPath(window, windowName))
        })
        resolve()
      })
    })
  }

  // Load components from urls
  static load(components, callback) {

    // Necessary for dependency mapping
    window.React = React
    window.ReactNative = ReactNative
    window.ReactDOM = ReactDOM

    // Format is an array of 2-element arrays [[ require-name, url ]]
    const modules = components.filter(vc => vc.length === 2)

    // Format is an array of 3-element arrays [[ require-name, window-name, url ]]
    const externals = components.filter(vc => vc.length === 3)

    Promise.all([
      this.loadModules(modules),
      this.loadExternals(externals),
    ]).then(callback)
  }
}
