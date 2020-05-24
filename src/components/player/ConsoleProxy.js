import * as ExtendedJSON from '../../utils/ExtendedJSON'

const consoleProxy = { id: '0' }

// Don't think this can fail, but the console object can be strange...
// If it fails, we won't proxy all the methods (which is likely fine)
try {
  for (let key in window.console) {
    let f = console[key]

    if (typeof f === 'function') {
      consoleProxy[key] = f.bind(console)
    }
  }
} catch (e) {}

let consoleMessageIndex = 0

const nextMessageId = () => `${+new Date()}-${++consoleMessageIndex}`

const consoleLogCommon = (id, location, ...logs) => {
  console.log(...logs)

  const payload = {
    id: nextMessageId(),
    command: 'log',
    data: logs,
    location,
  }

  parent.postMessage(
    ExtendedJSON.stringify({
      id: id,
      type: 'console',
      payload,
    }),
    '*'
  )
}

export const consoleLogRNWP = (id, file, line, column, ...logs) => {
  const location = { file, line, column }
  return consoleLogCommon(id, location, ...logs)
}

export const consoleLog = (id, ...args) => {
  return consoleLogCommon(id, undefined, ...logs)
}

export const consoleClear = (id) => {
  console.clear()

  const payload = {
    id: nextMessageId(),
    command: 'clear',
  }

  parent.postMessage(
    JSON.stringify({
      id: id,
      type: 'console',
      payload,
    }),
    '*'
  )
}

export default consoleProxy
