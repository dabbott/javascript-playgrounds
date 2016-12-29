import path from 'path'

export default class Compiler {

  workerCache = {}
  requestMap = {}
  compilationId = 0

  compile = async ({filename, code, options = {}}) => {
    const {requestMap} = this
    const id = this.compilationId++

    const worker = await this.getWorker(filename)

    worker.postMessage({
      id,
      filename,
      code,
      options,
    })

    return new Promise((resolve) => {
      requestMap[id] = output => resolve(output)
    })
  }

  onCompile = ({data}) => {
    const {requestMap} = this

    const output = JSON.parse(data)
    const {id} = output

    requestMap[id](output)
  }

  getWorker = async (filename) => {
    const {workerCache} = this
    let ext = path.extname(filename)

    if (workerCache[ext]) {
      return workerCache[ext]
    }

    let WorkerClass

    switch (ext) {
      case '.coffee':
        WorkerClass = await import('worker-loader?inline!../coffeescript-worker.js')
        break

      default:
        ext = '.js'

        if (workerCache[ext]) {
          return workerCache[ext]
        }

        WorkerClass = await import('worker-loader?inline!../babel-worker.js')
    }

    const worker = new WorkerClass()

    workerCache[ext] = worker

    worker.addEventListener('message', this.onCompile)

    return worker
  }

}
