import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import hasProperty from '../utils/hasProperty'
import type { IEnvironment } from './IEnvironment'

const modules: Record<string, unknown> = {}

const Environment: IEnvironment = {
  initialize() {
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

  beforeEvaluate({ host }: { host?: HTMLDivElement }) {
    if (host) {
      ReactDOM.unmountComponentAtNode(host)
    }
  },

  afterEvaluate({ context, host }) {
    const EntryComponent = context.requireCache[context.entry]

    if (
      EntryComponent &&
      typeof EntryComponent === 'object' &&
      hasProperty(EntryComponent, 'default')
    ) {
      const Component = EntryComponent.default as React.FunctionComponent
      ReactDOM.render(<Component />, host)
    }

    const renderedElement = host.firstElementChild as HTMLElement | undefined

    // After rendering, add 'overflow: hidden' to prevent scrollbars
    if (renderedElement) {
      renderedElement.style.overflow = 'hidden'
    }
  },
}

export default Environment
