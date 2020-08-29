import React, { PureComponent, ReactNode, CSSProperties } from 'react'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import Tabs from './Tabs'

const styles = prefixObject({
  container: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
})

interface Props<T> {
  tabs: T[]
  initialTab?: T
  onClickTab: (tab: T) => {}
  renderContent: (tab: T, index: number) => ReactNode
  renderRight: () => ReactNode
  getTitle: (a: T) => string
  compareTabs: (a: T, b: T) => boolean
  renderHiddenContent: boolean
  tabStyle?: CSSProperties
  textStyle?: CSSProperties
  activeTextStyle?: CSSProperties
}

interface State<T> {
  activeTab?: T
}

export default class TabContainer<T> extends PureComponent<Props<T>, State<T>> {
  static defaultProps = {
    tabs: [],
    initialTab: null,
    onClickTab: () => {},
    renderContent: () => null,
    renderRight: () => null,
    // getTitle: (a) => a,
    // compareTabs: (a, b) => a === b,
    renderHiddenContent: false,
    tabStyle: null,
    textStyle: null,
    activeTextStyle: null,
  }

  constructor(props: Props<T>) {
    super(props)

    const { initialTab } = props

    this.state = {
      activeTab: initialTab,
    }
  }

  onClickTab = (tab: T): void => {
    const { onClickTab } = this.props

    this.setState({ activeTab: tab })
    onClickTab(tab)
  }

  renderTab = (tab: T, i: number) => {
    const { compareTabs, renderContent, renderHiddenContent } = this.props
    const { activeTab } = this.state

    if (activeTab && compareTabs(tab, activeTab)) {
      return (
        <div key={i} style={styles.container}>
          {renderContent(tab, i)}
        </div>
      )
    }

    if (renderHiddenContent) {
      return (
        <div key={i} style={{ ...styles.container, flex: '0' }}>
          {renderContent(tab, i)}
        </div>
      )
    }

    return null
  }

  render() {
    const {
      renderRight,
      tabs,
      getTitle,
      compareTabs,
      tabStyle,
      textStyle,
      activeTextStyle,
    } = this.props
    const { activeTab } = this.state

    return (
      <div style={styles.container}>
        <Tabs
          tabs={tabs}
          getTitle={getTitle}
          compareTabs={compareTabs}
          activeTab={activeTab}
          onClickTab={this.onClickTab}
          tabStyle={tabStyle}
          textStyle={textStyle}
          activeTextStyle={activeTextStyle}
        >
          {renderRight()}
        </Tabs>
        {tabs.map(this.renderTab)}
      </div>
    )
  }
}
