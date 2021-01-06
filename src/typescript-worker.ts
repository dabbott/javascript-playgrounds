import * as ts from 'typescript'
import type {
  TypeScriptErrorResponse,
  TypeScriptRequest,
  TypeScriptResponse,
} from './utils/TypeScriptRequest'
import LanguageServiceHost from './workers/typescript/LanguageServiceHost'

import { system } from './workers/typescript/system'

// Mock the host operating system
;(ts.sys as any) = system

const context: Worker = self as any

type Compiler = {
  host: LanguageServiceHost
  services: ts.LanguageService
}

// We store `compilerReady` as a regular boolean, since in the quickInfo case,
// we want to immediately return (a delayed tooltip is not useful)
let compilerReady = false
let setCompiler: (compiler: Compiler) => void
let compiler = new Promise<Compiler>((resolve) => {
  compilerReady = true
  setCompiler = resolve
})

function compile(
  services: ts.LanguageService,
  fileNames: string[]
): TypeScriptResponse {
  const createdFiles: Record<string, string> = {}

  for (let fileName of fileNames) {
    let output = services.getEmitOutput(fileName)

    const error = getFirstError(fileName)

    if (error) return error

    output.outputFiles.forEach((o) => {
      createdFiles[o.name] = o.text
    })
  }

  return {
    type: 'code',
    files: createdFiles,
  }

  function getFirstError(
    fileName: string
  ): TypeScriptErrorResponse | undefined {
    let allDiagnostics = services
      .getCompilerOptionsDiagnostics()
      .concat(services.getSyntacticDiagnostics(fileName))
      .concat(services.getSemanticDiagnostics(fileName))

    for (let diagnostic of allDiagnostics) {
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      )

      if (diagnostic.file) {
        let { line } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start!
        )

        const formattedMessage = `TypeScript Compiler: ${message} (${line + 1})`

        return {
          type: 'error',
          error: {
            filename: diagnostic.file.fileName,
            message: formattedMessage,
          },
        }
      } else {
        console.log(`TypeScript Compiler: ${message}`)
      }
    }
  }
}

onmessage = function ({ data }) {
  if (!data || !data.id) return

  const { id, payload: command } = data as {
    id: string
    payload: TypeScriptRequest
  }

  switch (command.type) {
    case 'init': {
      const { libs, types, compilerOptions } = command

      const languageServiceHost = new LanguageServiceHost(compilerOptions)

      Promise.all([
        ...libs.map((lib: string) =>
          import(
            '!!raw-loader!../node_modules/typescript/lib/' + lib + '.d.ts'
          ).then((file) => {
            languageServiceHost.addFile(lib + '.d.ts', file.default)
          })
        ),
        ...types.map(({ name, url }: { name: string; url: string }) =>
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
          const languageService = ts.createLanguageService(
            languageServiceHost,
            ts.createDocumentRegistry()
          )

          setCompiler({
            host: languageServiceHost,
            services: languageService,
          })
        })

      return
    }
    case 'file': {
      compiler.then(({ host }) => {
        const { filename, code } = command

        host.addFile(filename, code)
      })
      return
    }
    case 'compile': {
      compiler.then(({ services }) => {
        const response = compile(services, [command.filename])

        context.postMessage({ id, payload: response })
      })
      return
    }
    case 'quickInfo': {
      if (!compilerReady) {
        context.postMessage({ id, payload: undefined })

        return
      }

      compiler.then(({ host, services }) => {
        const { filename, position } = command

        services.getProgram()

        if (!host.fileExists(filename)) {
          console.warn(`Can't get quickInfo, ${filename} doesn't exist yet`)

          context.postMessage({ id, payload: undefined })

          return
        }

        const quickInfo = services.getQuickInfoAtPosition(filename, position)

        context.postMessage({ id, payload: quickInfo })
      })

      return
    }
  }
}

export { LanguageServiceHost }
