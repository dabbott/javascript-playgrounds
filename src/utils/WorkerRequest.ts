let requestId = 0
const nextRequestId = () => `${requestId++}`

interface WorkerMessage<T> {
  data: {
    id: string
    payload: T
  }
}

export function workerRequest<Request, Response>(
  worker: Worker,
  payload: Request
): Promise<Response> {
  return new Promise((resolve, reject) => {
    try {
      const id = nextRequestId()

      const handleMessage = ({ data }: WorkerMessage<Response>) => {
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
