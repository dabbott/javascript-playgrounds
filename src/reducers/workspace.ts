import { Tab } from '../utils/Tab'
import { LogCommand, ConsoleCommand } from '../types/Messages'
import { PublicError } from '../components/workspace/Workspace'
import { containsPane, PaneOptions } from '../utils/Panes'
import { isTranspilerId } from '../components/workspace/panes/TranspilerPane'
import { getErrorDetails } from '../utils/ErrorMessage'

export const types = {
  COMPILED: 'COMPILED',
  TRANSPILED: 'TRANSPILED',
  BABEL_CODE: 'BABEL_CODE',
  BABEL_ERROR: 'BABEL_ERROR',
  CODE_CHANGE: 'CODE_CHANGE',
  PLAYER_RUN: 'PLAYER_RUN',
  PLAYER_ERROR: 'PLAYER_ERROR',
  CONSOLE_APPEND: 'CONSOLE_APPEND',
  CONSOLE_CLEAR: 'CONSOLE_CLEAR',
  OPEN_EDITOR_TAB: 'OPEN_EDITOR_TAB',
} as const

export const actionCreators = {
  compiled: (filename: string, code: string) => ({
    type: types.COMPILED,
    filename,
    code,
  }),
  transpiled: (filename: string, code: string) => ({
    type: types.TRANSPILED,
    filename,
    code,
  }),
  babelCode: () => ({
    type: types.BABEL_CODE,
  }),
  babelError: (message: string) => ({
    type: types.BABEL_ERROR,
    message,
  }),
  codeChange: (filename: string, code: string) => ({
    type: types.CODE_CHANGE,
    filename,
    code,
  }),
  playerRun: () => ({
    type: types.PLAYER_RUN,
  }),
  playerError: (message: string) => ({
    type: types.PLAYER_ERROR,
    message,
  }),
  consoleAppend: (command: LogCommand) => ({
    type: types.CONSOLE_APPEND,
    command,
  }),
  consoleClear: () => ({
    type: types.CONSOLE_CLEAR,
  }),
  openEditorTab: (tab: Tab) => ({
    type: types.OPEN_EDITOR_TAB,
    tab,
  }),
}

type ValueOf<T> = T[keyof T]

export type Action = ReturnType<ValueOf<typeof actionCreators>>

export interface State {
  compilerError?: PublicError
  runtimeError?: PublicError
  logs: LogCommand[]
  activeFile: string
  codeCache: Record<string, string>
  playerCache: Record<string, string>
  transpilerCache: Record<string, string>
  transpilerVisible: boolean
  playerVisible: boolean
  fileTabs: Tab[]
  activeFileTab?: Tab
  paneSetIndex: number
}

export const initialState = ({
  initialTab,
  panes,
  fileTabs,
  paneSetIndex,
}: {
  initialTab: string
  panes: PaneOptions[]
  fileTabs: Tab[]
  paneSetIndex: number
}): State => ({
  compilerError: undefined,
  runtimeError: undefined,
  logs: [],
  activeFile: initialTab,
  // The current code files, for propagating to index.tsx
  codeCache: {},
  // Compiled files for the player
  playerCache: {},
  // Compiled files for the transpiler
  transpilerCache: {},
  transpilerVisible: containsPane(panes, 'transpiler'),
  playerVisible: containsPane(panes, 'player'),
  fileTabs,
  activeFileTab: fileTabs.find((tab) => tab.title === initialTab),
  paneSetIndex,
})

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case types.COMPILED: {
      // TODO: Make sure we call runApplication in component
      // TODO: We may need to ref this for perf and use a mutable value
      return {
        ...state,
        playerCache: {
          ...state.playerCache,
          [action.filename]: action.code,
        },
      }
    }
    case types.TRANSPILED: {
      return {
        ...state,
        transpilerCache: {
          ...state.transpilerCache,
          [action.filename]: action.code,
        },
      }
    }
    case types.BABEL_CODE: {
      return state.compilerError !== undefined
        ? {
            ...state,
            compilerError: undefined,
          }
        : state
    }
    case types.BABEL_ERROR: {
      return {
        ...state,
        compilerError: getErrorDetails(action.message),
      }
    }
    case types.CODE_CHANGE: {
      // TODO: Call onChange in index.tsx
      return {
        ...state,
        codeCache: {
          ...state.codeCache,
          [action.filename]: action.code,
        },
      }
    }
    case types.PLAYER_RUN: {
      return state.runtimeError !== undefined
        ? {
            ...state,
            runtimeError: undefined,
          }
        : state
    }
    case types.PLAYER_ERROR: {
      // TODO: Runtime errors should indicate which file they're coming from,
      // and only cause a line highlight on that file.
      return {
        ...state,
        runtimeError: getErrorDetails(action.message),
      }
    }
    case types.CONSOLE_APPEND: {
      return {
        ...state,
        logs: [...state.logs, action.command],
      }
    }
    case types.CONSOLE_CLEAR:
      return state.logs.length > 0
        ? {
            ...state,
            logs: [],
          }
        : state
    case types.OPEN_EDITOR_TAB: {
      return {
        ...state,
        activeFile: action.tab.title,
        activeFileTab: action.tab,
      }
    }
  }
}
