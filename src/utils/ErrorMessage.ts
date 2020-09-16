import { PublicError } from '../components/workspace/Workspace'

type MessageHandler = [
  string,
  (message: string) => { summary: string; description: string }
]

const messages: MessageHandler[] = [
  // IE 10
  [
    `TypeError: Unable to get property 'pos' of undefined or null reference`,
    (message) => {
      return {
        summary: `This playground isn't supported for your web browser.`,
        description: `Please use the latest Google Chrome, Safari, Firefox, or Edge to use this playground.`,
      }
    },
  ],
  [
    `TypeError: inst.render is not a function`,
    (message) => {
      return {
        summary: `Invalid component or undefined render method.`,
        description: `No 'render' method found on the returned component instance: you may have forgotten to define 'render', returned null/false from a stateless component, or tried to render an element whose type is a function that isn't a React component.`,
      }
    },
  ],
  [
    `Invariant Violation: Element type is invalid`,
    (message) => {
      const ownerName = message.match(/`(.*)`/)
      const byOwner = ownerName ? ` by ${ownerName[0]} ` : ' '
      return {
        summary: `The element rendered${byOwner}is either invalid, or can't run on the web.`,
        description: `Every element must be an instance of a React Class, instantiated either with React.createElement or using a JSX expression like '<MyClass />'. Additionally, some components aren’t available to the playground, and thus will only run on a real native device or emulator.`,
      }
    },
  ],
]

const defaultDescription = `The playground encountered an error. When you fix the error, the playground will automatically re-run your code.`

export const getErrorDetails = (originalMessage: string): PublicError => {
  const firstLine = originalMessage.split('\n')[0]
  const errorLineNumber = firstLine.match(/\((\d+)/)

  const details = {
    lineNumber:
      errorLineNumber !== null ? parseInt(errorLineNumber[1]) - 1 : undefined,
    summary: firstLine,
    description: defaultDescription,
    errorMessage: originalMessage,
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
