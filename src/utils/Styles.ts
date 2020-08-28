export const appendCSS = (css) => {
  const textNode = document.createTextNode(css)
  const element = document.createElement('style')
  element.type = 'text/css'
  element.appendChild(textNode)
  document.head.appendChild(element)
}
