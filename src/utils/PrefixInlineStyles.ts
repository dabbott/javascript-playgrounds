import { prefix as prefixStyle } from 'inline-style-prefixer'
import type { CSSProperties } from 'react'

type Style = CSSProperties
type StyleSheet = Record<string, Style>

export const prefix = (style: Style) => {
  const prefixed = prefixStyle({ ...style })

  // Display becomes an array - we just shouldn't prefix it
  if (style.display) {
    prefixed.display = style.display
  }

  return prefixed
}

export const prefixObject = (
  styles: StyleSheet,
  output: StyleSheet = {}
): StyleSheet => {
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
