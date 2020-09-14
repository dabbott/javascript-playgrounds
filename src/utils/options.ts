import {
  PlaygroundOptions,
  TypeScriptOptions,
  ResponsivePaneSet,
  ExternalStyles,
} from '../components/workspace/Workspace'
import DefaultCode from '../constants/DefaultCode'
import { PaneOptions, PaneShorthand, normalizePane } from './Panes'
import defaultLibs from '../utils/TypeScriptDefaultLibs'

export interface WorkspaceStep {
  title: string
  description: string
  workspace: {
    title: string
    initialTab: string
    entry: string
    files: Record<string, string>
  }
}

export interface PublicOptions {
  preset?: string
  title?: string
  code?: string
  files?: Record<string, string>
  entry?: string
  initialTab?: string
  loadingMessage?: string
  css?: string // was workspaceCSS
  styles?: ExternalStyles
  fullscreen?: boolean
  sharedEnvironment?: boolean
  playground?: PlaygroundOptions
  typescript?: TypeScriptOptions
  workspaces?: WorkspaceStep[]
  panes?: PublicPaneOptions[]
  responsivePaneSets?: PublicResponsivePaneSet[]
}

export type PublicPaneOptions = PaneShorthand | PaneOptions

export type PublicResponsivePaneSet = {
  maxWidth: number
  panes: PublicPaneOptions[]
}

export type InternalOptions = Required<
  Omit<PublicOptions, 'panes' | 'responsivePaneSets' | 'code'>
> & {
  panes: PaneOptions[]
  responsivePaneSets: ResponsivePaneSet[]
}

export function normalize(options: PublicOptions): InternalOptions {
  let {
    preset = 'react-native',
    title = '',
    code = DefaultCode,
    files = {},
    entry,
    initialTab,
    loadingMessage = 'Loading dependencies...',
    css = '', // was workspaceCSS
    styles = {},
    fullscreen = false,
    sharedEnvironment = false,
    panes = ['editor', 'player'],
    responsivePaneSets = [],
    workspaces = [],
    playground = {
      enabled: false,
      renderReactElements: true,
      debounceDuration: 200,
    },
    typescript = {
      enabled: false,
      /* libs */
      /* types */
    },
  } = options

  const typescriptOptions = Object.assign(
    { libs: defaultLibs, types: [] },
    typescript
  )

  if (!entry) {
    entry = typescriptOptions.enabled ? 'index.tsx' : 'index.js'
  }

  if (Object.keys(files).length > 0) {
    // If entry file is invalid or not given, choose the first file
    if (!files.hasOwnProperty(entry)) {
      entry = files[Object.keys(files)[0]]
    }
  } else {
    // If no files are given, use the code param
    files = { [entry]: code }
  }

  // If initial tab is invalid or not given, use the entry file
  if (!initialTab || !files.hasOwnProperty(initialTab)) {
    initialTab = entry
  }

  return {
    preset,
    title,
    files,
    entry,
    initialTab,
    loadingMessage,
    css,
    styles,
    fullscreen,
    sharedEnvironment,
    panes: panes.map((pane) => normalizePane(pane, title)),
    responsivePaneSets: responsivePaneSets.map((set) => ({
      ...set,
      panes: set.panes.map((pane) => normalizePane(pane, title)),
    })),
    workspaces,
    playground,
    typescript: typescriptOptions,
  }
}
