const consoleProxy = {id: '0'}

for (let key in window.console) {
  let f = console[key]

  if (typeof f === 'function') {
    consoleProxy[key] = f.bind(console)
  }
}

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
