import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useReducer,
  useRef,
  useMemo,
  useCallback,
  memo,
  useState,
} from 'react'
import type * as ts from 'typescript'
import * as workspace from '../../reducers/workspace'
import { ConsoleCommand, LogCommand } from '../../types/Messages'
import babelRequest, { BabelResponse } from '../../utils/BabelRequest'
import { PaneOptions, containsPane } from '../../utils/Panes'
import { prefixObject, rowStyle } from '../../utils/Styles'
import { Tab } from '../../utils/Tab'
import typeScriptRequest, {
  TypeScriptCompileRequest,
} from '../../utils/TypeScriptRequest'
import { Props as EditorProps } from './Editor'
import ConsolePane from './panes/ConsolePane'
import EditorPane from './panes/EditorPane'
import PlayerPane from './panes/PlayerPane'
import StackPane from './panes/StackPane'
import TranspilerPane from './panes/TranspilerPane'
import WorkspacesPane from './panes/WorkspacesPane'
import PlayerFrame from './PlayerFrame'
import useResponsiveBreakpoint from '../../hooks/useResponsiveBreakpoint'
import {
  WorkspaceStep,
  UserInterfaceStrings,
  CompilerOptions,
  TypeScriptOptions,
} from '../../utils/options'
import { WorkspaceDiff } from './App'
import useRerenderEffect from '../../hooks/useRerenderEffect'
import type { ExternalModule } from '../player/VendorComponents'
import { basename, extname } from '../../utils/path'
import { useOptions } from '../../contexts/OptionsContext'

const {
  reducer,
  actionCreators: {
    compiled,
    transpiled,
    compilerSuccess,
    compilerError,
    codeChange,
    openEditorTab,
    playerRun,
    playerError,
    consoleAppend,
    consoleClear,
  },
} = workspace

const styles = prefixObject({
  container: rowStyle,
})

export type ResponsivePaneSet = {
  maxWidth: number
  panes: PaneOptions[]
}

export type PublicError = {
  lineNumber?: number
  filename?: string
  errorMessage: string
  summary: string
  description: string
}

export interface PlaygroundOptions {
  enabled: boolean
  inspector: 'browser' | 'node'
  renderReactElements: boolean
  debounceDuration: number
  instrumentExpressionStatements: boolean
  expandLevel?: number
}

export interface ExternalStyles {
  consolePane?: CSSProperties
  consoleRow?: CSSProperties
  header?: CSSProperties
  headerText?: CSSProperties
  playerHeader?: CSSProperties
  playerHeaderText?: CSSProperties
  playerPane?: CSSProperties
  stackTab?: CSSProperties
  stackTabText?: CSSProperties
  stackTabTextActive?: CSSProperties
  tab?: CSSProperties
  tabText?: CSSProperties
  tabTextActive?: CSSProperties
  tabTextChanged?: CSSProperties
  tooltip?: CSSProperties
  transpilerHeader?: CSSProperties
  transpilerHeaderText?: CSSProperties
  workspacesButtonContainer?: CSSProperties
  workspacesButtonText?: CSSProperties
  workspacesButtonWrapper?: CSSProperties
  workspacesDescription?: CSSProperties
  workspacesDescriptionText?: CSSProperties
  workspacesDivider?: CSSProperties
  workspacesHeader?: CSSProperties
  workspacesHeaderText?: CSSProperties
  workspacesList?: CSSProperties
  workspacesPane?: CSSProperties
  workspacesRow?: CSSProperties
  workspacesRowActive?: CSSProperties
  workspacesRowTitle?: CSSProperties
  workspacesRowTitleActive?: CSSProperties

  // Passed to player
  playerRoot?: CSSProperties
  playerWrapper?: CSSProperties
  playerApp?: CSSProperties
}

export interface Props {
  environmentName: string
  title: string
  files: Record<string, string>
  entry: string
  initialTab: string
  strings: UserInterfaceStrings
  onChange: (files: Record<string, string>) => void
  externalStyles: ExternalStyles
  fullscreen: boolean
  sharedEnvironment: boolean
  responsivePaneSets: ResponsivePaneSet[]
  compilerOptions: CompilerOptions
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  workspaces: WorkspaceStep[]
  diff: Record<string, WorkspaceDiff>
  activeStepIndex: number
  onChangeActiveStepIndex: (index: number) => void
  detectedModules: ExternalModule[]
}

type WorkspacePaneProps = {
  options: PaneOptions

  // Props
  environmentName: string
  ready: boolean
  files: Record<string, string>
  strings: UserInterfaceStrings
  externalStyles: ExternalStyles
  fullscreen: boolean
  sharedEnvironment: boolean
  playgroundOptions: PlaygroundOptions
  typescriptOptions: TypeScriptOptions
  workspaces: WorkspaceStep[]
  detectedModules: ExternalModule[]
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
  onPlayerReady: () => void
  onPlayerReload: () => void
  onPlayerError: (codeVersion: number, message: string) => void
  onPlayerConsole: (codeVersion: number, payload: ConsoleCommand) => void
  getTypeScriptInfo: EditorProps['getTypeInfo']
  renderPane: (options: PaneOptions, index: number) => ReactNode
}

const WorkspacePane = memo(function WorkspacePane (props: WorkspacePaneProps) {
  const {
    environmentName: environmentName,
    ready,
    files,
    strings,
    externalStyles,
    sharedEnvironment,
    workspaces,
    detectedModules,
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
    onPlayerReady,
    onPlayerReload,
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
          ready={ready}
          strings={strings}
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
          playgroundOptions={playgroundOptions}
        />
      )
    case 'player':
      return (
        <PlayerPane
          ref={(player) => {
            onCreatePlayer(options.id, player)
          }}
          detectedModules={detectedModules}
          options={options}
          externalStyles={externalStyles}
          environmentName={environmentName}
          sharedEnvironment={sharedEnvironment}
          files={files}
          logs={logs}
          onPlayerRun={onPlayerRun}
          onPlayerReady={onPlayerReady}
          onPlayerReload={onPlayerReload}
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
  const internalOptions = useOptions()

  // Determine which pane set to use based on responsive breakpoint
  const widths = useMemo(() => responsivePaneSets.map((set) => set.maxWidth), [
    responsivePaneSets,
  ])
  const paneSetIndex = useResponsiveBreakpoint(widths)
  const panes = responsivePaneSets[paneSetIndex].panes
  const transpilerVisible = containsPane(panes, 'transpiler')
  const playerVisible = containsPane(panes, 'player')

  // If we have a player pane, show a loading indicator
  const [ready, setReady] = useState(!playerVisible)

  // If we have an environment that takes a while to load, keep track of whether it's ready separately.
  // Assume JS environments are preloaded for now (TODO: consider using this instead of the 'ready' check
  // in PlayerFrame)
  const isSlowLoadingEnvironment = props.environmentName === 'python'
  const [environmentReady, setEnvironmentReady] = useState(
    !isSlowLoadingEnvironment
  )

  const [state, dispatch] = useReducer(reducer, undefined, () =>
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
  const runApplication = (
    compiledFiles: Record<string, string>,
    codeVersion: number
  ) => {
    if (Object.keys(files).every((filename) => filename in compiledFiles)) {
      if (!ready) {
        setReady(true)
      }
      dispatch(consoleClear())
      Object.values(players.current).forEach((player) => {
        player.runApplication(compiledFiles, entry, codeVersion)
      })
    }
  }

  // Re-run when files changes.
  // When breakpoints change, we may be rendering different player panes,
  // so we need to re-run then too.
  useEffect(() => {
    if (environmentReady) {
      runApplication(state.playerCache, state.codeVersion)
    }
  }, [environmentReady, paneSetIndex, state.playerCache, state.codeVersion])

  const onPlayerReload = useCallback(() => {
    if (environmentReady) {
      setEnvironmentReady(false)
      Object.values(players.current).forEach((player) => {
        player.reload()
      })
    }
  }, [environmentReady, paneSetIndex, state.playerCache, state.codeVersion])

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

  const updateStatus = (filename: string, errorMessage?: string) => {
    if (errorMessage) {
      dispatch(compilerError(filename, errorMessage))
    } else {
      dispatch(compilerSuccess(filename))
    }
  }

  const runBabel = useCallback((filename: string, code: string) => {
    babelRequest({
      filename,
      code,
      options: {
        retainLines: true,
        maxLoopIterations: props.compilerOptions.maxLoopIterations ?? 0,
        instrumentExpressionStatements:
          props.playgroundOptions.instrumentExpressionStatements,
      },
    }).then((response: BabelResponse) => {
      updateStatus(
        filename,
        response.type === 'error' ? response.error.message : undefined
      )

      if (response.type === 'code') {
        dispatch(compiled(response.filename, response.code))
      }
    })
  }, [])

  // We currently ignore the output from tsc, instead transpiling the code
  // again through babel. This is so the console.log/playground code transformations
  // get applied. It could be worth rewriting them directly in tsc at some point.
  const runTsc = useCallback((filename: string, code: string) => {
    typeScriptRequest({
      type: 'compile',
      filename,
    }).then((response) => {
      if (response.type === 'error') {
        updateStatus(filename, response.error.message)
        return
      }

      runBabel(filename, code)
    })
  }, [])

  const compilerRequest = (filename: string, code: string) => {
    switch (props.compilerOptions.type) {
      case 'none':
        dispatch(compiled(filename, code))
        break
      case 'tsc':
        runTsc(filename, code)
        break
      case 'babel':
      default:
        runBabel(filename, code)
    }
  }

  const transpilerRequest = (filename: string, code: string) => {
    babelRequest({
      filename,
      code,
      options: { retainLines: true },
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
      if (typescriptOptions.enabled) {
        typeScriptRequest({
          type: 'init',
          libs: typescriptOptions.libs || [],
          types: typescriptOptions.types || [],
          compilerOptions: typescriptOptions.compilerOptions || {},
        })

        typeScriptRequest({
          type: 'files',
          files,
        })
      }

      // Cache and compile each file
      Object.keys(files).forEach((filename) => {
        const code = files[filename]

        state.codeCache[filename] = code

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
      if (internalOptions.reloadMode === 'hard') {
        onPlayerReload()
      }

      if (typescriptOptions.enabled) {
        typeScriptRequest({
          type: 'files',
          files: { [state.activeFile]: code },
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

  useRerenderEffect(() => {
    onChange(state.codeCache)
  }, [state.codeCache])

  const onClickTab = useCallback((tab: Tab) => {
    dispatch(openEditorTab(tab))
  }, [])

  const onPlayerRun = useCallback(() => {
    dispatch(playerRun())
  }, [])

  const onPlayerReady = useCallback(() => {
    setEnvironmentReady(true)
  }, [environmentReady])

  const onPlayerError = useCallback(
    (codeVersion: number, message: string) => {
      if (codeVersion !== state.codeVersion) return

      dispatch(playerError(message))
    },
    [state.codeVersion]
  )

  const onPlayerConsole = useCallback(
    (codeVersion: number, payload: ConsoleCommand) => {
      if (codeVersion !== state.codeVersion) return

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
    },
    [state.codeVersion]
  )

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
          environmentName={props.environmentName}
          files={props.files}
          strings={props.strings}
          externalStyles={props.externalStyles}
          fullscreen={props.fullscreen}
          sharedEnvironment={props.sharedEnvironment}
          playgroundOptions={props.playgroundOptions}
          typescriptOptions={props.typescriptOptions}
          workspaces={props.workspaces}
          detectedModules={props.detectedModules}
          diff={props.diff}
          activeStepIndex={props.activeStepIndex}
          onChangeActiveStepIndex={props.onChangeActiveStepIndex}
          // State
          ready={ready}
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
          onPlayerReady={onPlayerReady}
          onPlayerReload={onPlayerReload}
          onPlayerError={onPlayerError}
          onPlayerConsole={onPlayerConsole}
          getTypeScriptInfo={getTypeScriptInfo}
          renderPane={renderPane}
        />
      )
    },
    [
      props.environmentName,
      props.files,
      props.strings,
      props.externalStyles,
      props.fullscreen,
      props.sharedEnvironment,
      props.playgroundOptions,
      props.typescriptOptions,
      props.workspaces,
      props.detectedModules,
      props.diff,
      props.activeStepIndex,
      props.onChangeActiveStepIndex,
      ready,
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
      onPlayerReady,
      onPlayerError,
      onPlayerConsole,
      getTypeScriptInfo,
    ]
  )

  return <div style={styles.container}>{panes.map(renderPane)}</div>
}
