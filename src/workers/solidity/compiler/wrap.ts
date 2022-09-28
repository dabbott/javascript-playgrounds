import { CompilerInput, CompilerOutput } from 'hardhat/types';
import { SolidityCompiler, SolidityCompilerModule } from './types';

/**
 * Wrap the relevant solc API methods so they're easier to use
 *
 * @param solc
 * @returns
 */
export function wrapCompilerModule(
  solc: SolidityCompilerModule,
): SolidityCompiler {
  const version = solc.cwrap('solidity_version', 'string', [])();

  const solidityCompile = solc.cwrap('solidity_compile', 'string', [
    'string',
    'number',
    'number',
  ]);

  return {
    version,
    compile(input: CompilerInput): CompilerOutput {
      return JSON.parse(solidityCompile(JSON.stringify(input)));
    },
  };
}
