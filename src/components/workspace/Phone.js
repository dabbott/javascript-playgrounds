import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'
import PHONES from '../../constants/Phones'

@pureRender
export default class extends Component {

  static defaultProps = {
    width: 500,
    device: 'ios',
    scale: 1,
  }

  render() {
    const {children, width, device, scale} = this.props
    const {deviceImageUrl, deviceImageWidth, deviceImageHeight, screenWidth, screenHeight} = PHONES[device]

    const imageScale = width / deviceImageWidth
    const height = imageScale * deviceImageHeight

    const styles = prefixObject({
      container: {
        width,
        height,
        margin: '0 auto',
        position: 'relative',
        backgroundImage: `url(${deviceImageUrl})`,
        backgroundSize: 'cover',
      },
      screen: {
        position: 'absolute',
        top: (deviceImageHeight - screenHeight) / 2 * imageScale,
        left: (deviceImageWidth - screenWidth) / 2 * imageScale,
        width: screenWidth * imageScale,
        height: screenHeight * imageScale,
        backgroundColor: 'white',
      },
      overlay: {
        position: 'absolute',
        top: (deviceImageHeight - screenHeight) / 2 * imageScale,
        left: (deviceImageWidth - screenWidth) / 2 * imageScale,
        width: screenWidth * imageScale / scale,
        height: screenHeight * imageScale / scale,
        transform: `scale(${scale}, ${scale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
      },
    })

    return (
      <div style={styles.container}>
        <div style={styles.screen} />
        <div style={styles.overlay}>
          {children}
        </div>
      </div>
    )
  }
}
