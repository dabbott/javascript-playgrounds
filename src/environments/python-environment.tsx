import { consoleLogRNWP } from '../components/player/ConsoleProxy'
import { Message } from '../types/Messages'
import { workerRequest } from '../utils/WorkerRequest'
import type {
  EnvironmentOptions,
  EvaluationContext,
  IEnvironment,
} from './IEnvironment'
import type { TransferableImage } from '../workers/pythonWorker'
import hasProperty from '../utils/hasProperty'

function sendMessage(sharedEnvironment: boolean, message: Message) {
  if (sharedEnvironment) {
    parent.__message(message)
  } else {
    try {
      parent.postMessage(JSON.stringify(message), '*')
    } catch {}
  }
}

let pythonWorker: Promise<Worker> = import(
  '../python-worker.js'
).then((worker) => (worker as any).default())

function pythonRequest(payload: unknown): Promise<unknown> {
  return pythonWorker.then((worker) => workerRequest(worker, payload))
}

let requestId: number = 0

// Ensure we only show logs for the most recent code
let listener: ((event: MessageEvent) => void) | undefined

// Buffer any requests so that only a single request is queued up at any time.
// We don't want to run requests if we already have another request to run after,
// since we'd end up discarding the results anyway.
let hasOutstandingRequest = false
let nextRequest: EvaluationContext | undefined

function run(options: EnvironmentOptions, context: EvaluationContext) {
  const { id, sharedEnvironment, modules } = options
  const { entry, fileMap } = context

  const currentRequestId = requestId++

  if (hasOutstandingRequest) {
    nextRequest = context
    return
  } else {
    hasOutstandingRequest = true
  }

  pythonRequest({
    type: 'run',
    code: fileMap[entry],
    requestId: currentRequestId,
  }).then(() => {
    hasOutstandingRequest = false

    if (nextRequest) {
      const request = nextRequest
      nextRequest = undefined
      run(options, request)
    }
  })

  pythonWorker.then((worker) => {
    if (listener) {
      worker.removeEventListener('message', listener)
    }

    listener = ({ data }: MessageEvent) => {
      if (
        !data ||
        !data.payload ||
        data.payload.requestId !== currentRequestId
      ) {
        return
      }

      if (data.type === 'log') {
        const { line, col, logs } = data.payload as {
          line: number
          col: number
          logs: string[]
        }

        const transformedLogs = logs.map((value) =>
          isTransferableImage(value) ? createImageElement(value) : value
        )

        consoleLogRNWP(
          sendMessage.bind(null, sharedEnvironment),
          id,
          entry,
          line,
          col,
          'visible',
          ...transformedLogs
        )
      } else if (data.type === 'error') {
        const { message } = data.payload as {
          message: string
        }

        sendMessage(sharedEnvironment, {
          id,
          type: 'error',
          payload: message,
        })
      }
    }

    worker.addEventListener('message', listener)
  })
}

const Environment: IEnvironment = {
  initialize(options) {
    window.onmessage = (e: MessageEvent) => {
      if (!e.data || e.data.source !== 'rnwp') return

      run(options, e.data as EvaluationContext)
    }

    return pythonRequest({
      type: 'init',
    }).then((_) => {})
  },
}

function isTransferableImage(value: unknown): value is TransferableImage {
  return (
    typeof value === 'object' &&
    value !== null &&
    hasProperty(value, 'marker') &&
    value.marker === '__rnwp_transferable_image__'
  )
}

/**
 * We can't transfer ImageData objects for some reason, so we instead
 * pass the raw data and recreate an ImageData object
 */
function createImageElement(data: TransferableImage) {
  const imageData = new ImageData(data.buffer, data.width, data.height)

  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  const context = canvas.getContext('2d')!
  context.putImageData(imageData, 0, 0)

  const image = new Image()
  image.src = canvas.toDataURL()

  return image
}

export default Environment
