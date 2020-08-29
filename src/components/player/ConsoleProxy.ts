import {
  MessageCallback,
  ConsoleCommand,
  Message,
  SourceLocation,
} from '../../types/Messages'

const consoleProxy = ({ id: '0' } as unknown) as typeof window.console

// I don't think this can fail, but the console object can be strange...
// If it fails, we won't proxy all the methods (which is likely fine)
try {
  for (let key in window.console) {
    let f = (window.console as any)[key]

    if (typeof f === 'function') {
      (consoleProxy as any)[key] = f.bind(window.console)
    }
  }
} catch (e) {}

let consoleMessageIndex = 0

const nextMessageId = () => `${+new Date()}-${++consoleMessageIndex}`

const consoleLogCommon = (
  callback: MessageCallback,
  id: string,
  location: SourceLocation,
  ...logs: unknown[]
) => {
  console.log(...logs)

  const payload: ConsoleCommand = {
    id: nextMessageId(),
    command: 'log',
    data: logs,
    location,
  }

  const message: Message = {
    id: id,
    type: 'console',
    payload,
  }

  callback(message)
}

export const consoleLogRNWP = (
  callback: MessageCallback,
  id: string,
  file: string,
  line: number,
  column: number,
  ...logs: unknown[]
) => {
  const location = { file, line, column }
  return consoleLogCommon(callback, id, location, ...logs)
}

export const consoleLog = (callback: MessageCallback, id: string, ...args: unknown[]) => {
  return consoleLogCommon(callback, id, { file: '<unknown>', line: 0, column: 0}, ...args)
}

export const consoleClear = (callback: MessageCallback, id: string) => {
  console.clear()

  const payload: ConsoleCommand = {
    id: nextMessageId(),
    command: 'clear',
  }

  const message: Message = {
    id: id,
    type: 'console',
    payload,
  }

  callback(message)
}

export default consoleProxy
