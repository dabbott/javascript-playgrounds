import { consoleLogRNWP } from '../components/player/ConsoleProxy'
import { Message } from '../types/Messages'
import { workerRequest } from '../utils/WorkerRequest'
import type { IEnvironment } from './IEnvironment'

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

// Ensure we only show logs for the most recent code
let listenerId: number = 0
let listener: ((event: MessageEvent) => void) | undefined

const Environment: IEnvironment = {
  initialize({ id, sharedEnvironment, modules }) {
    window.onmessage = (e: MessageEvent) => {
      if (!e.data || e.data.source !== 'rnwp') return

      const { entry, fileMap } = e.data as {
        entry: string
        fileMap: Record<string, string>
      }

      pythonRequest({
        type: 'run',
        code: fileMap[entry],
        listenerId,
      })

      pythonWorker.then((worker) => {
        if (listener) {
          worker.removeEventListener('message', listener)
        }

        const currentListenerId = listenerId++

        listener = ({ data }: MessageEvent) => {
          if (
            !data ||
            !data.payload ||
            data.payload.listenerId !== currentListenerId
          ) {
            return
          }

          if (data.type === 'log') {
            const { line, col, logs } = data.payload as {
              line: number
              col: number
              logs: string[]
            }

            consoleLogRNWP(
              sendMessage.bind(null, sharedEnvironment),
              id,
              entry, // Not a .py file necessarily
              line,
              col,
              'visible',
              ...logs
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

    return pythonRequest({
      type: 'init',
    }).then((_) => {})
  },
}

export default Environment
