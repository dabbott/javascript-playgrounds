const babelWorker = new (require('../babel-worker.js') as any)()
import { workerRequest } from './WorkerRequest'

export type BabelRequest = {
  filename: string
  code: string
  options?: { retainLines?: boolean; instrumentExpressionStatements?: boolean }
}

type BabelResponseBase = {
  filename: string
}

export type BabelCodeResponse = BabelResponseBase & {
  type: 'code'
  code: string
}

export type BabelErrorResponse = BabelResponseBase & {
  type: 'error'
  error: {
    message: string
  }
}

export type BabelResponse = BabelCodeResponse | BabelErrorResponse

export default function babelRequest(
  payload: BabelRequest
): Promise<BabelResponse> {
  return workerRequest(babelWorker, payload)
}
