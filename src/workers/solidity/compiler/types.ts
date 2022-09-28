import { CompilerInput, CompilerOutput } from 'hardhat/types'

export type { CompilerInput, CompilerOutput }

export interface SolidityCompilerModule {
  cwrap: Function
}

export interface SolidityCompiler {
  version: string
  compile(input: CompilerInput): CompilerOutput
}
