
const base64 = (str) => {
  const encoded = encodeURIComponent(str)

  const escaped = encoded.replace(
    /%([0-9A-F]{2})/g,
    (match, p1) => String.fromCharCode(`0x${p1}`)
  )

  return btoa(escaped)
}

export const toBase64 = (mime, content) => {
  const prefix = `data:${mime};base64,`

  return prefix + base64(content)
}
