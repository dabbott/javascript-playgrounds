const messages = [
  ['Invariant Violation: Element type is invalid', (message) => {
    const ownerName = message.match(/`(.*)`/)
    const byOwner = ownerName ? ` by ${ownerName[0]} ` : ' '
    return {
      summary: `The element rendered${byOwner}is either invalid, or can't run on the web.`,
      description: 'More info',
    }
  }]
]

export const getErrorDetails = (originalMessage) => {
  const firstLine = originalMessage.split('\n')[0]
  const errorLineNumber = firstLine.match(/\((\d+)/)

  const details = {
    lineNumber: errorLineNumber && parseInt(errorLineNumber[1]) - 1,
    summary: firstLine,
  }

  for (let i = 0; i < messages.length; i++) {
    const [predicate, enhancer] = messages[i]
    if (originalMessage.match(predicate)) {
      return {
        ...details,
        ...enhancer(originalMessage),
      }
    }
  }

  return details
}
