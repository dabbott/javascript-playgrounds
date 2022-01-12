import { isValidElement } from 'react'
import ReactDOM from 'react-dom'
import {
  consoleClear,
  consoleLog,
  consoleLogRNWP,
  ConsoleProxy,
} from '../components/player/ConsoleProxy'
import { EvaluationContext } from '../environments/IEnvironment'
import { Message } from '../types/Messages'
import * as ExtendedJSON from './ExtendedJSON'

function post(message: Message) {
  try {
    parent.postMessage(ExtendedJSON.stringify(message), '*')
  } catch {}
}

export function sendMessage(sharedEnvironment: boolean, message: Message) {
  if (sharedEnvironment) {
    enhanceConsoleLogs(message)
    parent.__message(message)
  } else {
    post(message)
  }
}

export function sendError(
  id: string,
  codeVersion: number,
  errorMessage: string
) {
  post({ id, codeVersion, type: 'error', payload: errorMessage })
}

export function createWindowErrorHandler({
  codeVersion,
  id,
  prefixLineCount,
}: {
  codeVersion: number
  id: string
  prefixLineCount: number
}) {
  return (message: Event | string, _?: string, line?: number) => {
    const editorLine = (line || 0) - prefixLineCount
    sendError(id, codeVersion, `${message} (${editorLine})`)
    return true
  }
}

export function bindConsoleLogMethods(options: {
  codeVersion: number
  consoleProxy: ConsoleProxy
  sharedEnvironment: boolean
  id: string
  prefixLineCount: number
}) {
  const { codeVersion, consoleProxy, sharedEnvironment, id } = options

  consoleProxy._rnwp_log = consoleLogRNWP.bind(
    consoleProxy,
    sendMessage.bind(null, sharedEnvironment),
    id,
    codeVersion
  )

  consoleProxy.log = consoleLog.bind(
    consoleProxy,
    sendMessage.bind(null, sharedEnvironment),
    id,
    codeVersion,
    'visible'
  )

  consoleProxy.clear = consoleClear.bind(
    consoleProxy,
    sendMessage.bind(null, sharedEnvironment),
    id,
    codeVersion
  )
}

/**
 * Every time we run the application, we re-bind all the logging and error message
 * handlers with a new `codeVersion`. This ensures that logs aren't stale. We also
 * include the iframe's id to handle the case of multiple preview iframes
 */
export function initializeCommunication({
  id,
  sharedEnvironment,
  prefixLineCount,
  consoleProxy,
  onRunApplication,
}: {
  id: string
  sharedEnvironment: boolean
  prefixLineCount: number
  consoleProxy: ConsoleProxy
  onRunApplication: (context: EvaluationContext) => void
}) {
  window.onmessage = (e: MessageEvent) => {
    if (!e.data || e.data.source !== 'rnwp') return

    const { entry, fileMap, codeVersion } = e.data as {
      entry: string
      fileMap: Record<string, string>
      codeVersion: number
    }

    bindConsoleLogMethods({
      codeVersion,
      consoleProxy,
      sharedEnvironment,
      id,
      prefixLineCount,
    })

    window.onerror = createWindowErrorHandler({
      prefixLineCount,
      id,
      codeVersion,
    })

    onRunApplication({ entry, fileMap, codeVersion, requireCache: {} })
  }
}

/**
 * Enhance console logs to allow React elements to be rendered in the parent frame
 */
export function enhanceConsoleLogs(message: Message) {
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
}
