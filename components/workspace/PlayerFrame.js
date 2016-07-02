import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  iframe: {
    flex: '1 1 auto',
  },
})

@pureRender
export default class extends Component {

  static defaultProps = {
    platform: 'ios',
    width: 300,
    scale: 1,
    assetRoot: '',
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

    window.addEventListener('message', ({data}) => {
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
    const {iframe} = this.refs

    this.props.onRun(iframe)
    switch (this.status) {
      case 'loading':
        this.code = code
      break
      case 'ready':
        iframe.contentWindow.postMessage({
          type: 'code',
          payload: code,
        }, '*')
      break
    }
  }

  render() {
    const {width, scale, platform, assetRoot} = this.props
    const {id} = this.state

    return id && (
      <iframe
        style={styles.iframe}
        ref={'iframe'}
        width={width}
        frameBorder={0}
        src={`player.html#id=${id}&width=${width}&platform=${platform}&scale=${scale}&assetRoot=${assetRoot}`}
      />
    )
  }
}
