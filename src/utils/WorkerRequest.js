let requestId = 0

const nextRequestId = () => `${requestId++}`

export function workerRequest(worker, payload) {
  return new Promise((resolve, reject) => {
    try {
      const id = nextRequestId()

      const handleMessage = ({ data }) => {
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
