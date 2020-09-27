import React from 'react'
import ReactDOM from 'react-dom'
import hasProperty from '../utils/hasProperty'
import {
  AfterEvaluateOptions,
  BeforeEvaluateOptions,
  JavaScriptEnvironment,
} from './javascript-environment'

class ReactEnvironment extends JavaScriptEnvironment {
  beforeEvaluate({ host }: BeforeEvaluateOptions) {
    ReactDOM.unmountComponentAtNode(host)
  }

  afterEvaluate({ context, host }: AfterEvaluateOptions) {
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
  }
}

export default new ReactEnvironment()
