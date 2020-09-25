// Adapted from https://github.com/Automattic/util-inspect
//
// MIT – Copyright (c) 2010-2014 Joyent, Inc.

import hasProperty from './hasProperty'

type StyledSpan = {
  type: 'span'
  value: string
  style: string
}

type PropertySpan = {
  type: 'property'
  key: Span
  value: Span
}

type ListSpan = {
  type: 'list'
  value: Span[]
}

type Span = string | StyledSpan | PropertySpan | ListSpan

type PublicSpan = { value: string; style: string }

function getValue(span: Span): string {
  if (typeof span === 'string') return span

  switch (span.type) {
    case 'property':
      return getValue(span.key) + ': ' + getValue(span.value)
    case 'span':
      return span.value
    case 'list':
      return span.value.map(getValue).join(', ')
  }
}

function mapValue(span: Span, f: (value: string) => string): Span {
  if (typeof span === 'string') return f(span)

  switch (span.type) {
    case 'property':
      return {
        ...span,
        key: mapValue(span.key, f),
        value: mapValue(span.value, f),
      }
    case 'span':
      return {
        ...span,
        value: f(span.value),
      }
    case 'list':
      return {
        ...span,
        value: span.value.map((value) => mapValue(value, f)),
      }
  }
}

function styled(value: string) {
  return { style: '#333', value }
}

function toPublicSpans(span: Span): PublicSpan[] {
  function convert(acc: PublicSpan[], span: Span) {
    if (typeof span === 'string') {
      acc.push(styled(span))
      return
    }

    switch (span.type) {
      case 'property':
        convert(acc, span.key)
        convert(acc, ': ')
        convert(acc, span.value)
        break
      case 'span':
        acc.push(span)
        break
      case 'list':
        span.value.forEach((value) => {
          convert(acc, value)
        })
        break
    }
  }

  const output: PublicSpan[] = []

  convert(output, span)

  return output
}

function normalizeSpans(spans: Span | Span[]): Span[] {
  if (Array.isArray(spans)) return spans
  return [spans]
}

type Options = {
  showHidden?: boolean
  depth?: number
  colors?: boolean
  customInspect?: boolean
  bracketSeparator?: string
  maxLineLength?: number
}

type Context = Required<Options> & {
  seen: unknown[]
  stylize: (value: string, style: string) => Span
}

/**
 * Print a value out in the best way possible for its type.
 *
 * @param {unknown} value The value to print out.
 * @param {Options} options Optional options object that alters the output.
 * @license MIT (© Joyent)
 */
function inspect(value: unknown, options: Options = {}): PublicSpan[] {
  const ctx: Context = {
    seen: [],
    stylize: options.colors ? stylizeWithColor : stylizeNoColor,
    showHidden: options.showHidden ?? false,
    depth: options.depth ?? 2,
    colors: options.colors ?? false,
    customInspect: options.customInspect ?? true,
    bracketSeparator: options.bracketSeparator ?? ' ',
    maxLineLength: options.maxLineLength ?? 60,
  }

  try {
    return toPublicSpans(formatValue(ctx, value, ctx.depth))
  } catch {
    return []
  }
}

namespace inspect {
  export let styles: Record<string, string>
}

export default inspect

inspect.styles = {
  special: 'rgb(59, 108, 212)',
  number: '#c92c2c',
  boolean: '#c92c2c',
  undefined: 'grey',
  null: 'grey',
  string: '#2e9f74',
  date: '#2e9f74',
  // "name": intentionally not styling
  regexp: 'red',
}

function stylizeNoColor(str: string, _styleType: unknown): Span {
  return str
}

function stylizeWithColor(str: string, styleType: string): Span {
  let style = inspect.styles[styleType]

  if (style) {
    return { type: 'span', value: str, style }
  } else {
    return str
  }
}

function isBoolean(arg: unknown): arg is boolean {
  return typeof arg === 'boolean'
}

function isUndefined(arg: unknown): arg is undefined {
  return arg === void 0
}

function isFunction(arg: unknown): arg is Function {
  return typeof arg === 'function'
}

function isString(arg: unknown): arg is string {
  return typeof arg === 'string'
}

function isNumber(arg: unknown): arg is number {
  return typeof arg === 'number'
}

function isNull(arg: unknown): arg is null {
  return arg === null
}

function isRegExp(re: unknown): re is RegExp {
  return isObject(re) && objectToString(re) === '[object RegExp]'
}

function isObject(arg: unknown): arg is object {
  return typeof arg === 'object' && arg !== null
}

function isError(e: unknown): e is Error {
  return (
    isObject(e) &&
    (objectToString(e) === '[object Error]' || e instanceof Error)
  )
}

function isDate(d: unknown): d is Date {
  return isObject(d) && objectToString(d) === '[object Date]'
}

function objectToString(o: unknown): string {
  return Object.prototype.toString.call(o)
}

function arrayToHash(array: any[]) {
  let hash: Record<string, boolean> = {}

  array.forEach((val) => {
    hash[val] = true
  })

  return hash
}

function formatArray(
  ctx: Context,
  value: unknown[],
  recurseTimes: number,
  visibleKeys: Record<string, boolean>,
  keys: string[]
): ListSpan {
  let output: Span[] = []

  for (let i = 0, l = value.length; i < l; ++i) {
    if (hasProperty(value, String(i))) {
      output.push(
        ...normalizeSpans(
          formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true)
        )
      )
    } else {
      output.push('')
    }
  }

  keys.forEach((key) => {
    if (!key.match(/^\d+$/)) {
      output.push(
        ...normalizeSpans(
          formatProperty(ctx, value, recurseTimes, visibleKeys, key, true)
        )
      )
    }
  })

  return { type: 'list', value: output }
}

function formatError(value: Error): string {
  return '[' + Error.prototype.toString.call(value) + ']'
}

function formatValue(
  ctx: Context,
  value: unknown,
  recurseTimes: number | null
): Span {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (
    ctx.customInspect &&
    isObject(value) &&
    hasProperty(value, 'inspect') &&
    isFunction(value.inspect) &&
    // Filter out the util module, it's inspect function is special
    value.inspect !== inspect &&
    // Also filter out any prototype objects using the circular check.
    !(value.constructor && value.constructor.prototype === value)
  ) {
    let ret = value.inspect(recurseTimes, ctx)
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes)
    }
    return ret
  }

  // Primitive types cannot have properties
  let primitive = formatPrimitive(ctx, value)
  if (primitive) {
    return primitive
  }

  // Look up the keys of the object.
  let keys = objectKeys(value)
  let visibleKeys = arrayToHash(keys)

  try {
    if (ctx.showHidden && Object.getOwnPropertyNames) {
      keys = Object.getOwnPropertyNames(value)
    }
  } catch (e) {
    // ignore
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (
    isError(value) &&
    (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)
  ) {
    return formatError(value)
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      let name = value.name ? ': ' + value.name : ''
      return ctx.stylize('[Function' + name + ']', 'special')
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date')
    }
    if (isError(value)) {
      return formatError(value)
    }
  }

  let base = ''
  let array = false
  let braces: [string, string] = ['{', '}']

  // Make Array say that they are Array
  if (Array.isArray(value)) {
    array = true
    braces = ['[', ']']
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    let n = value.name ? ': ' + value.name : ''
    base = '[Function' + n + ']'
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = RegExp.prototype.toString.call(value)
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = Date.prototype.toUTCString.call(value)
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = formatError(value)
  }

  if (keys.length === 0 && (!array || (value as unknown[]).length == 0)) {
    return braces[0] + base + braces[1]
  }

  if (recurseTimes === null || recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp')
    } else {
      return ctx.stylize('[Object]', 'special')
    }
  }

  ctx.seen.push(value)

  let output: Span[]
  if (array) {
    const group = formatArray(
      ctx,
      value as unknown[],
      recurseTimes,
      visibleKeys,
      keys
    )
    output = reduceToSingleString(ctx, group, base, braces)
  } else {
    const list: ListSpan = {
      type: 'list',
      value: flatten(
        keys.map((key) => {
          return normalizeSpans(
            formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
          )
        })
      ),
    }
    output = reduceToSingleString(ctx, list, base, braces)
  }

  ctx.seen.pop()

  return {
    type: 'list',
    value: output,
  }
}

function formatProperty(
  ctx: Context,
  value: unknown,
  recurseTimes: number,
  visibleKeys: Record<string, boolean>,
  key: string,
  array: boolean
): Span | Span[] {
  let name: Span | undefined
  let str: Span | undefined
  let desc: any = { value: void 0 }
  try {
    // ie6 › navigator.toString
    // throws Error: Object doesn't support this property or method
    desc.value = (value as any)[key]
  } catch (e) {
    // ignore
  }
  try {
    // ie10 › Object.getOwnPropertyDescriptor(window.location, 'hash')
    // throws TypeError: Object doesn't support this action
    if (Object.getOwnPropertyDescriptor) {
      desc = Object.getOwnPropertyDescriptor(value, key) || desc
    }
  } catch (e) {
    // ignore
  }
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special')
    } else {
      str = ctx.stylize('[Getter]', 'special')
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special')
    }
  }
  if (!hasProperty(visibleKeys, key)) {
    name = '[' + key + ']'
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null)
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1)
      }
      // Add indentation
      if (getValue(str).indexOf('\n') > -1) {
        str = mapValue(str, (value) => value.replace('\n', '\n  '))
      }
    } else {
      str = ctx.stylize('[Circular]', 'special')
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str
    }
    let keyName = JSON.stringify('' + key)
    if (keyName.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = ctx.stylize(keyName.substr(1, keyName.length - 2), 'name')
    } else {
      name = ctx.stylize(
        keyName
          .replace(/'/g, "\\'")
          .replace(/\\"/g, '"')
          .replace(/(^"|"$)/g, "'"),
        'string'
      )
    }
  }

  return { type: 'property', key: name, value: str }
}

function formatPrimitive(ctx: Context, value: unknown): Span | undefined {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined')
  if (isString(value)) {
    let simple =
      "'" +
      JSON.stringify(value)
        .replace(/^"|"$/g, '')
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"') +
      "'"
    return ctx.stylize(simple, 'string')
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number')
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean')
  if (isNull(value)) return ctx.stylize('null', 'null')
}

function addSeparator<T>(array: T[], separator: T): T[] {
  const output: T[] = []

  array.forEach((item, index) => {
    if (index !== 0) {
      output.push(separator)
    }

    output.push(item)
  })

  return output
}

function reduceToSingleString(
  ctx: Context,
  output: ListSpan,
  base: string,
  braces: [string, string]
): Span[] {
  base = base ? `${base} ` : ''

  const length = output.value.reduce((prev: number, cur: Span) => {
    return prev + getValue(cur).length + 1
  }, 0)

  if (length > ctx.maxLineLength) {
    return [
      base + braces[0] + '\n  ',
      ...addSeparator(output.value, ',\n  '),
      '\n' + braces[1],
    ]
  }

  return [
    base + braces[0] + ctx.bracketSeparator,
    ...addSeparator(output.value, ', '),
    ctx.bracketSeparator + braces[1],
  ]
}

function flatten<T>(arrays: T[][]): T[] {
  const output: T[] = []

  arrays.forEach((array) => {
    output.push(...array)
  })

  return output
}

/**
 * Make sure `Object.keys` work for `undefined`
 * values that are still there, like `document.all`.
 * http://lists.w3.org/Archives/Public/public-html/2009Jun/0546.html
 */
function objectKeys(value: any): string[] {
  try {
    return Object.keys(value)
  } catch {
    return []
  }
}
