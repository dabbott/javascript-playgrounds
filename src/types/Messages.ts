export type SourceLocation = {
  file: string
  line: number
  column: number
}

type CommandBase = {
  id: string
}

export type ClearCommand = CommandBase & {
  command: 'clear'
}

export type LogVisibility = 'visible' | 'hidden'

export type LogCommand = CommandBase & {
  command: 'log'
  location: SourceLocation
  data: unknown[]
  visibility: LogVisibility
}

export type ConsoleCommand = ClearCommand | LogCommand

type MessageBase = {
  id: string
  codeVersion: number
}

export type ConsoleMessage = MessageBase & {
  type: 'console'
  payload: ConsoleCommand
}

export type ReadyMessage = MessageBase & {
  type: 'ready'
}

export type ErrorMessage = MessageBase & {
  type: 'error'
  payload: string
}

export type Message = ConsoleMessage | ReadyMessage | ErrorMessage

export type MessageCallback = (message: Message) => void
