import EventEmitter from 'events'

import WorkerManager from './WorkerManager'

export default class CompilationManager extends EventEmitter {

  cache = []
  workerManager = new WorkerManager()

  mergeFiles = (prev, next) => {
    const nextContains = file =>
      next.find(x => file.filename === x.filename)

    return [
      ...prev.filter(file => !nextContains(file)),
      ...next,
    ]
  }

  compileFiles = async (files = []) => {
    const {workerManager} = this

    const compiled = (
      await Promise.all(
        files.map(workerManager.compile)
      )
    ).map((file, i) => {
      return ({
        ...file,
        originalFilename: files[i].filename
      })
    })

    this.cache = this.mergeFiles(this.cache, compiled)

    const errors = this.cache
      .filter(file => !!file.error)
      .map(file => file.error)

    if (errors.length > 0) {
      this.emit('error', errors)
    } else {
      this.emit('compile', this.cache)
    }

    return compiled
  }

  getFiles = () => this.cache
}
