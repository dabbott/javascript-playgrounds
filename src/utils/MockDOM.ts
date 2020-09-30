/**
 * We create a fake DOM for Python, since it runs in a web worker for performance.
 * Fortunately only a small amount of APIs are needed to support figure generation.
 * A different approach (e.g. bridging API calls into the main thread) might work
 * better for complex DOM manipulation.
 */

const context: Worker = self as any

const elements: DOMElement[] = []

// Store this outside the element, so we don't convert to/from python.
// I'm not 100% sure this happens, but it seems like it does under some circumstances,
// e.g. maybe when printing or calling repr
let savedImageData: Record<string, ImageData> = {}

class TokenList {
  add() {}
}

class DOMElement {
  id?: string
  type: string
  children: DOMElement[] = []
  attributes: Record<string, unknown> = {}
  style: Record<string, unknown> = {}
  classList = new TokenList()

  constructor(type: string) {
    this.type = type
  }

  appendChild(child: DOMElement) {
    this.children.push(child)
  }

  setAttribute(key: string, value: unknown) {
    this.attributes[key] = value
  }

  addEventListener() {}
  scrollIntoView() {}
}

class DOMHeadElement extends DOMElement {
  constructor() {
    super('head')
  }

  appendChild(child: DOMElement) {
    super.appendChild(child)

    if (child.type === 'script') {
      try {
        ;(context as any).importScripts((child as any).src)
        ;(child as any).onload()
      } catch (e) {
        ;(child as any).onerror()
      }
    }
  }
}

let contextId = 0

class Context2D {
  _id = `${contextId++}`
  clearRect() {}
  strokeRect() {}
  setLineDash() {}
  putImageData(imageData: ImageData) {
    savedImageData[this._id] = imageData
  }
  getImageData() {
    return savedImageData[this._id]
  }
}

export class DOMCanvasElement extends DOMElement {
  constructor() {
    super('canvas')
  }

  getContext() {
    return this._context
  }

  private _context: Context2D = new Context2D()
}

export const document = {
  head: new DOMHeadElement(),
  createTextNode: (text: string) => text,
  createElement: (type: string) => {
    let element: DOMElement

    switch (type) {
      case 'canvas':
        element = new DOMCanvasElement()
        break
      default:
        element = new DOMElement(type)
    }

    elements.push(element)
    return element
  },
  getElementById: (id: string): DOMElement | undefined => {
    return elements.find((e) => e.id === id)
  },
}

// Make sure unused data is garbage collected
export function reset() {
  elements.length = 0
  savedImageData = {}
}
