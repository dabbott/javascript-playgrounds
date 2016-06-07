const messages = [
  ['Invariant Violation: Element type is invalid', (message) => {
    const ownerName = message.match(/`(.*)`/)
    const byOwner = ownerName ? ` by ${ownerName[0]} ` : ' '
    return {
      summary: `The element rendered${byOwner}is either invalid, or can't run on the web.`,
      description: `Every element must be an instance of a React Class, instantiated either with React.createElement or using a JSX expression like '<MyClass/>'. Additionally, some components aren’t available to the web player, and thus will only run on a real native device or emulator.`
    }
  }]
]

const defaultDescription = `The web player encountered an error. When you fix the error, the web player will automatically re-run your code.`

export const getErrorDetails = (originalMessage) => {
  const firstLine = originalMessage.split('\n')[0]
  const errorLineNumber = firstLine.match(/\((\d+)/)

  const details = {
    lineNumber: errorLineNumber && parseInt(errorLineNumber[1]) - 1,
    summary: firstLine,
    description: defaultDescription,
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
