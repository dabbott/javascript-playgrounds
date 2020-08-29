export default function hasProperty<O extends object, K extends PropertyKey>(
  obj: O,
  propKey: K
): obj is O & { [key in K]: unknown } {
  return propKey in obj
}
