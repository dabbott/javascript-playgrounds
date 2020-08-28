import React, { PureComponent, CSSProperties } from 'react'
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

interface Props {
  textStyle?: CSSProperties
}

export default class Fullscreen extends PureComponent<Props> {
  static defaultProps = {
    textStyle: null,
  }

  getComputedStyles = () => {
    const { textStyle } = this.props

    return {
      text: textStyle ? prefix({ ...styles.text, ...textStyle }) : styles.text,
    }
  }

  toggleFullscreen = () => (screenfull as any).toggle()

  render() {
    const computedStyles = this.getComputedStyles()

    return (
      <div style={computedStyles.text} onClick={this.toggleFullscreen}>
        Fullscreen
      </div>
    )
  }
}
