import React from 'react'
import type ReactDOM from 'react-dom'
import hasProperty from '../utils/hasProperty'
import {
  AfterEvaluateOptions,
  BeforeEvaluateOptions,
  JavaScriptEnvironment,
} from './javascript-environment'

class ReactEnvironment extends JavaScriptEnvironment {
  lastReactDOM: typeof ReactDOM | null = null

  beforeEvaluate({ host }: BeforeEvaluateOptions) {
    this.lastReactDOM?.unmountComponentAtNode(host)
  }

  afterEvaluate({ context, host, require }: AfterEvaluateOptions) {
    const currentReactDOM = require('react-dom') as typeof ReactDOM
    this.lastReactDOM = currentReactDOM

    const EntryComponent = context.requireCache[context.entry]

    if (
      EntryComponent &&
      typeof EntryComponent === 'object' &&
      hasProperty(EntryComponent, 'default')
    ) {
      const Component = EntryComponent.default as React.FunctionComponent
      currentReactDOM.render(<Component />, host)
    }

    const renderedElement = host.firstElementChild as HTMLElement | undefined

    // After rendering, add 'overflow: hidden' to prevent scrollbars
    if (renderedElement) {
      renderedElement.style.overflow = 'hidden'
    }
  }
}

export default new ReactEnvironment()
