import Prefixer from 'inline-style-prefixer'

const prefixer = new Prefixer()

export const prefix = (style) => prefixer.prefix(style)

export const prefixObject = (styles, output = {}) => {
  for (let key in styles) {
    if (styles.hasOwnProperty(key)) {
      output[key] = prefixer.prefix(styles[key])
    }
  }

  return output
}

export const prefixAndApply = (style, node) => {
  const prefixed = prefix(style)

  for (let key in prefixed) {
    node.style[key] = prefixed[key]
  }
}
