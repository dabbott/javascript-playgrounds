import { PublicError } from '../components/workspace/Workspace'
import { LogCommand } from '../types/Messages'
import { getErrorDetails } from '../utils/ErrorMessage'
import { PaneOptions } from '../utils/Panes'
import { Tab } from '../utils/Tab'

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
  babelCode: (filename: string) => ({
    type: types.BABEL_CODE,
    filename,
  }),
  babelError: (filename: string, message: string) => ({
    type: types.BABEL_ERROR,
    filename,
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
  codeVersion: number
  compilerError?: PublicError
  runtimeError?: PublicError
  logs: LogCommand[]
  activeFile: string
  codeCache: Record<string, string>
  playerCache: Record<string, string>
  transpilerCache: Record<string, string>
  fileTabs: Tab[]
  activeFileTab?: Tab
}

export const initialState = ({
  initialTab,
  fileTabs,
}: {
  initialTab: string
  fileTabs: Tab[]
}): State => ({
  codeVersion: 0,
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
  fileTabs,
  activeFileTab: fileTabs.find((tab) => tab.title === initialTab),
})

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case types.COMPILED: {
      return {
        ...state,
        codeVersion: state.codeVersion + 1,
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
      return state.compilerError !== undefined &&
        state.compilerError.filename === action.filename
        ? {
            ...state,
            compilerError: undefined,
          }
        : state
    }
    case types.BABEL_ERROR: {
      return {
        ...state,
        compilerError: {
          filename: action.filename,
          ...getErrorDetails(action.message),
        },
      }
    }
    case types.CODE_CHANGE: {
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
