import PropTypes from 'prop-types'
import React, {
  PureComponent,
  isValidElement,
  createRef,
  CSSProperties,
} from 'react'
import ReactDOM from 'react-dom'
import * as ReactNative from 'react-native-web'
import { prefixObject } from '../../utils/Styles'
import consoleProxy, {
  consoleClear,
  consoleLog,
  consoleLogRNWP,
} from './ConsoleProxy'
import VendorComponents from './VendorComponents'
import * as ExtendedJSON from '../../utils/ExtendedJSON'
import hasProperty from '../../utils/hasProperty'
import { Message } from '../../types/Messages'

declare global {
  interface Window {
    ReactNative: unknown
    PropTypes: unknown
    _VendorComponents: typeof VendorComponents
    _consoleProxy: typeof console
    regeneratorRuntime: unknown
    _requireCache: Record<string, unknown>
    _didRegisterComponent: boolean
    _require: (name: string) => unknown
    __message: (message: Message) => void
  }
}

window._VendorComponents = VendorComponents

const AppRegistry = ReactNative.AppRegistry

window._consoleProxy = consoleProxy

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

const APP_NAME = 'App'

// Override registerComponent in order to ignore the name used
const registerComponent = AppRegistry.registerComponent.bind(AppRegistry)
AppRegistry.registerComponent = (name: string, f: () => void) => {
  registerComponent(APP_NAME, f)
  window._didRegisterComponent = true
}

const prefix = `
var exports = {};
var module = {exports: exports};
var console = window._consoleProxy;

(function(module, exports, require) {
`

const getSuffix = (filename: string) => `
})(module, exports, window._require);
window._requireCache['${filename}'] = module.exports;
;
`

const prefixLineCount = prefix.split('\n').length - 1

const styles = prefixObject({
  root: {
    flex: '1 1 auto',
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    display: 'flex',
  },
})

interface Props {
  id: string
  assetRoot: string
  prelude: string
  statusBarHeight: number
  statusBarColor: string
  sharedEnvironment: boolean
  onRun: () => {}
  onError: (error: Error) => {}
}

export default class Sandbox extends PureComponent<Props> {
  static defaultProps = {
    assetRoot: '',
    onRun: () => {},
    onError: () => {},
    prelude: '',
    statusBarHeight: 0,
    statusBarColor: 'black',
    sharedEnvironment: true,
  }

  componentDidMount() {
    window.onmessage = (e: MessageEvent) => {
      if (!e.data || e.data.source !== 'rnwp') return

      this.runApplication(e.data)
    }

    window.onerror = (
      message: Event | string,
      source?: string,
      line?: number
    ) => {
      const editorLine = (line || 0) - prefixLineCount
      this.throwError(`${message} (${editorLine})`)
      return true
    }

    parent.postMessage(
      JSON.stringify({
        id: this.props.id,
        type: 'ready',
      }),
      '*'
    )
  }

  buildErrorMessage(e: Error) {
    let message = `${e.name}: ${e.message}`
    let line = null

    // Safari
    if ((e as any).line != null) {
      line = (e as any).line

      // FF
    } else if ((e as any).lineNumber != null) {
      line = (e as any).lineNumber

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

  throwError(message: string) {
    parent.postMessage(
      JSON.stringify({
        id: this.props.id,
        type: 'error',
        payload: message,
      }),
      '*'
    )
  }

  require = (fileMap: Record<string, string>, entry: string, name: string) => {
    const { _requireCache } = window
    let { assetRoot } = this.props

    if (name === 'react-native') {
      return ReactNative
    } else if (name === 'react-dom') {
      return ReactDOM
    } else if (name === 'react') {
      return React
    } else if (name === 'prop-types') {
      return PropTypes

      // If name begins with . or ..
    } else if (name.match(/^\.{1,2}\//)) {
      // Check if we're referencing another tab
      const filename = Object.keys(fileMap).find(
        (x) => `${name}.js` === `./${x}`
      )

      if (filename) {
        if (filename === entry) {
          throw new Error(
            `Requiring entry file ${entry} would cause an infinite loop`
          )
        }

        if (!_requireCache[filename]) {
          this.evaluate(filename, fileMap[filename])
        }

        return _requireCache[filename]
      }

      // Resolve local asset paths
      if (!assetRoot.match(/\/$/)) {
        assetRoot += '/'
      }

      return { uri: assetRoot + name }

      // If we have vendor components registered and loaded,
      // allow for them to be resolved here
    } else if (VendorComponents.get(name)) {
      return VendorComponents.get(name)
    } else if (VendorComponents.require(name)) {
      const code = VendorComponents.require(name)

      if (!_requireCache[name]) {
        this.evaluate(name, code)
      }

      return _requireCache[name]
    } else {
      console.error(`Failed to resolve module ${name}`)
      return {}
    }
  }

  sendMessage = (message: Message) => {
    const { sharedEnvironment } = this.props

    if (sharedEnvironment) {
      if (message.type === 'console' && message.payload.command === 'log') {
        message.payload.data = message.payload.data.map((log) => {
          if (isValidElement(log as any)) {
            return {
              __is_react_element: true,
              element: log,
              ReactDOM,
            }
          } else {
            return log
          }
        })
      }

      parent.__message(message)
    } else {
      parent.postMessage(ExtendedJSON.stringify(message), '*')
    }
  }

  runApplication({
    fileMap,
    entry,
  }: {
    fileMap: Record<string, string>
    entry: string
  }) {
    const screenElement = this.root.current

    if (!screenElement) return

    if (window._didRegisterComponent) {
      this.resetApplication()
    }

    this.props.onRun()

    try {
      window._require = this.require.bind(this, fileMap, entry)
      window._requireCache = {}
      window._didRegisterComponent = false

      consoleProxy._rnwp_log = consoleLogRNWP.bind(
        consoleProxy,
        this.sendMessage,
        this.props.id
      )
      consoleProxy.log = consoleLog.bind(
        consoleProxy,
        this.sendMessage,
        this.props.id
      )
      consoleProxy.clear = consoleClear.bind(
        consoleProxy,
        this.sendMessage,
        this.props.id
      )

      if (this.props.prelude.length > 0) {
        eval(this.props.prelude)
      }

      this.evaluate(entry, fileMap[entry])

      // Attempt to register the default export of the entry file
      if (!window._didRegisterComponent) {
        const EntryComponent = window._requireCache[entry]

        if (
          EntryComponent &&
          typeof EntryComponent === 'object' &&
          hasProperty(EntryComponent, 'default')
        ) {
          AppRegistry.registerComponent(APP_NAME, () => EntryComponent.default)
        }
      }

      // If no component was registered, bail out
      if (!window._didRegisterComponent) {
        return
      }

      AppRegistry.runApplication(APP_NAME, {
        rootTag: screenElement,
      })

      // After rendering, add {overflow: hidden} to prevent scrollbars
      if (screenElement.firstElementChild) {
        ;(screenElement.firstElementChild as HTMLElement).style.overflow =
          'hidden'
      }
    } catch (e) {
      const message = this.buildErrorMessage(e)
      this.throwError(message)
      this.props.onError(e)
    }
  }

  resetApplication() {
    const screenElement = this.root.current

    if (screenElement) {
      ReactDOM.unmountComponentAtNode(screenElement)
    }
  }

  evaluate(filename: string, code: string) {
    const wrapped = prefix + code + getSuffix(filename)

    eval(wrapped)
  }

  root = React.createRef<HTMLDivElement>()

  render() {
    const { statusBarHeight, statusBarColor } = this.props

    const showStatusBar = statusBarHeight > 0

    const statusBarStyle: CSSProperties | undefined = showStatusBar
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: statusBarHeight,
          backgroundColor: statusBarColor,
        }
      : undefined

    return (
      <div style={styles.root}>
        <div ref={this.root} id={'app'} style={styles.root} />
        {showStatusBar && <div style={statusBarStyle} />}
      </div>
    )
  }
}
