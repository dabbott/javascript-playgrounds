import React, {
  CSSProperties,
  memo,
  ReactNode,
  useCallback,
  useState,
} from 'react'
import { prefixObject } from '../../utils/Styles'
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
  onClickTab?: (tab: T) => {}
  renderContent: (tab: T, index: number) => ReactNode
  getTitle: (a: T) => string
  compareTabs: (a: T, b: T) => boolean
  renderHiddenContent: boolean
  tabStyle?: CSSProperties
  textStyle?: CSSProperties
  activeTextStyle?: CSSProperties
}

const defaultGetChanged = () => false

export default memo(function TabContainer<T>({
  initialTab,
  tabs,
  getTitle,
  compareTabs,
  tabStyle,
  textStyle,
  activeTextStyle,
  onClickTab,
  renderContent,
  renderHiddenContent,
}: Props<T>) {
  const [activeTab, setActiveTab] = useState(initialTab)

  const onClickTabAndSetActive = useCallback(
    (tab) => {
      if (onClickTab) {
        onClickTab(tab)
      }
      setActiveTab(tab)
    },
    [tabs]
  )

  return (
    <div style={styles.container}>
      <Tabs
        getChanged={defaultGetChanged}
        tabs={tabs}
        getTitle={getTitle}
        compareTabs={compareTabs}
        activeTab={activeTab}
        onClickTab={onClickTabAndSetActive}
        tabStyle={tabStyle}
        textStyle={textStyle}
        activeTextStyle={activeTextStyle}
      />
      {tabs.map((tab: T, index: number) => {
        if (activeTab && compareTabs(tab, activeTab)) {
          return (
            <div key={index} style={styles.container}>
              {renderContent(tab, index)}
            </div>
          )
        }

        if (renderHiddenContent) {
          return (
            <div key={index} style={{ ...styles.container, flex: '0' }}>
              {renderContent(tab, index)}
            </div>
          )
        }

        return null
      })}
    </div>
  )
})
