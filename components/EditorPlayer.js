import React, { Component } from 'react';
// import ReactDOM from 'react-dom/server';
import Tabs from './Tabs'
import Editor from './Editor'
import PlayerFrame from './PlayerFrame'

const Babel = require('babel-standalone')

const playerWidth = 400
const editorHeight = 600

const styles = {
  container: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  left: {
    flex: `1 1 auto`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  right: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 0,
    minHeight: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  err: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    overflow: 'auto',
    borderTop: '1px solid whitesmoke',
    color: '#ac4142',
    padding: '15px 20px',
    whiteSpace: 'pre',
    fontFamily: 'monospace',
    zIndex: 1,
  },
}

const LIVE_EDITOR = 'Live JSX Editor'
const COMPILED_JS = 'Compiled JS'
const tabs = [LIVE_EDITOR, COMPILED_JS]

export default class EditorTranspiler extends Component {
  constructor() {
    super()
    this.state = {
      activeTab: LIVE_EDITOR,
    }
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {value} = this.props
      this.runApplication(value)
    }
  }

  runApplication(value) {
    const compiled = this.compile(value)

    if (compiled) {
      this.refs.player.runApplication(compiled)
    }
  }

  compile(value) {
    try {
      const code = Babel.transform(value, {
        presets: ['es2015', 'react'],
        retainLines: true,
      }).code

      this.setState({
        compiledOutput: code,
        compilerError: null
      })

      return code
    } catch (e) {
      this.setState({
        compilerError: e.message.replace('unknown', e.name)
      })
    }

    return null
  }

  renderError() {
    const {compilerError, runtimeError} = this.state
    const e = compilerError || runtimeError

    if (e) {
      return (
        <div style={styles.err}>
          {e}
        </div>
      )
    }

    return null
  }

  renderEditor(activeTab, value, compiledOutput) {
    console.log('rendering editor', activeTab)
    switch (activeTab) {
      case LIVE_EDITOR:
        return (
          <Editor
            key={LIVE_EDITOR}
            value={value}
            onChange={this.runApplication.bind(this)}
          />
        )
      break
      case COMPILED_JS:
        return (
          <Editor
            key={COMPILED_JS}
            value={compiledOutput}
            readOnly={true}
          />
        )
      break
    }
  }

  render() {
    const {value} = this.props
    const {activeTab, compiledOutput} = this.state

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          <Tabs
            tabs={tabs}
            active={activeTab}
            onChange={(activeTab) => this.setState({activeTab})}
          />
          {this.renderEditor(activeTab, value, compiledOutput)}
        </div>
        <div style={styles.right}>
          {this.renderError()}
          <PlayerFrame ref={'player'}
            width={playerWidth}
            height={editorHeight}
            onRun={() => {
              this.setState({runtimeError: null})
            }}
            onError={(e) => {
              this.setState({runtimeError: e})
            }}/>
        </div>
      </div>
    )
  }
}
