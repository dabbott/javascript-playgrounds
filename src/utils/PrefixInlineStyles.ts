import { prefix as prefixStyle } from 'inline-style-prefixer'
import type { CSSProperties } from 'react'

type Style = CSSProperties & { _prefixed?: boolean }

const prefixMarker = '_prefixed'

// Add a special marker to avoid prefixing multiple times
const addPrefixMarker = (style: CSSProperties): void => {
  Object.defineProperty(style, prefixMarker, {
    enumerable: false,
    value: true,
  })
}

export const prefix = (style: Style) => {
  const prefixedStyle = prefixStyle({ ...style })

  // Display becomes an array - we just shouldn't prefix it
  if (style.display) {
    prefixedStyle.display = style.display
  }

  addPrefixMarker(prefixedStyle)

  return prefixedStyle
}

export const mergeStyles = (...styles: (Style | undefined)[]): Style => {
  const filtered = styles.filter((style) => !!style) as Style[]
  const prefixedStyles = filtered.map((style) =>
    style._prefixed === true ? style : prefix(style)
  )
  const prefixedStyle = Object.assign({}, ...prefixedStyles)

  addPrefixMarker(prefixedStyle)

  return prefixedStyle
}

export const prefixObject = <T extends { [K in string]: Style }>(
  styles: T
): T => {
  const output: any = {}

  for (let key in styles) {
    if (styles.hasOwnProperty(key)) {
      output[key] = prefix(styles[key])
    }
  }

  return output
}

export const prefixAndApply = (
  style: Style,
  node: ElementCSSInlineStyle
): void => {
  const prefixed = prefix(style)

  for (let key in prefixed) {
    node.style[key as any] = (prefixed as any)[key]
  }
}
