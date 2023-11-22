import { CSSProperties } from 'react'
import { ExternalModule } from '../components/player/VendorComponents'
import { PublicOptions } from './options'

export interface ConsoleOptions {
  showFileName: boolean
  showLineNumber: boolean
  renderReactElements: boolean
}

export interface EmbeddedPaneOptions {
  visible: boolean
  maximized: boolean
  collapsible: boolean
}

export type EmbeddedConsoleOptions = ConsoleOptions & EmbeddedPaneOptions

export type PaneBaseOptions = {
  id: string
  title?: string
  style?: CSSProperties
}

export type StackPaneOptions = PaneBaseOptions & {
  type: 'stack'
  children: PaneOptions[]
}

export type EditorPaneOptions = PaneBaseOptions & {
  type: 'editor'
  fileList?: 'tabs' | 'sidebar'
}

export type TranspilerPaneOptions = PaneBaseOptions & {
  type: 'transpiler'
}

export type PlayerPaneOptions = PaneBaseOptions & {
  type: 'player'
  platform?: string
  scale?: number
  width?: number
  assetRoot?: string
  modules?: ExternalModule[]
  styleSheet?: string
  css?: string
  prelude?: string
  statusBarHeight?: number
  statusBarColor?: string
  console?: EmbeddedConsoleOptions
  reloadable?: boolean
}

export type WorkspacesPaneOptions = PaneBaseOptions & {
  type: 'workspaces'
}

export type ConsolePaneOptions = PaneBaseOptions &
  ConsoleOptions & {
    type: 'console'
  }

export type PaneOptions =
  | StackPaneOptions
  | EditorPaneOptions
  | TranspilerPaneOptions
  | PlayerPaneOptions
  | WorkspacesPaneOptions
  | ConsolePaneOptions

export type PaneShorthand = PaneOptions['type']

export const containsPane = (panes: PaneOptions[], target: string): boolean =>
  panes.some((pane: PaneOptions) => {
    if (pane.type === target) return true

    return pane.type === 'stack' && pane.children
      ? containsPane(pane.children, target)
      : false
  })

let initialId = 0
const getNextId = () => `${initialId++}`

/**
 * Turn panes into objects, and assign a unique id to each.
 */
export const normalizePane = (
  pane: PaneShorthand | PaneOptions,
  publicOptions: PublicOptions
): PaneOptions => {
  let options =
    typeof pane === 'string' ? ({ type: pane } as PaneOptions) : pane

  options.id = options.id || getNextId()

  if (options.type === 'stack') {
    return {
      ...options,
      children: options.children.map((child) =>
        normalizePane(child, publicOptions)
      ),
    }
  }

  if (options.type === 'editor' && publicOptions.title && !options.title) {
    return {
      ...options,
      title: publicOptions.title,
    }
  }

  if (
    options.type === 'player' &&
    publicOptions.modules &&
    publicOptions.modules.length > 0
  ) {
    return {
      ...options,
      modules: [...(options.modules || []), ...publicOptions.modules],
    }
  }

  return options
}
