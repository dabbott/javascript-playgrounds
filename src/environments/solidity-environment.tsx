import { deploy } from 'contract-testing-library'
import React from 'react'
import { render } from 'react-dom'
import consoleProxy, { ConsoleProxy } from '../components/player/ConsoleProxy'
import {
  bindConsoleLogMethods,
  createWindowErrorHandler,
  initializeCommunication,
} from '../utils/playerCommunication'
import { createAppLayout } from '../utils/PlayerUtils'
import { workerRequest } from '../utils/WorkerRequest'
import {
  SolidityCompileResponse,
  SolidityMessage,
} from '../workers/solidityWorker'
import { EnvironmentOptions, IEnvironment } from './IEnvironment'

function bindIframeCommunication(
  iframe: HTMLIFrameElement,
  { id, codeVersion }: { id: string; codeVersion: number }
) {
  const iframeWindow = iframe.contentWindow! as Window & {
    console: ConsoleProxy
  }

  bindConsoleLogMethods({
    consoleProxy: iframeWindow.console,
    codeVersion,
    id,
    prefixLineCount: 0,
    sharedEnvironment: false,
  })

  iframeWindow.onerror = createWindowErrorHandler({
    codeVersion,
    id,
    prefixLineCount: 0,
  })
}

let solidityWorker: Promise<Worker> = import(
  '../solidity-worker.js'
).then((worker) => (worker as any).default())

function solidityRequest(
  payload: Extract<SolidityMessage, { type: 'init' }>
): Promise<void>
function solidityRequest(
  payload: Extract<SolidityMessage, { type: 'compile' }>
): Promise<SolidityCompileResponse>
function solidityRequest(payload: SolidityMessage): Promise<any> {
  return solidityWorker.then((worker) => workerRequest(worker, payload))
}

export class SolidityEnvironment implements IEnvironment {
  async initialize({
    id,
    sharedEnvironment,
    styles,
  }: EnvironmentOptions): Promise<void> {
    const { appElement } = createAppLayout(document, styles)

    initializeCommunication({
      id,
      prefixLineCount: 0,
      sharedEnvironment,
      consoleProxy,
      onRunApplication: ({ fileMap, entry }) => {
        solidityRequest({
          type: 'compile',
          code: fileMap[entry],
        }).then(async (output) => {
          console.log(output)

          const {
            abi,
            evm: { bytecode },
          } = output.contracts['Contract.sol'].Log

          const contract = await deploy({ abi, bytecode, args: [] })

          const [count1] = await contract.call('entryCount')

          console.log(contract, count1.toString())

          // expect(greeting1Result).toEqual([greeting1]);

          // await contract.call('setGreeting', greeting2);

          // const greeting2Result = await contract.call('greet');

          // expect(greeting2Result).toEqual([greeting2]);

          render(<span>Hello world</span>, appElement)
        })
      },
    })
  }
}

export default new SolidityEnvironment()
