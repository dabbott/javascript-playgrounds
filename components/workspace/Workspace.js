import React, { Component } from 'react';

import Header from './Header'
import Editor from './Editor'
import PlayerFrame from './PlayerFrame'
import Status from './Status'

const BabelWorker = require("worker!../../babel-worker.js")
const babelWorker = new BabelWorker()

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
    flexDirection: 'column',
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

export default class extends Component {

  static defaultProps = {
    value: '',
    title: 'Live Editor',
    showHeader: true,
  }

  constructor(props) {
    super(props)
    this.state = {
      compilerError: null,
      runtimeError: null,
    }
    this.onBabelWorkerMessage = this.onBabelWorkerMessage.bind(this)
    babelWorker.addEventListener("message", this.onBabelWorkerMessage)
  }

  componentWillUnmount() {
    babelWorker.removeEventListener("message", this.onBabelWorkerMessage)
  }

  componentDidMount() {
    if (typeof navigator !== 'undefined') {
      const {value} = this.props
      babelWorker.postMessage(value)
    }
  }

  runApplication(value) {
    this.refs.player.runApplication(value)
  }

  onBabelWorkerMessage({data}) {
    this.onCompile(JSON.parse(data))
  }

  onCompile(data) {
    switch (data.type) {
      case 'code':
        this.setState({
          compilerError: null
        })

        const {code} = data

        if (code) {
          this.runApplication(code)
        }
      break
      case 'error':
        const {error} = data

        this.setState({
          compilerError: error.message
        })
      break
    }
  }

  render() {
    const {value, title, showHeader} = this.props
    const {compilerError, runtimeError} = this.state

    const error = compilerError || runtimeError
    const firstLine = error && error.split('\n')[0]
    const errorLineNumber = firstLine ? firstLine.match(/\((\d+)/) : null

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          {showHeader && (
            <Header
              text={title}
            />
          )}
          <Editor
            value={value}
            onChange={(value) => {
              babelWorker.postMessage(value)
            }}
            errorLineNumber={errorLineNumber && parseInt(errorLineNumber[1]) - 1}
          />
          <Status
            text={error ? firstLine : 'No Errors'}
            isError={!! error}
          />
        </div>
        <div style={styles.right}>
          <PlayerFrame
            ref={'player'}
            width={210}
            onRun={() => {
              this.setState({runtimeError: null})
            }}
            onError={(e) => {
              this.setState({runtimeError: e})
            }}
          />
        </div>
      </div>
    )
  }
}
