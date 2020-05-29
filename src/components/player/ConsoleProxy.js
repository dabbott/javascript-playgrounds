const consoleProxy = { id: '0' }

// I don't think this can fail, but the console object can be strange...
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

const consoleLogCommon = (callback, id, location, ...logs) => {
  console.log(...logs)

  const payload = {
    id: nextMessageId(),
    command: 'log',
    data: logs,
    location,
  }

  const message = {
    id: id,
    type: 'console',
    payload,
  }

  callback(message)
}

export const consoleLogRNWP = (callback, id, file, line, column, ...logs) => {
  const location = { file, line, column }
  return consoleLogCommon(callback, id, location, ...logs)
}

export const consoleLog = (callback, id, ...args) => {
  return consoleLogCommon(callback, id, undefined, ...logs)
}

export const consoleClear = (callback, id) => {
  console.clear()

  const payload = {
    id: nextMessageId(),
    command: 'clear',
  }

  const message = {
    id: id,
    type: 'console',
    payload,
  }

  callback(message)
}

export default consoleProxy
