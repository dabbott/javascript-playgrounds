import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactNative, { AppRegistry } from 'react-native-web'
import pureRender from 'pure-render-decorator'

const APP_NAME = 'App'

// Override registerComponent in order to ignore the name used
const registerComponent = AppRegistry.registerComponent.bind(AppRegistry)
AppRegistry.registerComponent = (name, f) => registerComponent(APP_NAME, f)

const _require = (assetRoot = '', name) => {
  if (name === 'react-native') {
    return ReactNative
  } else if (name === 'react') {
    return React

  // Resolve local asset paths
  } else if (name.match(/^\.{1,2}\//)) {
    if (! assetRoot.match(/\/$/)) {
      assetRoot += '/'
    }

    return {uri: assetRoot + name}
  } else {
    return {}
  }
}

const prefix = `
var exports = {};

(function(module, exports, require) {
`

const suffix = `
})({ exports: exports }, exports, window._require);
;
`

const prefixLineCount = prefix.split('\n').length - 1

@pureRender
export default class extends Component {

  static defaultProps = {
    code: '',
    assetRoot: '',
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
    const screenElement = this.refs.root

    this.resetApplication()

    this.props.onRun()

    try {
      this.evaluate(code)

      AppRegistry.runApplication(APP_NAME, {
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
    window._require = _require.bind(null, this.props.assetRoot)

    const wrapped = prefix + code + suffix

    eval(wrapped)
  }

  render() {
    return (
      <div ref={"root"} />
    )
  }
}
