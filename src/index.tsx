import 'codemirror/lib/codemirror.css'
import './styles/codemirror-theme.css'
import './styles/reset.css'
import './styles/index.css'

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import screenfull from 'screenfull'

import Workspace, {
  Props as WorkspaceProps,
} from './components/workspace/Workspace'
import { getHashString, setHashString } from './utils/HashString'
import DefaultCode from './constants/DefaultCode'
import { prefix, prefixAndApply } from './utils/Styles'
import { appendCSS } from './utils/CSS'
import diff, { DiffRange } from './utils/Diff'
import defaultLibs from './utils/TypeScriptDefaultLibs'
import { normalizePane } from './utils/Panes'

const style = prefix({
  flex: '1 1 auto',
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
})

let {
  title = '',
  code = DefaultCode,
  files = '[]',
  entry,
  initialTab,
  styles = '{}',
  fullscreen = 'false',
  sharedEnvironment = 'false',
  panes = JSON.stringify([
    { type: 'editor', title: 'Editor' },
    {
      type: 'player',
      title: 'Player',
      platform: 'ios',
      statusBarHeight: 0,
      statusBarColor: 'black',
      width: 210,
      scale: 1,
      assetRoot: '',
      css: '',
      prelude: '',
      styleSheet: 'reset',
      vendorComponents: [],
      console: {
        enabled: true,
        visible: false,
        maximized: false,
        collapsible: true,
        showFileName: true,
        showLineNumber: true,
        renderReactElements: true,
      },
    },
    {
      type: 'console',
      title: 'Console',
    },
  ]),
  responsivePaneSets = '[]',
  workspaces = JSON.stringify([]),
  workspaceCSS = '',
  playground = JSON.stringify({
    enabled: false,
    renderReactElements: true,
    debounceDuration: 200,
  }),
  typescript = JSON.stringify({
    enabled: false,
    /* libs */
    /* types */
  }),
} = getHashString() as any

const typescriptOptions = Object.assign(
  { libs: defaultLibs, types: [] },
  JSON.parse(typescript)
)

const playgroundOptions = JSON.parse(playground)

if (workspaceCSS) {
  appendCSS(workspaceCSS)
}

if (typescriptOptions.enabled && !(entry || initialTab)) {
  entry = 'index.tsx'
  initialTab = 'index.tsx'
} else {
  entry = 'index.js'
  initialTab = 'index.js'
}

const parsedFiles = JSON.parse(files)
let fileMap: Record<string, string>

if (parsedFiles.length > 0) {
  // Build a map of {filename => code}
  fileMap = parsedFiles.reduce(
    (fileMap: Record<string, string>, [filename, code]: [string, string]) => {
      fileMap[filename] = code
      return fileMap
    },
    {}
  )

  // If entry file is invalid, choose the first file
  if (!fileMap.hasOwnProperty(entry)) {
    entry = parsedFiles[0][0]
  }
} else {
  // If no files are given, use the code param
  fileMap = { [entry]: code }
}

if (!fileMap.hasOwnProperty(initialTab)) {
  initialTab = entry
}

export type WorkspaceDiff = {
  type: 'added' | 'changed'
  ranges: DiffRange[]
}

type WorkspaceStep = {
  workspace: { files: Record<string, string> }
}

function workspacesStepDiff(
  targetStep: WorkspaceStep,
  sourceStep: WorkspaceStep
): Record<string, WorkspaceDiff> {
  const {
    workspace: { files: sourceFiles },
  } = sourceStep
  const {
    workspace: { files: targetFiles },
  } = targetStep

  const result: Record<string, WorkspaceDiff> = {}

  Object.keys(targetFiles).forEach((filename: string) => {
    const exists = filename in sourceFiles
    const source = sourceFiles[filename] ?? ''
    const lineDiff = diff(source, targetFiles[filename])

    result[filename] = {
      type: exists ? 'changed' : 'added',
      ranges: lineDiff.added,
    }
  })

  return result
}

class WorkspaceContainer extends Component {
  state = { activeStepIndex: 0 }

  handleChangeActiveStepIndex = (activeStepIndex: number) => {
    this.setState({ activeStepIndex })
  }

  getWorkspaceProps = () => {
    const { activeStepIndex } = this.state

    const parsedWorkspaces = JSON.parse(workspaces)

    const parsedResponsivePaneSets = [
      ...JSON.parse(responsivePaneSets),
      { panes: JSON.parse(panes), maxWidth: Infinity },
    ]

    parsedResponsivePaneSets.forEach((set) => {
      set.panes = set.panes.map(normalizePane)
    })

    const workspaceProps: WorkspaceProps = {
      title,
      description: '', // Not currently used
      files: fileMap,
      entry,
      initialTab,
      externalStyles: JSON.parse(styles),
      sharedEnvironment: sharedEnvironment === 'true',
      fullscreen: fullscreen === 'true' && (screenfull as any).enabled,
      responsivePaneSets: parsedResponsivePaneSets,
      workspaces: parsedWorkspaces,
      onChange: setHashString,
      playgroundOptions,
      typescriptOptions,
      activeStepIndex: activeStepIndex,
      onChangeActiveStepIndex: this.handleChangeActiveStepIndex,
      diff: {},
    }

    if (!parsedWorkspaces || parsedWorkspaces.length === 0) {
      return workspaceProps
    }

    if (activeStepIndex > 0) {
      const workspaceDiff = workspacesStepDiff(
        parsedWorkspaces[activeStepIndex],
        parsedWorkspaces[activeStepIndex - 1]
      )

      workspaceProps.diff = workspaceDiff
    }

    return Object.assign(
      workspaceProps,
      parsedWorkspaces[activeStepIndex].workspace
    )
  }

  render() {
    const { activeStepIndex } = this.state

    return (
      <div style={style}>
        <Workspace key={activeStepIndex} {...this.getWorkspaceProps()} />
      </div>
    )
  }
}

const mount = document.getElementById('react-root') as HTMLDivElement

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(<WorkspaceContainer />, mount)
