import React from 'react'
import ReactDOM from 'react-dom'
import hasProperty from '../utils/hasProperty'
import JavaScriptEnvironment from './javascript-environment'
import type { IEnvironment } from './IEnvironment'

const Environment: IEnvironment = {
  initialize: JavaScriptEnvironment.initialize,

  hasModule: JavaScriptEnvironment.hasModule,

  requireModule: JavaScriptEnvironment.requireModule,

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
