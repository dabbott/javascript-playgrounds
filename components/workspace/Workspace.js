import React, { Component } from 'react';
// import ReactDOM from 'react-dom/server';
import Header from './Header'
import Editor from './Editor'
import PlayerFrame from './PlayerFrame'

const Babel = require('babel-standalone')

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
    title: 'Live Editor'
  }

  constructor(props) {
    super(props)
    this.state = {
      compilerError: null,
      runtimeError: null,
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

  render() {
    const {value, title} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.left}>
          <Header
            text={title}
          />
          <Editor
            value={value}
            onChange={this.runApplication.bind(this)}
          />
        </div>
        <div style={styles.right}>
          {this.renderError()}
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
