import { isValidElement } from 'react'
import ReactDOM from 'react-dom'
import { Message } from '../types/Messages'
import * as ExtendedJSON from './ExtendedJSON'
import consoleProxy, {
  consoleClear,
  consoleLog,
  consoleLogRNWP,
} from '../components/player/ConsoleProxy'
import { EvaluationContext } from '../environments/IEnvironment'

export function initializeCommunication({
  id,
  sharedEnvironment,
  prefixLineCount,
  onRunApplication,
}: {
  id: string
  sharedEnvironment: boolean
  prefixLineCount: number
  onRunApplication: (context: EvaluationContext) => void
}) {
  function post(message: Message) {
    try {
      parent.postMessage(ExtendedJSON.stringify(message), '*')
    } catch {}
  }

  function sendError(codeVersion: number, errorMessage: string) {
    post({ id, codeVersion, type: 'error', payload: errorMessage })
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

    const { entry, fileMap, codeVersion } = e.data as {
      entry: string
      fileMap: Record<string, string>
      codeVersion: number
    }

    consoleProxy._rnwp_log = consoleLogRNWP.bind(
      consoleProxy,
      sendMessage,
      id,
      codeVersion
    )
    consoleProxy.log = consoleLog.bind(
      consoleProxy,
      sendMessage,
      id,
      codeVersion,
      'visible'
    )
    consoleProxy.clear = consoleClear.bind(
      consoleProxy,
      sendMessage,
      id,
      codeVersion
    )
    window.onerror = (message: Event | string, _?: string, line?: number) => {
      const editorLine = (line || 0) - prefixLineCount
      sendError(codeVersion, `${message} (${editorLine})`)
      return true
    }

    onRunApplication({ entry, fileMap, codeVersion, requireCache: {} })
  }

  return {
    sendError,
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
