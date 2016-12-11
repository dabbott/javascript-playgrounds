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
    const {children, width, device, scale: initialScale} = this.props
    const {deviceImageUrl, deviceImageWidth, deviceImageHeight, devicePixelDensity, screenWidth, screenHeight, zoom} = PHONES[device]

    const imageScale = width / deviceImageWidth
    const height = imageScale * deviceImageHeight
    const scale = initialScale * devicePixelDensity * zoom

    const styles = prefixObject({
      container: {
        width,
        height,
        margin: '0 auto',
        position: 'relative',
      },
      phone: {
        width: deviceImageWidth,
        height: deviceImageHeight,
        backgroundImage: `url(${deviceImageUrl})`,
        transform: `scale(${imageScale}, ${imageScale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      screen: {
        backgroundColor: 'white',
        width: screenWidth / scale,
        height: screenHeight / scale,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        transform: `scale(${scale}, ${scale})`,
        overflow: 'hidden',
      },
      overlay: {
        position: 'absolute',
        top: (deviceImageHeight - screenHeight) / 2 * imageScale,
        left: (deviceImageWidth - screenWidth) / 2 * imageScale,
        width: screenWidth * imageScale,
        height: screenHeight * imageScale,
        display: 'flex',
      },
    })

    return (
      <div style={styles.container}>
        <div style={styles.phone}>
          <div style={styles.screen} />
        </div>
        <div style={styles.overlay}>
          {children}
        </div>
      </div>
    )
  }
}
