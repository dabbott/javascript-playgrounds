import * as ts from 'typescript'

/**
 * @class
 * @implements {ts.LanguageServiceHost}
 */
export class LanguageServiceHost {
  constructor() {
    this.files = {}
  }

  fileExists(fileName) {
    return fileName in this.files
  }

  addFile(fileName, text, version) {
    version = version
      ? version
      : this.files[fileName]
      ? String(Number(this.files[fileName].version) + 1)
      : '1'

    this.files[fileName] = { text, version }
  }

  reset() {
    this.files = {}
  }

  // Implementation of ts.LanguageServiceHost

  /**
   * @returns {ts.CompilerOptions}
   */
  getCompilationSettings() {
    return {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictPropertyInitialization: true,
      strictBindCallApply: true,
      noImplicitThis: true,
      alwaysStrict: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    }
  }

  getScriptFileNames() {
    return Object.keys(this.files)
  }

  getScriptVersion(fileName) {
    return this.files[fileName].version
  }

  getScriptSnapshot(fileName) {
    return ts.ScriptSnapshot.fromString(this.files[fileName].text)
  }

  getCurrentDirectory() {
    return '/'
  }

  getDefaultLibFileName(options) {
    return ts.getDefaultLibFileName(options)
  }
}

const languageServiceHost = new LanguageServiceHost()
const languageService = ts.createLanguageService(languageServiceHost)

const program = languageService.getProgram()
program.getSourceFile = (fileName) => {
  return ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.ES2015,
    undefined,
    ts.ScriptKind.TSX
  )
}

let ready = false

onmessage = function ({ data }) {
  if (!data || !data.id) return

  const { id, payload: command } = data

  switch (command.type) {
    case 'libs': {
      const { libs, types } = command

      Promise.all([
        ...libs.map((lib) =>
          import(
            '!!raw-loader!../node_modules/typescript/lib/lib.' + lib + '.d.ts'
          ).then((file) => {
            languageServiceHost.addFile('lib.' + lib + '.d.ts', file.default)
          })
        ),
        ...types.map(({ name, url }) =>
          fetch(url)
            .then((data) => data.text())
            .then((code) => {
              languageServiceHost.addFile(name, code)
            })
        ),
      ])
        .catch((error) => {
          console.warn(error)
          console.warn('Failed to load TypeScript type definitions')
        })
        .then(() => {
          ready = true
        })

      return
    }
    case 'file': {
      const { filename, code } = command

      languageServiceHost.addFile(filename, code)

      return
    }
    case 'quickInfo': {
      if (!ready) {
        postMessage({ id, payload: undefined })

        return
      }

      const { filename, position } = command

      languageService.getProgram()

      if (!languageServiceHost.fileExists(filename)) {
        console.warn(`Can't get quickInfo, ${filename} doesn't exist yet`)

        postMessage({ id, payload: undefined })

        return
      }

      const quickInfo = languageService.getQuickInfoAtPosition(
        filename,
        position
      )

      postMessage({ id, payload: quickInfo })

      return
    }
  }
}
