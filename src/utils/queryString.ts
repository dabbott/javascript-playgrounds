export type QueryParameters = Record<string, string>

export function decode(string: string) {
  let params: QueryParameters = {}

  if (string.length === 0) return params

  let vars = string.split('&')

  for (let i = 0; i < vars.length; i++) {
    let [key, value] = vars[i].split('=')

    // Duplicate entry
    if (key in params) {
      throw new Error(`Duplicate url parameter: ${key}`)
    }

    params[key] = decodeURIComponent(value)
  }

  return params
}

export function encode(params: Record<string, string | number | boolean>) {
  const vars = []

  for (let key in params) {
    vars.push(`${key}=${encodeURIComponent(params[key])}`)
  }

  return vars.join('&')
}
