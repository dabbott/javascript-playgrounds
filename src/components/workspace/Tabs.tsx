import React, { CSSProperties, memo, ReactNode, useMemo } from 'react'
import { prefixObject, mergeStyles } from '../../utils/PrefixInlineStyles'

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
  children?: ReactNode
}

interface TabProps<T> {
  title: string
  style: CSSProperties
  onClick: () => void
}

const Tab = memo(function Tab<T>({ title, style, onClick }: TabProps<T>) {
  return (
    <div key={title} style={style} onClick={onClick}>
      {title}
    </div>
  )
})

export default memo(function Tabs<T>({
  children = undefined,
  tabs = [],
  getTitle,
  tabStyle,
  activeTab,
  textStyle,
  activeTextStyle,
  changedTextStyle,
  compareTabs,
  onClickTab,
  getChanged,
}: Props<T>) {
  const activeTabIndex = tabs.findIndex(
    (tab) => activeTab && compareTabs(tab, activeTab)
  )
  const clickHandlers = useMemo(
    () => tabs.map((tab) => onClickTab.bind(null, tab)),
    [tabs, onClickTab]
  )

  const containerStyle = useMemo(
    () => mergeStyles(styles.container, tabStyle),
    [tabStyle]
  )
  const computedTabStyle = useMemo(() => mergeStyles(styles.text, textStyle), [
    textStyle,
  ])
  const computedActiveTabStyle = useMemo(
    () => mergeStyles(styles.activeText, textStyle, activeTextStyle),
    [textStyle, activeTextStyle]
  )
  const computedChangedTabStyle = useMemo(
    () => mergeStyles(computedTabStyle, styles.changedText, changedTextStyle),
    [textStyle, activeTextStyle]
  )

  return (
    <div style={containerStyle}>
      {tabs.map((tab, index) => {
        const isActive = activeTabIndex === index
        const isChanged = getChanged(tab)

        return (
          <Tab
            key={index}
            style={
              isActive
                ? computedActiveTabStyle
                : isChanged
                ? computedChangedTabStyle
                : computedTabStyle
            }
            title={getTitle(tab)}
            onClick={clickHandlers[index]}
          />
        )
      })}
      <div style={styles.spacer} />
      {children}
    </div>
  )
})
