// http://stackoverflow.com/a/979995
// Modified to use hash
export const getHashString = () => {
  var params = {}
  var hash = window.location.hash.substring(1)

  if (hash.length === 0) {
    return params
  }

  var vars = hash.split("&")

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=")
    // If first entry with this name
    if (typeof params[pair[0]] === "undefined") {
      params[pair[0]] = decodeURIComponent(pair[1])
    // If second entry with this name
    } else if (typeof params[pair[0]] === "string") {
      var arr = [params[pair[0]], decodeURIComponent(pair[1])]
      params[pair[0]] = arr
    // If third or later entry with this name
    } else {
      params[pair[0]].push(decodeURIComponent(pair[1]))
    }
  }

  return params
}

const buildHashString = (pairs = {}) => {
  const hs = []
  for (let key in pairs) {
    hs.push(`${key}=${encodeURIComponent(pairs[key])}`)
  }
  return '#' + hs.join('&')
}

export const setHashString = (fileMap) => {
  const multiFile = Object.keys(fileMap).length > 1
  const code = fileMap['index.js']

  const options = {
    ...getHashString(),
    code,
  }

  // If there's no code in the editor, delete the code param
  if (!code) {
    delete options.code
  }

  // If we have multiple files, use the `files` param instead of `code`
  if (multiFile) {
    delete options.code

    const files = Object.keys(fileMap).map(filename => [filename, fileMap[filename]])
    options.files = JSON.stringify(files)
  }

  try {
    history.replaceState({}, "", `${buildHashString(options)}`)
  } catch (e) {
    // Browser doesn't support pushState
  }
}
