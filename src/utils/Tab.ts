export interface Tab {
  index: number
  title: string
  changed: boolean
}
export const compareTabs = (a: Tab, b: Tab) => a.index === b.index
export const getTabTitle = (tab: Tab) => tab.title
export const getTabChanged = (tab: Tab) => tab.changed
