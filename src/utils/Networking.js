// Fetch isn't supported in Safari. Fetch is large. Copy just the relevant bit.

// https://github.com/github/fetch (MIT)
export const get = (url) => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()

    xhr.onload = () => {
      const body = 'response' in xhr ? xhr.response : xhr.responseText

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body, xhr)
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
