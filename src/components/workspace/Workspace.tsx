import React, { CSSProperties, PureComponent } from 'react'
import type * as ts from 'typescript'
import type { WorkspaceDiff } from '../../index'
import { ConsoleCommand, LogCommand } from '../../types/Messages'
import { getErrorDetails } from '../../utils/ErrorMessage'
import { containsPane, PaneOptions } from '../../utils/Panes'
import { prefixObject, rowStyle } from '../../utils/Styles'
import { Tab } from '../../utils/Tab'
import ConsolePane from './panes/ConsolePane'
import EditorPane from './panes/EditorPane'
import PlayerPane from './panes/PlayerPane'
import StackPane from './panes/StackPane'
import TranspilerPane from './panes/TranspilerPane'
import WorkspacesPane from './panes/WorkspacesPane'
import PlayerFrame from './PlayerFrame'
import typeScriptRequest from '../../utils/TypeScriptRequest'
import babelRequest, { BabelResponse } from '../../utils/BabelRequest'
import * as workspace from '../../reducers/workspace'

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
  enabled: false
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

export default class Workspace extends PureComponent<Props, workspace.State> {
  static defaultProps = {
    title: 'Live Editor',
    files: { ['index.js']: '' },
    entry: 'index.js',
    initialTab: 'index.js',
    onChange: () => {},
    externalStyles: {},
    fullscreen: false,
    sharedEnvironment: true,
    responsivePaneSets: [],
    // consoleOptions: {},
    playgroundOptions: {},
    typescriptOptions: {},
    workspaces: [],
    diff: {},
    statusBarHeight: 0,
    statusBarColor: 'black',
  }

  players: Record<string, PlayerFrame> = {}

  constructor(props: Props) {
    super(props)

    const {
      initialTab,
      responsivePaneSets,
      files,
      diff,
      typescriptOptions,
    } = props

    const fileTabs: Tab[] = Object.keys(files).map((filename, index) => {
      return {
        title: filename,
        changed: diff[filename] ? diff[filename].ranges.length > 0 : false,
        index,
      }
    })

    if (
      typescriptOptions.enabled &&
      Object.keys(files).filter((file) => file.match(/\.tsx?/)).length === 0
    ) {
      console.warn('TypeScript is enabled but there are no .ts or .tsx files.')
    }

    let initialWindowWidth

    if (typeof window !== 'undefined') {
      initialWindowWidth = window.outerWidth

      if (responsivePaneSets.length > 1) {
        window.addEventListener('resize', () => {
          const nextIndex = findPaneSetIndex(
            responsivePaneSets,
            window.outerWidth
          )

          if (nextIndex !== this.state.paneSetIndex) {
            this.setState(
              {
                paneSetIndex: nextIndex,
              },
              () => {
                // We may be rendering a different player pane, so we need to re-run
                this.runApplication()
              }
            )
          }
        })
      }
    }

    const paneSetIndex = findPaneSetIndex(
      responsivePaneSets,
      initialWindowWidth
    )
    const panes = responsivePaneSets[paneSetIndex].panes

    this.state = workspace.initialState({
      initialTab,
      fileTabs,
      paneSetIndex,
      panes,
    })
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const { files, typescriptOptions } = this.props
      const { playerVisible, transpilerVisible, codeCache } = this.state

      // Cache and compile each file
      Object.keys(files).forEach((filename) => {
        const code = files[filename]

        codeCache[filename] = code

        if (this.props.typescriptOptions.enabled) {
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
          this.compilerRequest(filename, code)
        }

        if (transpilerVisible) {
          this.transpilerRequest(filename, code)
        }
      })
    }
  }

  runApplication = () => {
    const { entry, files } = this.props

    // Run the app once we've transformed each file at least once
    if (
      Object.keys(files).every((filename) => this.state.playerCache[filename])
    ) {
      this.setState(reducer(this.state, consoleClear()))
      Object.values(this.players).forEach((player) => {
        player.runApplication(this.state.playerCache, entry)
      })
    }
  }

  updateStatus = (babelMessage: BabelResponse) => {
    switch (babelMessage.type) {
      case 'code':
        this.setState(reducer(this.state, babelCode()))
        break
      case 'error':
        this.setState(
          reducer(this.state, babelError(babelMessage.error.message))
        )
        break
    }
  }

  getTypeScriptInfo = (
    prefixedFilename: string,
    index: number,
    done: (info: ts.QuickInfo) => void
  ): void => {
    const [, filename] = prefixedFilename.split(':')

    if (this.props.typescriptOptions.enabled) {
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
  }

  onCodeChange = (code: string) => {
    const { activeFile, transpilerVisible, playerVisible } = this.state

    if (this.props.typescriptOptions.enabled) {
      typeScriptRequest({
        type: 'file',
        filename: activeFile,
        code,
      })
    }

    if (playerVisible) {
      this.compilerRequest(activeFile, code)
    }

    if (transpilerVisible) {
      this.transpilerRequest(activeFile, code)
    }

    this.setState(reducer(this.state, codeChange(activeFile, code)), () => {
      this.props.onChange(this.state.codeCache)
    })
  }

  compilerRequest = (filename: string, code: string) => {
    babelRequest({
      filename,
      code,
      options: { retainLines: true },
    }).then((response: BabelResponse) => {
      this.updateStatus(response)

      if (response.type === 'code') {
        this.setState(
          reducer(this.state, compiled(response.filename, response.code)),
          () => {
            this.runApplication()
          }
        )
      }
    })
  }

  transpilerRequest = (filename: string, code: string) => {
    babelRequest({
      filename,
      code,
    }).then((response) => {
      if (response.type === 'code') {
        this.setState(
          reducer(this.state, transpiled(response.filename, response.code))
        )
      }
    })
  }

  onPlayerRun = () => {
    this.setState(reducer(this.state, playerRun()))
  }

  onPlayerError = (message: string) => {
    this.setState(reducer(this.state, playerError(message)))
  }

  onPlayerConsole = (payload: ConsoleCommand) => {
    const { playgroundOptions } = this.props

    // if (consoleOptions.enabled || playgroundOptions.enabled) {
    switch (payload.command) {
      case 'clear':
        this.setState(reducer(this.state, consoleClear()))
        return
      case 'log':
        this.setState(reducer(this.state, consoleAppend(payload)))
        return
    }
    // }
  }

  onClickTab = (tab: Tab) => {
    this.setState(reducer(this.state, openEditorTab(tab)))
  }

  renderPane = (options: PaneOptions, key: number) => {
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
    } = this.props
    const {
      logs,
      transpilerCache,
      activeFile,
      compilerError,
      runtimeError,
      activeFileTab,
      fileTabs,
    } = this.state

    switch (options.type) {
      case 'editor':
        return (
          <EditorPane
            key={key}
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
            onChange={this.onCodeChange}
            getTypeInfo={this.getTypeScriptInfo}
            onClickTab={this.onClickTab}
          />
        )
      case 'transpiler':
        return (
          <TranspilerPane
            key={key}
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
              if (player) {
                this.players[options.id] = player
              } else {
                delete this.players[options.id]
              }
            }}
            key={key}
            options={options}
            externalStyles={externalStyles}
            sharedEnvironment={sharedEnvironment}
            files={files}
            logs={logs}
            onPlayerRun={this.onPlayerRun}
            onPlayerError={this.onPlayerError}
            onPlayerConsole={this.onPlayerConsole}
          />
        )
      case 'workspaces':
        return (
          <WorkspacesPane
            key={key}
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
            key={key}
            options={options}
            externalStyles={externalStyles}
            renderPane={this.renderPane}
          />
        )
      case 'console':
        return (
          <ConsolePane
            key={key}
            options={options}
            externalStyles={externalStyles}
            files={files}
            logs={logs}
          />
        )
      default:
        return `Unknown pane type: ${options['type']}`
    }
  }

  render() {
    const { responsivePaneSets } = this.props
    const { paneSetIndex } = this.state
    const panes = responsivePaneSets[paneSetIndex].panes

    return <div style={styles.container}>{panes.map(this.renderPane)}</div>
  }
}
