import { downloadCompiler } from './download'
import { SolidityCompiler } from './types'
import { wrapCompilerModule } from './wrap'

export { createCompilerInput } from './input'
export * from './types'

export function getCompiler(): SolidityCompiler {
  const solc = downloadCompiler()
  return wrapCompilerModule(solc)
}
