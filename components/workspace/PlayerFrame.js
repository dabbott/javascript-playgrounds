import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import Phone from './Phone'
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
    vendorComponents: [],
    onError: () => {},
    onRun: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      id: null,
    }

    this.status = 'loading'
    this.fileMap = null
    this.entry = null
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
          if (this.fileMap) {
            this.runApplication(this.fileMap, this.entry)
            this.fileMap = null
            this.entry = null
          }
        break
        case 'error':
          this.props.onError(payload)
        break
      }
    })
  }

  runApplication(fileMap, entry) {
    this.props.onRun()
    switch (this.status) {
      case 'loading':
        this.fileMap = fileMap
        this.entry = entry
      break
      case 'ready':
        this.refs.iframe.contentWindow.postMessage({fileMap, entry}, '*')
      break
    }
  }

  render() {
    const {width, scale, platform, assetRoot, vendorComponents} = this.props
    const {id} = this.state

    // Encode vendor components and load into player frame
    const vendorComponentsEncoded = encodeURIComponent(JSON.stringify(vendorComponents))

    return id && (
      <Phone
        width={width}
        device={platform}
        scale={scale}
      >
        <iframe
          style={styles.iframe}
          ref={'iframe'}
          frameBorder={0}
          src={`player.html#id=${id}&assetRoot=${assetRoot}&vendorComponents=${vendorComponentsEncoded}`}
        />
      </Phone>
    )
  }
}
