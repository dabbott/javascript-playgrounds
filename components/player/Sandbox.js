import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import pureRender from 'pure-render-decorator'

const prefix = `
var require = function(name) {
  if (name === 'react-native') {
    return window._ReactNative;
  } else if (name === 'react') {
    return window._React;
  } else {
    return {};
  }
};

var exports = {};

(function(module, exports, require) {
`

const suffix = `
})({ exports: exports }, exports, require);
;
`

const prefixLineCount = prefix.split('\n').length - 1

@pureRender
export default class extends Component {

  static defaultProps = {
    code: '',
    onRun: () => {},
    onError: () => {},
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    window.onmessage = (e) => {
      this.runApplication(e.data)
    }

    window.onerror = (message, source, line) => {
      line -= prefixLineCount
      this.throwError(`${message} (${line})`)
      return true
    }

    parent.postMessage(JSON.stringify({
      id: this.props.id,
      type: 'ready',
    }), '*')
  }

  buildErrorMessage(e) {
    let message = `${e.name}: ${e.message}`
    let line = null

    // Safari
    if (e.line != null) {
      line = e.line

      // FF
    } else if (e.lineNumber != null) {
      line = e.lineNumber

    // Chrome
    } else if (e.stack) {
      const matched = e.stack.match(/<anonymous>:(\d+)/)
      if (matched) {
        line = parseInt(matched[1])
      }
    }

    if (typeof line === 'number') {
      line -= prefixLineCount
      message = `${message} (${line})`
    }

    return message
  }

  throwError(message) {
    parent.postMessage(JSON.stringify({
      id: this.props.id,
      type: 'error',
      payload: message,
    }), '*')
  }

  runApplication(code) {
    const {AppRegistry} = require('react-native-web')

    const screenElement = this.refs.root

    this.resetApplication()

    this.props.onRun()

    try {
      this.evaluate(code)

      AppRegistry.runApplication('MyApp', {
        rootTag: screenElement,
      })
    } catch (e) {
      const message = this.buildErrorMessage(e)
      this.throwError(message)
      this.props.onError(e)
    }
  }

  resetApplication() {
    const screenElement = this.refs.root

    ReactDOM.unmountComponentAtNode(screenElement)
  }

  evaluate(code) {
    window._ReactNative = require('react-native-web')
    window._React = require('react')

    const wrapped = prefix + code + suffix

    eval(wrapped)
  }

  render() {
    return (
      <div ref={"root"} />
    )
  }
}
