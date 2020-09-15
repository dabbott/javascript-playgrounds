import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import type { IEnvironment } from './IEnvironment'

const modules: Record<string, unknown> = {}

const Environment: IEnvironment = {
  initialize() {
    // Since these are already loaded anyway, there's no real cost to exposing them.
    // Always register them even for pure JS
    modules['react'] = React
    modules['react-dom'] = ReactDOM
    modules['prop-types'] = PropTypes

    Object.assign(window, {
      React,
      ReactDOM,
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
}

export default Environment
