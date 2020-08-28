import React, { PureComponent, CSSProperties } from 'react'
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

interface Props<T> {
  tabs: T[]
  activeTab?: T
  onClickTab: (tab: T) => void
  getTitle: (a: T) => string
  getChanged: (a: T) => boolean
  compareTabs: (a: T, b: T) => boolean
  textStyle?: CSSProperties
  activeTextStyle?: CSSProperties
  changedTextStyle?: CSSProperties
  tabStyle?: CSSProperties
}

export default class Tabs<T> extends PureComponent<Props<T>> {
  static defaultProps = {
    tabs: [],
    activeTab: null,
    onClickTab: (tab: string) => {},
    getTitle: (a: string) => a,
    getChanged: (a: string) => false,
    compareTabs: (a: string, b: string) => a === b,
    textStyle: null,
    activeTextStyle: null,
    tabStyle: null,
  }

  onClickTab = (tab: T) => this.props.onClickTab(tab)

  getContainerStyle = () => {
    const { tabStyle } = this.props

    return tabStyle
      ? prefix({ ...styles.container, ...tabStyle })
      : styles.container
  }

  getTextStyle = (tab: T) => {
    const { activeTab, textStyle, activeTextStyle, compareTabs } = this.props

    if (activeTab && compareTabs(tab, activeTab)) {
      const base = textStyle
        ? prefix({ ...styles.activeText, ...textStyle })
        : styles.activeText

      return activeTextStyle ? prefix({ ...base, ...activeTextStyle }) : base
    } else {
      return textStyle ? prefix({ ...styles.text, ...textStyle }) : styles.text
    }
  }

  getChangedTextStyle = (tab: T) => {
    const { getChanged, changedTextStyle } = this.props

    const base = this.getTextStyle(tab)

    if (getChanged(tab)) {
      return prefix({ ...base, ...styles.changedText, ...changedTextStyle })
    } else {
      return base
    }
  }

  render() {
    const { children, tabs, getTitle } = this.props

    return (
      <div style={this.getContainerStyle()}>
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
