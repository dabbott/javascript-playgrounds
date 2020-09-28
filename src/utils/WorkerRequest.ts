let requestId = 0
const nextRequestId = () => `${requestId++}`

interface WorkerRequestMessageEvent<T> extends MessageEvent {
  data: {
    id: string
    payload: T
  }
}

export function workerRequest<Request, T>(
  worker: Worker,
  payload: Request
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const id = nextRequestId()

      const handleMessage = ({ data }: WorkerRequestMessageEvent<T>) => {
        if (data && data.id === id) {
          worker.removeEventListener('message', handleMessage)
          return resolve(data.payload)
        }
      }

      worker.addEventListener('message', handleMessage)
      worker.postMessage({ id, payload })
    } catch (error) {
      return reject(error)
    }
  })
}
