const consoleProxy = {id: '0'}

for (let key in window.console) {
  let f = console[key]

  if (typeof f === 'function') {
    consoleProxy[key] = f.bind(console)
  }
}

let consoleMessageIndex = 0

export const consoleLog = (id, ...args) => {
  console.log(...args)
  parent.postMessage(JSON.stringify({
    id: id,
    type: 'console',
    payload: {
      id: `${+new Date()}-${++consoleMessageIndex}`,
      command: 'log',
      data: args,
    },
  }), '*')
}

export default consoleProxy
