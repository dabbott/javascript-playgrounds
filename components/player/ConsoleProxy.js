const consoleProxy = {id: '0'}

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

export const consoleLog = (id, ...args) => {
  console.log(...args)
  parent.postMessage(JSON.stringify({
    id: id,
    type: 'console',
    payload: {
      id: nextMessageId(),
      command: 'log',
      data: args,
    },
  }), '*')
}

export const consoleClear = (id) => {
  console.clear()
  parent.postMessage(JSON.stringify({
    id: id,
    type: 'console',
    payload: {
      id: nextMessageId(),
      command: 'clear',
    },
  }), '*')
}

export default consoleProxy
