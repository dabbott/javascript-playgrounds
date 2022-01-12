import {
  MessageCallback,
  ConsoleCommand,
  Message,
  SourceLocation,
  LogVisibility,
} from '../../types/Messages'

export type ConsoleProxy = Console & { _rnwp_log: Console['log'] }

function attachConsoleMethodsToProxy(self: { console: Console }) {
  // I don't think this can fail, but the console object can be strange...
  // If it fails, we won't proxy all the methods (which is likely fine)
  try {
    for (let key in self.console) {
      let f = (self.console as any)[key]

      if (typeof f === 'function') {
        ;(consoleProxy as any)[key] = f.bind(self.console)
      }
    }
  } catch (e) {}
}

const consoleProxy = {} as ConsoleProxy

attachConsoleMethodsToProxy(window)

let consoleMessageIndex = 0

const nextMessageId = () => `${+new Date()}-${++consoleMessageIndex}`

const consoleLogCommon = (
  callback: MessageCallback,
  id: string,
  codeVersion: number,
  location: SourceLocation,
  visibility: LogVisibility,
  ...logs: unknown[]
) => {
  if (visibility !== 'hidden') {
    console.log(...logs)
  }

  const payload: ConsoleCommand = {
    id: nextMessageId(),
    command: 'log',
    data: logs,
    location,
    visibility,
  }

  const message: Message = {
    id: id,
    codeVersion,
    type: 'console',
    payload,
  }

  callback(message)
}

export const consoleLogRNWP = (
  callback: MessageCallback,
  id: string,
  codeVersion: number,
  file: string,
  line: number,
  column: number,
  visibility: 'visible' | 'hidden',
  ...logs: unknown[]
) => {
  const location = { file, line, column }
  return consoleLogCommon(
    callback,
    id,
    codeVersion,
    location,
    visibility,
    ...logs
  )
}

export const consoleLog = (
  callback: MessageCallback,
  id: string,
  codeVersion: number,
  visibility: 'visible' | 'hidden',
  ...args: unknown[]
) => {
  return consoleLogCommon(
    callback,
    id,
    codeVersion,
    { file: '<unknown>', line: 0, column: 0 },
    visibility,
    ...args
  )
}

export const consoleClear = (
  callback: MessageCallback,
  id: string,
  codeVersion: number
) => {
  console.clear()

  const payload: ConsoleCommand = {
    id: nextMessageId(),
    command: 'clear',
  }

  const message: Message = {
    id: id,
    codeVersion,
    type: 'console',
    payload,
  }

  callback(message)
}

export default consoleProxy
