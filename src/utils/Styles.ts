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
  if (style._prefixed === true) return style

  const prefixedStyle = prefixStyle({ ...style })

  // Display becomes an array - we just shouldn't prefix it
  if (style.display) {
    prefixedStyle.display = style.display
  }

  addPrefixMarker(prefixedStyle)

  return prefixedStyle
}

/**
 * Merge styles.
 *
 * If only a single style is passed, it may be returned directly
 * to avoid allocating another style and potentially hurting memoization in components.
 *
 * @param styles
 */
export const mergeStyles = (...styles: (Style | undefined)[]): Style => {
  // Reuse the original style if possible
  if (styles.length === 1 && styles[0]?._prefixed === true) {
    return styles[0]
  }

  const filtered = styles.filter((style) => !!style) as Style[]
  const prefixedStyles = filtered.map(prefix)
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

export const columnStyle = prefix({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden', // Clip box shadows
  position: 'relative',
})

export const rowStyle = prefix({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden', // Clip box shadows
  position: 'relative',
})
