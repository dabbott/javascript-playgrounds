import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import ReactNative, { AppRegistry } from 'react-native-web'
import pureRender from 'pure-render-decorator'
import VendorComponents from './VendorComponents'

const APP_NAME = 'App'

// Override registerComponent in order to ignore the name used
const registerComponent = AppRegistry.registerComponent.bind(AppRegistry)
AppRegistry.registerComponent = (name, f) => registerComponent(APP_NAME, f)

const prefix = `
var exports = {};

(function(module, exports, require) {
`

const getSuffix = (filename) => `
})({ exports: exports }, exports, window._require);
window._requireCache['${filename}'] = exports;
;
`

const prefixLineCount = prefix.split('\n').length - 1

@pureRender
export default class extends Component {

  static defaultProps = {
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

  require = (fileMap, entry, name) => {
    let {assetRoot} = this.props

    if (name === 'react-native') {
      return ReactNative
    } else if (name === 'react') {
      return React

    // If name begins with . or ..
    } else if (name.match(/^\.{1,2}\//)) {

      // Check if we're referencing another tab
      const filename = Object.keys(fileMap).find(x => `${name}.js` === `./${x}`)

      if (filename) {
        if (filename === entry) {
          throw new Error(`Requiring entry file ${entry} would cause an infinite loop`)
        }

        if (!window._requireCache[filename]) {
          this.evaluate(filename, fileMap[filename])
        }

        return window._requireCache[filename]
      }

      // Resolve local asset paths
      if (! assetRoot.match(/\/$/)) {
        assetRoot += '/'
      }

      return {uri: assetRoot + name}

    // If we have vendor components registered and loaded,
    // allow for them to be resolved here
    } else if (VendorComponents.get(name)) {
      return VendorComponents.get(name)
    } else {
      console.error(`Failed to resolve module ${name}`)
      return {}
    }
  }

  runApplication({fileMap, entry}) {
    const screenElement = this.refs.root

    this.resetApplication()

    this.props.onRun()

    try {
      window._require = this.require.bind(this, fileMap, entry)
      window._requireCache = {}

      this.evaluate(entry, fileMap[entry])

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

  evaluate(filename, code) {
    const wrapped = prefix + code + getSuffix(filename)

    eval(wrapped)
  }

  render() {
    return (
      <div ref={"root"} />
    )
  }
}
