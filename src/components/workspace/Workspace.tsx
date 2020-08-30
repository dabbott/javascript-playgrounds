import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react'
import type * as ts from 'typescript'
import type { WorkspaceDiff } from '../../index'
import * as workspace from '../../reducers/workspace'
import { ConsoleCommand, LogCommand } from '../../types/Messages'
import babelRequest, { BabelResponse } from '../../utils/BabelRequest'
import { PaneOptions, containsPane } from '../../utils/Panes'
import { prefixObject, rowStyle } from '../../utils/Styles'
import { Tab } from '../../utils/Tab'
import typeScriptRequest from '../../utils/TypeScriptRequest'
import { Props as EditorProps } from './Editor'
import ConsolePane from './panes/ConsolePane'
import EditorPane from './panes/EditorPane'
import PlayerPane from './panes/PlayerPane'
import StackPane from './panes/StackPane'
import TranspilerPane from './panes/TranspilerPane'
import WorkspacesPane from './panes/WorkspacesPane'
import PlayerFrame from './PlayerFrame'
import useResponsiveBreakpoint from '../../hooks/useResponsiveBreakpoint'
import { options } from '../../utils/CodeMirror'

const {
  reducer,
  actionCreators: {
    compiled,
    transpiled,
    babelCode,
    babelError,
    codeChange,
    openEditorTab,
    playerRun,
    playerError,
    consoleAppend,
    consoleClear,
  },
} = workspace

const findPaneSetIndex = (
  responsivePaneSets: ResponsivePaneSet[],
  windowWidth?: number
): number =>
  windowWidth === undefined
    ? responsivePaneSets.length - 1
    : responsivePaneSets.findIndex((paneSet) => paneSet.maxWidth > windowWidth)

const styles = prefixObject({
  container: rowStyle,
})

export type ResponsivePaneSet = {
  maxWidth: number
  panes: PaneOptions[]
}

export type PublicError = {
  lineNumber?: number
  errorMessage: string
  summary: string
  description: string
}

export interface PlaygroundOptions {
  enabled: boolean
  renderReactElements: boolean
  debounceDuration: number
}

export interface TypeScriptOptions {
  enabled?: false
  libs?: string[]
  types?: string[]
}

export interface Props {
  title: string
  description: string
  files: Record<string, string>
  entry: string
  initialTab: string
  onChange: (files: Record<string, string>) => void
  externalStyles: Record<string, CSSProperties>
  fullscreen: boolean
  sharedEnvironment: boolean
  responsivePaneSets: ResponsivePaneSet[]
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  workspaces: Props[]
  diff: Record<string, WorkspaceDiff>
  activeStepIndex: number
  onChangeActiveStepIndex: (index: number) => void
}

type WorkspacePaneProps = {
  options: PaneOptions

  // Props
  files: Record<string, string>
  externalStyles: Record<string, CSSProperties>
  fullscreen: boolean
  sharedEnvironment: boolean
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  workspaces: Props[]
  diff: Record<string, WorkspaceDiff>
  activeStepIndex: number
  onChangeActiveStepIndex: (index: number) => void

  // State
  compilerError?: PublicError
  runtimeError?: PublicError
  logs: LogCommand[]
  activeFile: string
  transpilerCache: Record<string, string>
  fileTabs: Tab[]
  activeFileTab?: Tab

  // Callbacks
  onCodeChange: EditorProps['onChange']
  onClickTab: (tab: Tab) => void
  onCreatePlayer: (id: string, player: PlayerFrame | null) => void
  onPlayerRun: () => void
  onPlayerError: (message: string) => void
  onPlayerConsole: (payload: ConsoleCommand) => void
  getTypeScriptInfo: EditorProps['getTypeInfo']
  renderPane: (options: PaneOptions, index: number) => ReactNode
}

const WorkspacePane = memo((props: WorkspacePaneProps) => {
  const {
    files,
    externalStyles,
    sharedEnvironment,
    workspaces,
    activeStepIndex,
    onChangeActiveStepIndex,
    fullscreen,
    diff,
    playgroundOptions,
    typescriptOptions,
    logs,
    transpilerCache,
    activeFile,
    compilerError,
    runtimeError,
    activeFileTab,
    fileTabs,
    options,
    onCodeChange,
    onClickTab,
    onCreatePlayer,
    onPlayerRun,
    onPlayerError,
    onPlayerConsole,
    getTypeScriptInfo,
    renderPane,
  } = props

  switch (options.type) {
    case 'editor':
      return (
        <EditorPane
          options={options}
          externalStyles={externalStyles}
          files={files}
          fullscreen={fullscreen}
          activeStepIndex={activeStepIndex}
          diff={diff}
          playgroundOptions={playgroundOptions}
          typescriptOptions={typescriptOptions}
          compilerError={compilerError}
          runtimeError={runtimeError}
          activeFile={activeFile}
          activeFileTab={activeFileTab}
          fileTabs={fileTabs}
          logs={logs}
          onChange={onCodeChange}
          getTypeInfo={getTypeScriptInfo}
          onClickTab={onClickTab}
        />
      )
    case 'transpiler':
      return (
        <TranspilerPane
          options={options}
          externalStyles={externalStyles}
          transpilerCache={transpilerCache}
          activeFile={activeFile}
        />
      )
    case 'player':
      return (
        <PlayerPane
          ref={(player) => {
            onCreatePlayer(options.id, player)
          }}
          options={options}
          externalStyles={externalStyles}
          sharedEnvironment={sharedEnvironment}
          files={files}
          logs={logs}
          onPlayerRun={onPlayerRun}
          onPlayerError={onPlayerError}
          onPlayerConsole={onPlayerConsole}
        />
      )
    case 'workspaces':
      return (
        <WorkspacesPane
          options={options}
          externalStyles={externalStyles}
          workspaces={workspaces}
          activeStepIndex={activeStepIndex}
          onChangeActiveStepIndex={onChangeActiveStepIndex}
        />
      )
    case 'stack':
      return (
        <StackPane
          options={options}
          externalStyles={externalStyles}
          renderPane={renderPane}
        />
      )
    case 'console':
      return (
        <ConsolePane
          options={options}
          externalStyles={externalStyles}
          files={files}
          logs={logs}
        />
      )
    default:
      return <div>{`Unknown pane type: ${options['type']}`}</div>
  }
})

export default function Workspace(props: Props) {
  const {
    files = { ['index.js']: '' },
    entry = 'index.js',
    initialTab = 'index.js',
    onChange = () => {},
    responsivePaneSets = [],
    typescriptOptions = {},
    diff = {},
  } = props

  // Determine which pane set to use based on responsive breakpoint
  const widths = useMemo(() => responsivePaneSets.map((set) => set.maxWidth), [
    responsivePaneSets,
  ])
  const paneSetIndex = useResponsiveBreakpoint(widths)
  const panes = responsivePaneSets[paneSetIndex].panes
  const transpilerVisible = containsPane(panes, 'transpiler')
  const playerVisible = containsPane(panes, 'player')

  const [state, dispatch] = useReducer(
    reducer,
    workspace.initialState({
      fileTabs: Object.keys(files).map((filename, index) => ({
        title: filename,
        changed: diff[filename] ? diff[filename].ranges.length > 0 : false,
        index,
      })),
      initialTab,
    })
  )

  const players = useRef<Record<string, PlayerFrame>>({})

  // Run the app once we've transformed each file at least once
  const runApplication = (compiledFiles: Record<string, string>) => {
    if (Object.keys(files).every((filename) => compiledFiles[filename])) {
      dispatch(consoleClear())
      Object.values(players.current).forEach((player) => {
        player.runApplication(compiledFiles, entry)
      })
    }
  }

  // Re-run when files changes.
  // When breakpoints change, we may be rendering different player panes,
  // so we need to re-run then too.
  useEffect(() => {
    runApplication(state.playerCache)
  }, [paneSetIndex, state.playerCache])

  const onCreatePlayer = useCallback(
    (id: string, player: PlayerFrame | null) => {
      if (player) {
        players.current[id] = player
      } else {
        delete players.current[id]
      }
    },
    []
  )

  const updateStatus = (babelMessage: BabelResponse) => {
    switch (babelMessage.type) {
      case 'code':
        dispatch(babelCode())
        break
      case 'error':
        dispatch(babelError(babelMessage.error.message))
        break
    }
  }

  const compilerRequest = (filename: string, code: string) => {
    babelRequest({
      filename,
      code,
      options: { retainLines: true },
    }).then((response: BabelResponse) => {
      updateStatus(response)

      if (response.type === 'code') {
        dispatch(compiled(response.filename, response.code))
      }
    })
  }

  const transpilerRequest = (filename: string, code: string) => {
    babelRequest({
      filename,
      code,
    }).then((response) => {
      if (response.type === 'code') {
        dispatch(transpiled(response.filename, response.code))
      }
    })
  }

  useEffect(() => {
    if (
      typescriptOptions.enabled &&
      Object.keys(files).filter((file) => file.match(/\.tsx?/)).length === 0
    ) {
      console.warn('TypeScript is enabled but there are no .ts or .tsx files.')
    }

    if (typeof navigator !== 'undefined') {
      // Cache and compile each file
      Object.keys(files).forEach((filename) => {
        const code = files[filename]

        state.codeCache[filename] = code

        if (typescriptOptions.enabled) {
          typeScriptRequest({
            type: 'libs',
            libs: typescriptOptions.libs || [],
            types: typescriptOptions.types || [],
          })

          typeScriptRequest({
            type: 'file',
            filename,
            code,
          })
        }

        if (playerVisible) {
          compilerRequest(filename, code)
        }

        if (transpilerVisible) {
          transpilerRequest(filename, code)
        }
      })
    }
  }, [])

  /* CALLBACKS */

  const onCodeChange = useCallback(
    (code: string) => {
      if (typescriptOptions.enabled) {
        typeScriptRequest({
          type: 'file',
          filename: state.activeFile,
          code,
        })
      }

      if (playerVisible) {
        compilerRequest(state.activeFile, code)
      }

      if (transpilerVisible) {
        transpilerRequest(state.activeFile, code)
      }

      dispatch(codeChange(state.activeFile, code))
    },
    [typescriptOptions, playerVisible, transpilerVisible, state.activeFile]
  )

  useEffect(() => {
    onChange(state.codeCache)
  }, [state.codeCache])

  const onClickTab = useCallback((tab: Tab) => {
    dispatch(openEditorTab(tab))
  }, [])

  const onPlayerRun = useCallback(() => {
    dispatch(playerRun())
  }, [])

  const onPlayerError = useCallback((message: string) => {
    dispatch(playerError(message))
  }, [])

  const onPlayerConsole = useCallback((payload: ConsoleCommand) => {
    // if (consoleOptions.enabled || playgroundOptions.enabled) {
    switch (payload.command) {
      case 'clear':
        dispatch(consoleClear())
        return
      case 'log':
        dispatch(consoleAppend(payload))
        return
    }
    // }
  }, [])

  const getTypeScriptInfo = useCallback(
    (
      prefixedFilename: string,
      index: number,
      done: (info: ts.QuickInfo) => void
    ): void => {
      const [, filename] = prefixedFilename.split(':')

      if (typescriptOptions.enabled) {
        typeScriptRequest({
          type: 'quickInfo',
          filename,
          position: index,
        })
          .then((info?: ts.QuickInfo) => {
            if (info && info.displayParts && info.displayParts.length > 0) {
              done(info)
            }
          })
          .catch((error: unknown) => {
            console.log('Error finding type info', error)
          })
      }
    },
    [typescriptOptions]
  )

  const renderPane = useCallback(
    (options: PaneOptions, index: number) => {
      return (
        <WorkspacePane
          key={index}
          // Props
          files={props.files}
          externalStyles={props.externalStyles}
          fullscreen={props.fullscreen}
          sharedEnvironment={props.sharedEnvironment}
          playgroundOptions={props.playgroundOptions}
          typescriptOptions={props.typescriptOptions}
          workspaces={props.workspaces}
          diff={props.diff}
          activeStepIndex={props.activeStepIndex}
          onChangeActiveStepIndex={props.onChangeActiveStepIndex}
          // State
          compilerError={state.compilerError}
          runtimeError={state.runtimeError}
          logs={state.logs}
          activeFile={state.activeFile}
          transpilerCache={state.transpilerCache}
          fileTabs={state.fileTabs}
          activeFileTab={state.activeFileTab}
          // Callbacks
          options={options}
          onCreatePlayer={onCreatePlayer}
          onCodeChange={onCodeChange}
          onClickTab={onClickTab}
          onPlayerRun={onPlayerRun}
          onPlayerError={onPlayerError}
          onPlayerConsole={onPlayerConsole}
          getTypeScriptInfo={getTypeScriptInfo}
          renderPane={renderPane}
        />
      )
    },
    [
      props.files,
      props.externalStyles,
      props.fullscreen,
      props.sharedEnvironment,
      props.playgroundOptions,
      props.typescriptOptions,
      props.workspaces,
      props.diff,
      props.activeStepIndex,
      props.onChangeActiveStepIndex,
      state.compilerError,
      state.runtimeError,
      state.logs,
      state.activeFile,
      state.transpilerCache,
      state.fileTabs,
      state.activeFileTab,
      onCreatePlayer,
      onCodeChange,
      onClickTab,
      onPlayerRun,
      onPlayerError,
      onPlayerConsole,
      getTypeScriptInfo,
    ]
  )

  return <div style={styles.container}>{panes.map(renderPane)}</div>
}
