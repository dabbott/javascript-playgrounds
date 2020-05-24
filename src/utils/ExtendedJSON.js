export const undefinedMarker = '__rnwp_undefined__'
export const functionMarker = '__rnwp_function__'

// Parse, preserving values that can't be represented in JSON
export function parse(json) {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'string') {
      if (value.startsWith(undefinedMarker)) {
        return undefined
      } else if (value.startsWith(functionMarker)) {
        return value.slice(functionMarker.length)
      }
    }

    return value
  })
}

// Stringify, preserving values that can't be represented in JSON
export function stringify(js) {
  return JSON.stringify(js, (key, value) => {
    switch (typeof value) {
      case 'undefined':
        return undefinedMarker
      case 'function':
        return functionMarker + value.toString()
      default:
        return value
    }
  })
}
