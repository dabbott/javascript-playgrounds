import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#3B3738',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
  },
  spacer: {
    flex: '1 1 auto',
  },
})

@pureRender
export default class extends Component {

  static defaultProps = {
    text: '',
    textStyle: null,
    headerStyle: null,
  }

  getComputedStyles = () => {
    const {textStyle, headerStyle} = this.props

    return {
      container: headerStyle
        ? prefix({...styles.container, ...headerStyle})
        : styles.container,
      text: textStyle
        ? prefix({...styles.text, ...textStyle})
        : styles.text,
    }
  }

  render() {
    const {children, text} = this.props
    const computedStyles = this.getComputedStyles()

    return (
      <div style={computedStyles.container}>
        <div style={computedStyles.text}>
          {text}
        </div>
        <div style={styles.spacer} />
        {children}
      </div>
    )
  }
}
