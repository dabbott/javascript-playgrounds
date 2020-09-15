import React, { createRef, CSSProperties, PureComponent } from 'react'
import type { IEnvironment } from '../../environments/IEnvironment'
import { Message } from '../../types/Messages'
import formatError from '../../utils/formatError'
import { initializeCommunication } from '../../utils/playerCommunication'
import { prefix } from '../../utils/Styles'
import consoleProxy from './ConsoleProxy'
import VendorComponents from './VendorComponents'
import type { PlayerStyles } from '../../player'

declare global {
  interface Window {
    regeneratorRuntime: unknown
    __message: (message: Message) => void
  }
}

export type EvaluationContext = {
  fileMap: Record<string, string>
  entry: string
  requireCache: Record<string, unknown>
}

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

interface Props {
  id: string
  assetRoot: string
  prelude: string
  statusBarHeight: number
  statusBarColor: string
  sharedEnvironment: boolean
  styles: PlayerStyles
  onRun: () => {}
  onError: (error: Error) => {}
  environment: IEnvironment
}

/**
 * An arbitrary offset to error message line numbers that gets things to line up
 * with the code editor
 */
const prefixLineCount = 2

export default class Sandbox extends PureComponent<Props> {
  static defaultProps = {
    assetRoot: '',
    styles: {},
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

  require = (context: EvaluationContext, name: string) => {
    const { fileMap, entry, requireCache } = context
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

        if (requireCache.hasOwnProperty(filename)) {
          this.evaluate(filename, fileMap[filename], context)
        }

        return requireCache[filename]
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

      if (requireCache.hasOwnProperty(name)) {
        this.evaluate(name, code, context)
      }

      return requireCache[name]
    } else {
      console.error(`Failed to resolve module ${name}`)
      return {}
    }
  }

  runApplication = (context: EvaluationContext) => {
    const { entry, fileMap } = context
    const { environment, prelude, onError, onRun } = this.props

    const host = this.root.current

    if (!host) return

    environment.beforeEvaluate && environment.beforeEvaluate({ host })

    onRun()

    try {
      if (prelude.length > 0) {
        eval(prelude)
      }

      this.evaluate(entry, fileMap[entry], context)

      environment.afterEvaluate && environment.afterEvaluate({ context, host })
    } catch (e) {
      const message = formatError(e, prefixLineCount)
      this.sendError(message)
      onError(e)
    }
  }

  /**
   * @param moduleName The file or module to evaluate (e.g. "index.js" or "moment")
   * @param code
   * @param fileMap
   * @param entry
   */
  evaluate(moduleName: string, code: string, context: EvaluationContext) {
    const f = new Function(
      'exports',
      'require',
      'module',
      'console',
      '_VendorComponents', // Temporarily exposed, but consider this private
      code
    )

    const exports = {}
    const module = { exports }
    const requireModule = (name: string) => this.require(context, name)

    f(exports, requireModule, module, consoleProxy, VendorComponents)

    context.requireCache[moduleName] = module.exports
  }

  root = createRef<HTMLDivElement>()

  render() {
    const { statusBarHeight, statusBarColor, styles } = this.props

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
      <div style={prefix(styles.playerWrapper)}>
        <div ref={this.root} id={'app'} style={styles.playerApp} />
        {showStatusBar && <div style={statusBarStyle} />}
      </div>
    )
  }
}
