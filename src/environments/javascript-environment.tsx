import PropTypes from 'prop-types'
import React, { CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import consoleProxy from '../components/player/ConsoleProxy'
import VendorComponents, {
  ExternalModuleDescription,
} from '../components/player/VendorComponents'
import formatError from '../utils/formatError'
import * as path from '../utils/path'
import {
  initializeCommunication,
  sendError,
} from '../utils/playerCommunication'
import { createAppLayout } from '../utils/PlayerUtils'
import { prefixAndApply } from '../utils/Styles'
import type {
  EnvironmentOptions,
  EvaluationContext,
  IEnvironment,
} from './IEnvironment'

export interface BeforeEvaluateOptions {
  host: HTMLDivElement
}

export interface AfterEvaluateOptions {
  context: EvaluationContext
  host: HTMLDivElement
  require: (name: string) => unknown
}

class JavaScriptSandbox {
  environment: JavaScriptEnvironment
  assetRoot: string
  prelude: string
  onError: (codeVersion: number, error: Error) => void

  constructor(
    environment: JavaScriptEnvironment,
    assetRoot: string,
    prelude: string,
    onError: (codeVersion: number, error: Error) => void
  ) {
    this.environment = environment
    this.assetRoot = assetRoot
    this.prelude = prelude
    this.onError = onError
  }

  require = (
    context: EvaluationContext,
    name: string,
    requirerName: string
  ) => {
    const { fileMap, entry, requireCache } = context
    let { environment, assetRoot } = this

    // If name begins with . or ..
    if (name.match(/^\.{1,2}\//)) {
      const lookup = path.join(path.dirname(requirerName), name)

      // Check if we're referencing another tab
      const filename = Object.keys(fileMap).find((file) => {
        return (
          file === lookup ||
          file.slice(0, -path.extname(file).length) === lookup
        )
      })

      if (filename) {
        if (filename === entry) {
          throw new Error(
            `Requiring entry file ${entry} would cause an infinite loop`
          )
        }

        if (!requireCache.hasOwnProperty(filename)) {
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

      if (!requireCache.hasOwnProperty(name)) {
        this.evaluate(name, code, context)
      }

      return requireCache[name]
    } else if (environment.hasModule(name)) {
      return environment.requireModule(name)
    } else {
      throw new Error(`Failed to resolve module ${name}`)
    }
  }

  runApplication = (context: EvaluationContext, host: HTMLDivElement) => {
    const { entry, fileMap, codeVersion } = context
    const { environment, prelude, onError } = this

    environment.beforeEvaluate({ host })

    try {
      if (prelude.length > 0) {
        try {
          const f = new Function(
            // Temporarily exposed, but consider this private
            '__VendorComponents',
            prelude
          )

          f(VendorComponents)
        } catch (e) {
          console.error('Prelude error')
          console.error(e)
          throw e
        }
      }

      this.evaluate(entry, fileMap[entry], context)

      environment.afterEvaluate({
        context,
        host,
        require: (name: string) => this.require(context, name, entry),
      })
    } catch (e) {
      onError(codeVersion, e as Error)
    }
  }

  /**
   * @param moduleName The file or module to evaluate (e.g. "index.js" or "moment")
   * @param code
   * @param context
   */
  evaluate(moduleName: string, code: string, context: EvaluationContext) {
    const f = new Function('exports', 'require', 'module', 'console', code)

    const exports = {}
    const module = { exports }
    const requireModule = (name: string) =>
      this.require(context, name, moduleName)

    f(exports, requireModule, module, consoleProxy)

    context.requireCache[moduleName] = module.exports
  }
}

let sandbox: JavaScriptSandbox

// Make regeneratorRuntime globally available for async/await
window.regeneratorRuntime = require('regenerator-runtime')

export class JavaScriptEnvironment implements IEnvironment {
  /**
   * An arbitrary offset to error message line numbers that gets things to line up
   * with the code editor
   */
  prefixLineCount = 2

  nodeModules: Record<string, unknown> = {}

  initialize({
    id,
    assetRoot,
    prelude,
    sharedEnvironment,
    statusBarColor,
    statusBarHeight,
    styles,
    modules,
    detectedModules,
    registerBundledModules,
  }: EnvironmentOptions) {
    if (registerBundledModules) {
      // Since these are already loaded anyway, there's no real cost to exposing them.
      // Always register them even for pure JS
      this.nodeModules['react'] = React
      this.nodeModules['react-dom'] = ReactDOM
      this.nodeModules['prop-types'] = PropTypes

      Object.assign(window, {
        React,
        ReactDOM,
        PropTypes,
      })
    }

    return this.loadExternalModules({
      modules,
      detectedModules,
      hasModule: registerBundledModules ? this.hasModule : () => false,
    }).then(() => {
      const { appElement, wrapperElement } = createAppLayout(document, styles)

      if (statusBarHeight > 0) {
        const statusBarStyle: CSSProperties = {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: statusBarHeight,
          backgroundColor: statusBarColor,
        }
        const statusBarElement = document.createElement('div')
        prefixAndApply(statusBarStyle, statusBarElement)

        wrapperElement.appendChild(statusBarElement)
      }

      initializeCommunication({
        id,
        consoleProxy,
        prefixLineCount: this.prefixLineCount,
        sharedEnvironment,
        onRunApplication: (context) => {
          sandbox.runApplication(context, appElement)
        },
      })

      sandbox = new JavaScriptSandbox(
        this,
        assetRoot,
        prelude,
        (codeVersion, error) => {
          const message = formatError(error, this.prefixLineCount)
          sendError(id, codeVersion, message)
        }
      )

      return Promise.resolve()
    })
  }

  hasModule = (name: string): boolean => {
    return this.nodeModules.hasOwnProperty(name)
  }

  requireModule = (name: string): unknown => {
    return this.nodeModules.hasOwnProperty(name)
      ? this.nodeModules[name]
      : undefined
  }

  loadExternalModules = ({
    modules,
    detectedModules,
    hasModule,
  }: {
    modules: ExternalModuleDescription[]
    detectedModules: ExternalModuleDescription[]
    hasModule: (name: string) => boolean
  }): Promise<void> => {
    const normalizedModules = modules.filter(({ name }) => !hasModule(name))

    // Only download detected modules that aren't also listed as vendor components
    const detectedModulesToDownload = detectedModules
      .filter(({ name }) => !hasModule(name))
      .filter(({ name }) => !normalizedModules.some((m) => m.name === name))

    return VendorComponents.load([
      ...normalizedModules,
      ...detectedModulesToDownload,
    ])
  }

  beforeEvaluate(options: BeforeEvaluateOptions) {}

  afterEvaluate(options: AfterEvaluateOptions) {}
}

export default new JavaScriptEnvironment()
