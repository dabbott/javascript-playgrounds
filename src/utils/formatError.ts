export default function formatError(e: Error, prefixLineCount: number): string {
  let message = `${e.name}: ${e.message}`
  let line = null

  // Safari
  if ((e as any).line != null) {
    line = (e as any).line

    // FF
  } else if ((e as any).lineNumber != null) {
    line = (e as any).lineNumber

    // Chrome
  } else if (e.stack) {
    const matched = e.stack.match(/<anonymous>:(\d+)/)
    if (matched) {
      line = parseInt(matched[1])
    }
  }

  if (typeof line === 'number') {
    line -= prefixLineCount
    message = `${message} (${line})`
  }

  return message
}
