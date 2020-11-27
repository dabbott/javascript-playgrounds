export const appendCSS = (document: Document, css: string) => {
  const textNode = document.createTextNode(css)
  const element = document.createElement('style')
  element.type = 'text/css'
  element.appendChild(textNode)
  document.head.appendChild(element)
}
