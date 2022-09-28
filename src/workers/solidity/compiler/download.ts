import { SolidityCompilerModule } from './types'

type IWorker = {
  importScripts: (...urls: string[]) => void
}

const URL = 'https://binaries.soliditylang.org/bin/soljson-latest.js'

/**
 * Download and evaluate the compiler script
 *
 * @returns The emscripten-compiled solc API
 */
export function downloadCompiler(): SolidityCompilerModule {
  const self = (globalThis as unknown) as IWorker

  self.importScripts(URL)

  return (self as any).Module
}
