require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import screenfull from 'screenfull'

import Workspace from './components/workspace/Workspace'
import { getHashString, setHashString } from './utils/HashString'
import DefaultCode from './constants/DefaultCode'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'
import { appendCSS } from './utils/Styles'
import diff from './utils/Diff'
import defaultLibs from './utils/TypeScriptDefaultLibs'

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
  platform = 'ios',
  statusBarHeight = '0',
  statusBarColor = 'black',
  width = '210',
  scale = '1',
  assetRoot = '',
  vendorComponents = '[]',
  styles = '{}',
  fullscreen = 'false',
  sharedEnvironment = 'false',
  panes = JSON.stringify(['editor', 'player']),
  transpilerTitle = '',
  playerTitle = '',
  workspacesTitle = '',
  workspaces = JSON.stringify([]),
  playerStyleSheet = 'reset',
  playerCSS = '',
  workspaceCSS = '',
  console = JSON.stringify({
    enabled: false,
    visible: false,
    maximized: false,
    collapsible: true,
    showFileName: true,
    showLineNumber: true,
    renderReactElements: true,
  }),
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
} = getHashString()

const typescriptOptions = Object.assign(
  { libs: defaultLibs, types: [] },
  JSON.parse(typescript)
)

const consoleOptions = JSON.parse(console)
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
let fileMap

if (parsedFiles.length > 0) {
  // Build a map of {filename => code}
  fileMap = parsedFiles.reduce((fileMap, [filename, code]) => {
    fileMap[filename] = code
    return fileMap
  }, {})

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

function workspacesStepDiff(targetStep, sourceStep) {
  const {
    workspace: { files: sourceFiles },
  } = sourceStep
  const {
    workspace: { files: targetFiles },
  } = targetStep

  const result = {}

  Object.keys(targetFiles).forEach((filename, index) => {
    if (!(filename in sourceFiles)) {
      result[filename] = {
        type: 'added',
        ranges: diff('', targetFiles[filename]).added,
      }
    } else {
      result[filename] = {
        type: 'changed',
        ranges: diff(sourceFiles[filename], targetFiles[filename]).added,
      }
    }
  })

  return result
}

class WorkspaceContainer extends Component {
  state = { activeStepIndex: 0 }

  handleChangeActiveStepIndex = (activeStepIndex) => {
    this.setState({ activeStepIndex })
  }

  getWorkspaceProps = () => {
    const { activeStepIndex } = this.state

    const parsedWorkspaces = JSON.parse(workspaces)

    const workspaceProps = {
      title,
      files: fileMap,
      entry,
      initialTab,
      platform,
      statusBarHeight: parseFloat(statusBarHeight),
      statusBarColor,
      assetRoot,
      scale: parseFloat(scale),
      width: parseFloat(width),
      vendorComponents: JSON.parse(vendorComponents),
      externalStyles: JSON.parse(styles),
      sharedEnvironment: sharedEnvironment === 'true',
      fullscreen: fullscreen === 'true' && screenfull.enabled,
      panes: JSON.parse(panes),
      transpilerTitle,
      workspacesTitle,
      workspaces: parsedWorkspaces,
      playerTitle,
      playerStyleSheet,
      playerCSS,
      onChange: setHashString,
      consoleOptions,
      playgroundOptions,
      typescriptOptions,
      activeStepIndex: activeStepIndex,
      onChangeActiveStepIndex: this.handleChangeActiveStepIndex,
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

const mount = document.getElementById('react-root')

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(<WorkspaceContainer />, mount)
