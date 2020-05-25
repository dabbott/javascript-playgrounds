import React, { PureComponent } from 'react'
import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

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
    overflow: 'hidden',
  },
  text: {
    userSelect: 'none',
    color: 'rgba(255,255,255,0.6)',
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
  changedText: {
    color: '#7ABE66',
  },
  spacer: {
    flex: '1 1 auto',
  },
})

styles.activeText = {
  ...styles.text,
  borderBottomWidth: 3,
  color: '#FFF',
}

export default class extends PureComponent {
  static defaultProps = {
    tabs: [],
    activeTab: null,
    onClickTab: () => {},
    getTitle: (a) => a,
    getChanged: (a) => false,
    compareTabs: (a, b) => a === b,
    textStyle: null,
    activeTextStyle: null,
    tabStyle: null,
  }

  onClickTab = (tab) => this.props.onClickTab(tab)

  getComputedStyles = () => {
    const { tabStyle } = this.props

    return {
      container: tabStyle
        ? prefix({ ...styles.container, ...tabStyle })
        : styles.container,
    }
  }

  getTextStyle = (tab) => {
    const { activeTab, textStyle, activeTextStyle, compareTabs } = this.props

    if (compareTabs(tab, activeTab)) {
      const base = textStyle
        ? prefix({ ...styles.activeText, ...textStyle })
        : styles.activeText

      return activeTextStyle ? prefix({ ...base, ...activeTextStyle }) : base
    } else {
      return textStyle ? prefix({ ...styles.text, ...textStyle }) : styles.text
    }
  }

  getChangedTextStyle = (tab) => {
    const { getChanged, changedTextStyle } = this.props

    const base = this.getTextStyle(tab)

    if (getChanged(tab)) {
      return prefix({ ...base, ...styles.changedText, changedTextStyle })
    } else {
      return base
    }
  }

  render() {
    const { children, tabs, titles, getTitle, getChanged } = this.props
    const computedStyles = this.getComputedStyles()

    return (
      <div style={computedStyles.container}>
        {tabs.map((tab, i) => {
          const title = getTitle(tab)

          return (
            <div
              key={title}
              style={this.getChangedTextStyle(tab)}
              onClick={this.onClickTab.bind(this, tab)}
            >
              {title}
            </div>
          )
        })}
        <div style={styles.spacer} />
        {children}
      </div>
    )
  }
}
