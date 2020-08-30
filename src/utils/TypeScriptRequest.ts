import type * as ts from 'typescript'
import { workerRequest } from './WorkerRequest'

export type TypeScriptLibsRequest = {
  type: 'libs'
  libs: string[]
  types: string[]
}

export type TypeScriptFileRequest = {
  type: 'file'
  filename: string
  code: string
}

export type TypeScriptQuickInfoRequest = {
  type: 'quickInfo'
  filename: string
  position: number
}

export type TypeScriptRequest =
  | TypeScriptLibsRequest
  | TypeScriptFileRequest
  | TypeScriptQuickInfoRequest

let typeScriptWorker: Promise<Worker> | undefined

function typeScriptRequest(
  payload: TypeScriptQuickInfoRequest
): Promise<ts.QuickInfo>
function typeScriptRequest(payload: TypeScriptLibsRequest): Promise<void>
function typeScriptRequest(payload: TypeScriptFileRequest): Promise<void>
function typeScriptRequest(payload: TypeScriptRequest): Promise<unknown> {
  if (!typeScriptWorker) {
    typeScriptWorker = import('../typescript-worker.js').then((worker) =>
      (worker as any).default()
    )
  }

  return typeScriptWorker.then((worker: Worker) =>
    workerRequest(worker, payload)
  )
}

export default typeScriptRequest
