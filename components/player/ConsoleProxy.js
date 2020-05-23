import * as LogMarker from '../../utils/LogMarker'

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

function extractLocationInfo(logString) {
  const remainder = logString.slice(LogMarker.symbol.length)
  const match = remainder.match(LogMarker.regExp)

  if (!match) return undefined

  return {
    file: match[1],
    line: match[2],
    column: match[3],
  }
}

export const consoleLog = (id, ...args) => {
  const hasLogMarker =
    typeof args[0] === 'string' && args[0].indexOf(LogMarker.symbol) === 0

  const logs = hasLogMarker ? args.slice(1) : args

  const payload = {
    id: nextMessageId(),
    command: 'log',
    data: logs,
    location: hasLogMarker ? extractLocationInfo(args[0]) : undefined,
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
