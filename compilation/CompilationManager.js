import EventEmitter from 'events'

import WorkerManager from './WorkerManager'

export default class CompilationManager extends EventEmitter {

  cache = {}
  workerManager = new WorkerManager()

  compileFiles = async (files = []) => {
    const {workerManager, cache} = this

    const compiled = await Promise.all(
      files.map(workerManager.compile)
    )

    files.forEach((file, i) => {
      const {filename} = file

      cache[filename] = compiled[i]
    })

    const errors = this.getErrors(cache)

    if (errors.length > 0) {
      this.emit('error', errors)
    } else {
      this.emit('compile', this.getCompiledCodeMap(cache))
    }

    return compiled
  }

  getCompiledFileMap = (compiledFileMap) => {
    return Object
      .values(compiledFileMap)
      .reduce((fileMap, file) => {
        fileMap[file.filename] = file

        return fileMap
      }, {})
  }

  getCompiledCodeMap = (compiledFileMap) => {
    return Object
      .values(compiledFileMap)
      .reduce((fileMap, file) => {
        fileMap[file.filename] = file.code

        return fileMap
      }, {})
  }

  getErrors = (compiledFileMap) => {
    return Object
      .values(compiledFileMap)
      .filter(file => !!file.error)
      .map(file => file.error)
  }

  getFile = (filename) => {
    const {cache} = this

    return cache[filename]
  }
}
