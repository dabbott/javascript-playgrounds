import type * as ts from 'typescript'
import { workerRequest } from './WorkerRequest'

export type TypeScriptInitRequest = {
  type: 'init'
  libs: string[]
  types: { name: string; url: string }[]
  compilerOptions: ts.CompilerOptions
}

export type TypeScriptFileRequest = {
  type: 'files'
  files: Record<string, string>
}

export type TypeScriptQuickInfoRequest = {
  type: 'quickInfo'
  filename: string
  position: number
}

export type TypeScriptCompileRequest = {
  type: 'compile'
  filename: string
}

export type TypeScriptRequest =
  | TypeScriptInitRequest
  | TypeScriptFileRequest
  | TypeScriptQuickInfoRequest
  | TypeScriptCompileRequest

export type TypeScriptCodeResponse = {
  type: 'code'
  files: Record<string, string>
}

export type TypeScriptErrorResponse = {
  type: 'error'
  error: {
    filename: string
    message: string
  }
}

export type TypeScriptResponse =
  | TypeScriptCodeResponse
  | TypeScriptErrorResponse

let typeScriptWorker: Promise<Worker> | undefined

function typeScriptRequest(
  payload: TypeScriptQuickInfoRequest
): Promise<ts.QuickInfo>
function typeScriptRequest(payload: TypeScriptInitRequest): Promise<void>
function typeScriptRequest(payload: TypeScriptFileRequest): Promise<void>
function typeScriptRequest(
  payload: TypeScriptCompileRequest
): Promise<TypeScriptResponse>
function typeScriptRequest(payload: TypeScriptRequest): Promise<unknown> {
  if (!typeScriptWorker) {
    typeScriptWorker = import('../typescript-worker').then((worker) =>
      (worker as any).default()
    )
  }

  return typeScriptWorker.then((worker: Worker) =>
    workerRequest(worker, payload)
  )
}

export default typeScriptRequest
