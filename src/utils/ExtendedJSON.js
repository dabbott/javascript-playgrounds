import React from 'react'
import ReactDOM from 'react-dom'

import * as DOMCoding from './DOMCoding'

export const undefinedMarker = '__rnwp_undefined__'
export const functionMarker = '__rnwp_function__'
export const domNodeMarker = '__rnwp_dom_node__'

// Parse, preserving values that can't be represented in JSON
export function parse(json) {
  return JSON.parse(json, (key, value) => {
    if (typeof value === 'string') {
      if (value.startsWith(undefinedMarker)) {
        return undefined
      } else if (value.startsWith(functionMarker)) {
        return value.slice(functionMarker.length)
      } else if (value.startsWith(domNodeMarker)) {
        return DOMCoding.toDOM(JSON.parse(value.slice(domNodeMarker.length)))
      }
    }

    return value
  })
}

// Stringify, preserving values that can't be represented in JSON
export function stringify(js) {
  return JSON.stringify(js, (key, value) => {
    if (value instanceof HTMLElement) {
      return domNodeMarker + JSON.stringify(DOMCoding.toJSON(value))
    }

    if (React.isValidElement(value)) {
      const host = document.createElement('span')
      ReactDOM.render(value, host)
      return domNodeMarker + JSON.stringify(DOMCoding.toJSON(host))
    }

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
