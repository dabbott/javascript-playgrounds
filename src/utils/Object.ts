export function hasOwnProperty<O extends object, K extends PropertyKey>(
  obj: O,
  key: K
): obj is O & { [key in K]: unknown } {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function isEnumerable(obj: object, key: PropertyKey) {
  return Object.prototype.propertyIsEnumerable.call(obj, key)
}

export function fromEntries<T = any>(
  entries: Iterable<readonly [PropertyKey, T]>
): { [k: string]: T } {
  return [...entries].reduce((obj: Record<PropertyKey, T>, [key, val]) => {
    obj[key as any] = val
    return obj
  }, {})
}

export function entries<T>(
  obj: { [s: string]: T } | ArrayLike<T>
): [string, T][] {
  if (obj == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  const pairs: [string, T][] = []

  for (let key in obj) {
    if (hasOwnProperty(obj, key) && isEnumerable(obj, key)) {
      pairs.push([key, obj[key] as T])
    }
  }

  return pairs
}
