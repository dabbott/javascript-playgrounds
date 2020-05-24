import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'
import screenfull from 'screenfull'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
  },
})

@pureRender
export default class extends Component {

  static defaultProps = {
    textStyle: null,
  }

  getComputedStyles = () => {
    const {textStyle} = this.props

    return {
      text: textStyle
        ? prefix({...styles.text, ...textStyle})
        : styles.text,
    }
  }

  toggleFullscreen = () => screenfull.toggle()

  render() {
    const computedStyles = this.getComputedStyles()

    return (
      <div
        style={computedStyles.text}
        onClick={this.toggleFullscreen}
      >
        Fullscreen
      </div>
    )
  }
}
