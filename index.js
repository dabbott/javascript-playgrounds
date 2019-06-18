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
  entry = 'index.js',
  initialTab = 'index.js',
  platform = 'ios',
  width = '210',
  scale = '1',
  assetRoot = '',
  vendorComponents = '[]',
  styles = '{}',
  fullscreen = 'false',
  panes = JSON.stringify([
    "editor",
    "player",
  ]),
  transpilerTitle = '',
  playerTitle = '',
  tutorialTitle = '',
  tutorialSteps = JSON.stringify([]),
  playerStyleSheet = 'reset',
  playerCSS = '',
  workspaceCSS = '',
  console = JSON.stringify({
    "enabled": false,
    "visible": false,
    "maximized": false,
    "collapsible": true,
  }),
} = getHashString()

if (workspaceCSS) {
  appendCSS(workspaceCSS)
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
  fileMap = {[entry]: code}
}

if (!fileMap.hasOwnProperty(initialTab)) {
  initialTab = entry
}

class WorkspaceContainer extends Component {
  state = { activeStepIndex: 0 }

  handleChangeActiveStepIndex = (activeStepIndex) => {
    this.setState({ activeStepIndex })
  }

  getWorkspaceProps = () => {
    const { activeStepIndex } = this.state

    const parsedTutorialSteps = JSON.parse(tutorialSteps)

    const workspaceProps = {
      title: title,
      files: fileMap,
      entry: entry,
      initialTab: initialTab,
      platform: platform,
      assetRoot: assetRoot,
      scale: parseFloat(scale),
      width: parseFloat(width),
      vendorComponents: JSON.parse(vendorComponents),
      externalStyles: JSON.parse(styles),
      fullscreen: fullscreen === 'true' && screenfull.enabled,
      panes: JSON.parse(panes),
      transpilerTitle: transpilerTitle,
      tutorialTitle: tutorialTitle,
      tutorialSteps: parsedTutorialSteps,
      playerTitle: playerTitle,
      playerStyleSheet: playerStyleSheet,
      playerCSS: playerCSS,
      onChange: setHashString,
      consoleOptions: JSON.parse(console),
      activeStepIndex: activeStepIndex,
      onChangeActiveStepIndex: this.handleChangeActiveStepIndex,
    }

    if (!parsedTutorialSteps || parsedTutorialSteps.length === 0) {
      return workspaceProps
    }

    return Object.assign(workspaceProps, parsedTutorialSteps[activeStepIndex].workspace)
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
