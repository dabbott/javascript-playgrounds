import $scriptjs from 'scriptjs'
import React from 'react'
import ReactNative from 'react-native-web'

// Stub for registering and getting vendor components
const components = {}

// Allow for keypaths for use in namespacing (Org.Component.Blah)
const getObjectFromKeyPath = (data, keyPath) => {
  return keyPath.split('.').reduce((prev, curr) => prev[curr], data)
}

export default class VendorComponents {

  // Get a hash of registered vendor components
  static get() {
    return components
  }

  // Register a vendor component
  // name: name used in import/require
  // value: module to resolve
  static register(name, value) {
    components[name] = value
  }

  // Load components from urls
  // Format is an array of arrays [[ require-name, window-name, url ]]
  static load(components, callback) {
    if (components.length) {
      // Necessary for dependency mapping
      window.React = React
      window.ReactNative = ReactNative
      $scriptjs(components.map((vc) => vc[2]), () => {
        components.forEach((vc) => {
          // Inject into vendor components
          VendorComponents.register(vc[0], getObjectFromKeyPath(window, vc[1]))
        })
        callback()
      })
    } else {
      callback()
    }
  }
}
