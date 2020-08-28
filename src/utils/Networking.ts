// Fetch isn't supported in older versions Safari.
// Fetch is large. Copy just the relevant bit.

// https://github.com/github/fetch (MIT)
export const get = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response)
      } else {
        reject(xhr)
      }
    }

    xhr.onerror = xhr.ontimeout = () => {
      reject(new TypeError('Network request failed'))
    }

    xhr.open('GET', url, true)

    xhr.send()
  })
}
