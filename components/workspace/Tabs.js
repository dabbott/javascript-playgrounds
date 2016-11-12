import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'

const styles = prefixObject({
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#3B3738',
    boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
    zIndex: 1000,
  },
  text: {
    color: '#AAA',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '40px',
    padding: '0 20px',
    cursor: 'pointer',
    borderBottomStyle: 'solid',
    borderBottomColor: '#1990B8',
    borderBottomWidth: 0,
    transition: 'border-width 0.1s, color 0.1s',
  },
})

styles.activeText = {
  ...styles.text,
  borderBottomWidth: 3,
  color: '#FFF',
}

@pureRender
export default class extends Component {

  static defaultProps = {
    tabs: [],
    activeTab: null,
    onClickTab: () => {},
  }

  onClickTab = (tab) => this.props.onClickTab(tab)

  render() {
    const {tabs, activeTab} = this.props

    return (
      <div style={styles.container}>
        {tabs.map(tab => (
          <div
            key={tab}
            style={tab === activeTab ? styles.activeText : styles.text}
            onClick={this.onClickTab.bind(this, tab)}
          >
            {tab}
          </div>
        ))}
      </div>
    )
  }
}
