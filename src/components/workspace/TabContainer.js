import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'
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

@pureRender
export default class extends Component {

  static defaultProps = {
    tabs: [],
    titles: [],
    initialTab: null,
    onClickTab: () => {},
    renderContent: () => null,
    renderRight: () => null,
    compareTabs: (a, b) => a === b,
    renderHiddenContent: false,
    tabStyle: null,
    textStyle: null,
    textActiveStyle: null,
  }

  constructor(props) {
    super()

    const {initialTab} = props

    this.state = {
      activeTab: initialTab,
    }
  }

  onClickTab = (tab) => {
    const {onClickTab} = this.props

    this.setState({activeTab: tab})
    onClickTab(tab)
  }

  renderTab = (tab, i) => {
    const {compareTabs, renderContent, renderHiddenContent} = this.props
    const {activeTab} = this.state

    if (compareTabs(tab, activeTab)) {
      return (
        <div style={styles.container}>
          {renderContent(tab, i)}
        </div>
      )
    }

    if (renderHiddenContent) {
      return (
        <div style={{...styles.container, flex: '0'}}>
          {renderContent(tab, i)}
        </div>
      )
    }

    return null
  }

  render() {
    const {renderRight, tabs, titles, compareTabs, tabStyle, textStyle, textActiveStyle} = this.props
    const {activeTab} = this.state

    return (
      <div style={styles.container}>
        <Tabs
          tabs={tabs}
          titles={titles}
          compareTabs={compareTabs}
          activeTab={activeTab}
          onClickTab={this.onClickTab}
          tabStyle={tabStyle}
          textStyle={textStyle}
          activeTextStyle={textActiveStyle}
        >
          {renderRight()}
        </Tabs>
        {tabs.map(this.renderTab)}
      </div>
    )
  }
}
