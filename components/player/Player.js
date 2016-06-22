import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import pureRender from 'pure-render-decorator'

import Phone from './Phone'
import Sandbox from './Sandbox'

@pureRender
export default class extends Component {
  render() {
    const {id, width, platform, scale, assetRoot, runApp} = this.props

    return (
      <Phone
        width={width}
        device={platform}
        scale={scale}
      >
        <Sandbox
          id={id}
          assetRoot={assetRoot}
          runApp={runApp}
        />
      </Phone>
    )
  }
}
