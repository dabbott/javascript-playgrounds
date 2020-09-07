import React, { memo, ReactNode, useCallback, useMemo } from 'react'
import { StackPaneOptions, PaneOptions } from '../../../utils/Panes'
import TabContainer from '../TabContainer'
import { Tab, getTabTitle, compareTabs } from '../../../utils/Tab'
import { ExternalStyles } from '../Workspace'

interface Props {
  options: StackPaneOptions
  externalStyles: ExternalStyles
  renderPane: (pane: PaneOptions, index: number) => ReactNode
}

type ExtendedTab = Tab & { pane: PaneOptions }

export default memo(function StackPane({
  options,
  externalStyles,
  renderPane,
}: Props) {
  const { children } = options

  const tabs: (Tab & { pane: PaneOptions })[] = useMemo(
    () =>
      children.map((pane, i) => ({
        title: pane.title || pane.type,
        index: i,
        pane,
        changed: false,
      })),
    [children]
  )

  const callback = useCallback((tab) => renderPane(tab.pane, tab.index), [tabs])

  return (
    <TabContainer
      tabs={tabs}
      getTitle={getTabTitle}
      initialTab={tabs[0]}
      tabStyle={externalStyles.stackTab || externalStyles.tab}
      textStyle={externalStyles.stackTabText || externalStyles.tabText}
      activeTextStyle={
        externalStyles.stackTabTextActive || externalStyles.tabTextActive
      }
      renderHiddenContent={true}
      compareTabs={compareTabs}
      renderContent={callback}
    />
  )
})
