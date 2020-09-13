import React, {
  PureComponent,
  isValidElement,
  createRef,
  CSSProperties,
} from 'react'
import ReactDOM from 'react-dom'
import { prefixObject } from '../../utils/Styles'
import consoleProxy, {
  consoleClear,
  consoleLog,
  consoleLogRNWP,
} from './ConsoleProxy'
import VendorComponents from './VendorComponents'
import * as ExtendedJSON from '../../utils/ExtendedJSON'
import { Message } from '../../types/Messages'
import type { IEnvironment } from '../../environments/IEnvironment'
import formatError from '../../utils/formatError'
import { initializeCommunication } from '../../utils/playerCommunication'

declare global {
  interface Window {
    PropTypes: unknown
    _VendorComponents: typeof VendorComponents
    _consoleProxy: typeof console
    regeneratorRuntime: unknown
    _requireCache: Record<string, unknown>
    _require: (name: string) => unknown
    __message: (message: Message) => void
  }
}

window._VendorComponents = VendorComponents

window._consoleProxy = consoleProxy

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

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
  environment: IEnvironment
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

  constructor(props: Props) {
    super(props)

    const { sendError, sendReady } = initializeCommunication({
      id: this.props.id,
      sharedEnvironment: this.props.sharedEnvironment,
      prefixLineCount,
      runApplication: this.runApplication,
    })

    this.sendError = sendError
    this.sendReady = sendReady
  }

  sendError: (message: string) => void
  sendReady: () => void

  componentDidMount() {
    this.sendReady()
  }

  require = (fileMap: Record<string, string>, entry: string, name: string) => {
    const { _requireCache } = window
    let { environment, assetRoot } = this.props

    if (environment.hasModule(name)) {
      return environment.requireModule(name)
    }

    // If name begins with . or ..
    if (name.match(/^\.{1,2}\//)) {
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

  runApplication = ({
    fileMap,
    entry,
  }: {
    fileMap: Record<string, string>
    entry: string
  }) => {
    const { environment } = this.props

    const host = this.root.current

    if (!host) return

    environment.beforeEvaluate({ host })

    this.props.onRun()

    try {
      window._require = this.require.bind(this, fileMap, entry)
      window._requireCache = {}

      if (this.props.prelude.length > 0) {
        eval(this.props.prelude)
      }

      this.evaluate(entry, fileMap[entry])

      environment.afterEvaluate({ entry, host })
    } catch (e) {
      const message = formatError(e, prefixLineCount)
      this.sendError(message)
      this.props.onError(e)
    }
  }

  evaluate(filename: string, code: string) {
    const wrapped = prefix + code + getSuffix(filename)

    eval(wrapped)
  }

  root = createRef<HTMLDivElement>()

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
