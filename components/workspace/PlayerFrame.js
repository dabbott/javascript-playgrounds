import React, { Component } from 'react'

import { prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  iframe: {
    flex: '1 1 auto',
  },
})

export default class extends Component {

  static defaultProps = {
    width: 300,
    onError: () => {},
    onRun: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      id: null,
    }

    this.status = 'loading'
    this.code = null
  }

  componentDidMount() {
    this.setState({
      id: Math.random().toString().slice(2)
    })

    window.addEventListener('message', (e) => {
      let data
      try {
        data = JSON.parse(e.data)
      } catch (err) {
        return
      }

      const {id, type, payload} = data

      if (id !== this.state.id) {
        return
      }

      switch (type) {
        case 'ready':
          this.status = 'ready'
          if (this.code) {
            this.runApplication(this.code)
            this.code = null
          }
        break
        case 'error':
          this.props.onError(payload)
        break
      }
    })
  }

  runApplication(code) {
    this.props.onRun()
    switch (this.status) {
      case 'loading':
        this.code = code
      break
      case 'ready':
        this.refs.iframe.contentWindow.postMessage(code, '*')
      break
    }
  }

  render() {
    const {width} = this.props
    const {id} = this.state

    return id && (
      <iframe
        style={styles.iframe}
        ref={'iframe'}
        width={width}
        frameBorder={0}
        src={`player.html?id=${id}&width=${width}`}
      />
    )
  }
}
