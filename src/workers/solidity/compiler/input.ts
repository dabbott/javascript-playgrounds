import { CompilerInput } from 'hardhat/types'
import { entries, fromEntries } from '../../../utils/Object'

export function createCompilerInput(
  files: Record<string, string>
): CompilerInput {
  return {
    language: 'Solidity',
    sources: fromEntries(
      entries(files).map(([name, content]) => [name, { content }])
    ),
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  }
}
