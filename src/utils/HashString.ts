type URLParameters = Record<string, string>

// http://stackoverflow.com/a/979995
// Modified to use hash
export const getHashString = () => {
  let params: URLParameters = {}
  let hash = window.location.hash.substring(1)

  if (hash.length === 0) return params

  let vars = hash.split('&')

  for (let i = 0; i < vars.length; i++) {
    let [key, value] = vars[i].split('=')
    // If first entry with this name
    if (typeof params[key] === 'undefined') {
      params[key] = decodeURIComponent(value)
      // If second entry with this name
    } else if (typeof params[key] === 'string') {
      throw new Error(`Duplicate url parameter: ${key}`)
    }
  }

  return params
}

const buildHashString = (pairs: URLParameters = {}) => {
  const hs = []
  for (let key in pairs) {
    hs.push(`${key}=${encodeURIComponent(pairs[key])}`)
  }
  return '#' + hs.join('&')
}

export const setHashString = (fileMap: Record<string, string>) => {
  const filenames = Object.keys(fileMap)
  const multiFile = filenames.length > 1
  const code = fileMap[filenames[0]]

  const params: URLParameters = {
    ...getHashString(),
    code,
  }

  // If there's no code in the editor, delete the code param
  if (!code) {
    delete params.code
  }

  // If we have multiple files, use the `files` param instead of `code`
  if (multiFile) {
    delete params.code

    const files = Object.keys(fileMap).map((filename) => [
      filename,
      fileMap[filename],
    ])
    params.files = JSON.stringify(files)
  }

  try {
    history.replaceState({}, '', `${buildHashString(params)}`)
  } catch (e) {
    // Browser doesn't support pushState
  }
}
