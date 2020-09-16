import { isValidElement } from 'react'
import ReactDOM from 'react-dom'
import { Message } from '../types/Messages'
import * as ExtendedJSON from './ExtendedJSON'
import consoleProxy, {
  consoleClear,
  consoleLog,
  consoleLogRNWP,
} from '../components/player/ConsoleProxy'
import type { EvaluationContext } from '../components/player/Sandbox'

export function initializeCommunication({
  id,
  sharedEnvironment,
  prefixLineCount,
  runApplication,
}: {
  id: string
  sharedEnvironment: boolean
  prefixLineCount: number
  runApplication: (context: EvaluationContext) => void
}) {
  function post(message: Message) {
    parent.postMessage(ExtendedJSON.stringify(message), '*')
  }

  function sendError(errorMessage: string) {
    post({ id, type: 'error', payload: errorMessage })
  }

  function sendReady() {
    post({ id, type: 'ready' })
  }

  function sendMessage(message: Message) {
    if (sharedEnvironment) {
      enhanceConsoleLogs(message)
      parent.__message(message)
    } else {
      post(message)
    }
  }

  window.onmessage = (e: MessageEvent) => {
    if (!e.data || e.data.source !== 'rnwp') return

    const { entry, fileMap } = e.data as {
      entry: string
      fileMap: Record<string, string>
    }

    runApplication({ entry, fileMap, requireCache: {} })
  }

  window.onerror = (message: Event | string, _?: string, line?: number) => {
    const editorLine = (line || 0) - prefixLineCount
    sendError(`${message} (${editorLine})`)
    return true
  }

  consoleProxy._rnwp_log = consoleLogRNWP.bind(consoleProxy, sendMessage, id)
  consoleProxy.log = consoleLog.bind(consoleProxy, sendMessage, id)
  consoleProxy.clear = consoleClear.bind(consoleProxy, sendMessage, id)

  return {
    sendError,
    sendReady,
  }
}

/**
 * Enhance console logs to allow React elements to be rendered in the parent frame
 */
function enhanceConsoleLogs(message: Message) {
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
