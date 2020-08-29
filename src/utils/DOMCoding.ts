// https://gist.github.com/sstur/7379870#file-dom-to-json-js

type NodeObject = {
  nodeType: number
  tagName?: string
  nodeName?: string
  nodeValue?: string
  attributes?: [string, unknown][]
  childNodes?: unknown[]
}

let propFix: Record<string, string> = { for: 'htmlFor', class: 'className' }

/**
 * Serialize a DOM element as JSON
 */
export function toJSON(node: HTMLElement) {
  let specialGetters = {
    style: (node: HTMLElement) => node.style.cssText,
  }
  let attrDefaultValues: Record<string, unknown> = { style: '' }
  let obj: NodeObject = {
    nodeType: node.nodeType,
  }
  if (node.tagName) {
    obj.tagName = node.tagName.toLowerCase()
  } else if (node.nodeName) {
    obj.nodeName = node.nodeName
  }
  if (node.nodeValue) {
    obj.nodeValue = node.nodeValue
  }
  let attrs = node.attributes
  if (attrs) {
    let defaultValues = new Map<string, unknown>()
    for (let i = 0; i < attrs.length; i++) {
      let name = attrs[i].nodeName
      defaultValues.set(name, attrDefaultValues[name])
    }
    // Add some special cases that might not be included by enumerating
    // attributes above. Note: this list is probably not exhaustive.
    switch (obj.tagName) {
      case 'input': {
        if (
          (node as any).type === 'checkbox' ||
          (node as any).type === 'radio'
        ) {
          defaultValues.set('checked', false)
        } else if ((node as any).type !== 'file') {
          // Don't store the value for a file input.
          defaultValues.set('value', '')
        }
        break
      }
      case 'option': {
        defaultValues.set('selected', false)
        break
      }
      case 'textarea': {
        defaultValues.set('value', '')
        break
      }
    }
    let arr: [string, unknown][] = []
    for (let [name, defaultValue] of defaultValues) {
      let propName = propFix[name] || name
      let specialGetter = (specialGetters as any)[propName]
      let value = specialGetter ? specialGetter(node) : (node as any)[propName]
      if (value !== defaultValue) {
        arr.push([name, value])
      }
    }
    if (arr.length) {
      obj.attributes = arr
    }
  }
  let childNodes = node.childNodes
  // Don't process children for a textarea since we used `value` above.
  if (obj.tagName !== 'textarea' && childNodes && childNodes.length) {
    let arr: unknown[] = (obj.childNodes = [])
    for (let i = 0; i < childNodes.length; i++) {
      arr[i] = toJSON(childNodes[i] as any)
    }
  }
  return obj
}

/**
 * Deserialize a DOM element
 */
export function toDOM(
  input: any
): HTMLElement | Text | Comment | DocumentFragment {
  let obj: NodeObject = typeof input === 'string' ? JSON.parse(input) : input
  let node
  let nodeType = obj.nodeType
  switch (nodeType) {
    // ELEMENT_NODE
    case 1: {
      node = document.createElement(obj.tagName!)
      if (obj.attributes) {
        for (let [attrName, value] of obj.attributes) {
          let propName = propFix[attrName] || attrName
          // Note: this will throw if setting the value of an input[type=file]
          ;(node as any)[propName] = value
        }
      }
      break
    }
    // TEXT_NODE
    case 3: {
      return document.createTextNode(obj.nodeValue!)
    }
    // COMMENT_NODE
    case 8: {
      return document.createComment(obj.nodeValue!)
    }
    // DOCUMENT_FRAGMENT_NODE
    case 11: {
      node = document.createDocumentFragment()
      break
    }
    default: {
      // Default to an empty fragment node.
      return document.createDocumentFragment()
    }
  }
  if (obj.childNodes && obj.childNodes.length) {
    for (let childNode of obj.childNodes) {
      node.appendChild(toDOM(childNode))
    }
  }
  return node
}
