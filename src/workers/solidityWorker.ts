import {
  CompilerOutput,
  createCompilerInput,
  getCompiler,
} from './solidity/compiler'
import { downloadDependenciesForSource } from './solidity/resolveImports'

const context: Worker & {
  importScripts: (...urls: string[]) => void // Why isn't this part of the TS lib?

  // Globals passed from host
  __log__: (line: number, col: number, ...args: unknown[]) => void
} = self as any

export type SolidityMessage =
  | {
      type: 'init'
    }
  | {
      type: 'compile'
      code: string
    }

export type SolidityResponse = {} | SolidityCompileResponse
export type SolidityCompileResponse = CompilerOutput

const compiler = getCompiler()

async function handleMessage(
  message: SolidityMessage
): Promise<SolidityResponse> {
  switch (message.type) {
    case 'init': {
      return Promise.resolve({})
    }
    case 'compile': {
      const { code } = message

      const files = await downloadDependenciesForSource(
        fetch,
        'Contract.sol',
        code
      )

      const output = compiler.compile(createCompilerInput(files))

      return Promise.resolve(output)
    }
  }
}

interface PythonMessageEvent extends MessageEvent {
  data: { id: string; payload: SolidityMessage }
}

onmessage = (e: PythonMessageEvent) => {
  const { id, payload } = e.data

  handleMessage(payload).then((message) => {
    context.postMessage({
      id,
      payload: message,
    })
  })
}
