import {
  PlaygroundOptions,
  TypeScriptOptions,
  ResponsivePaneSet,
} from '../components/workspace/Workspace'
import DefaultCode from '../constants/DefaultCode'
import { CSSProperties } from 'react'
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
  title?: string
  code?: string
  files?: Record<string, string>
  entry?: string
  initialTab?: string
  css?: string // was workspaceCSS
  styles: Record<string, CSSProperties>
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
    title = '',
    code = DefaultCode,
    files = {},
    entry,
    initialTab,
    css = '', // was workspaceCSS
    styles = {},
    fullscreen = false,
    sharedEnvironment = false,
    panes = ['editor', 'player', 'console'],
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

  if (typescriptOptions.enabled && !(entry || initialTab)) {
    entry = 'index.tsx'
    initialTab = 'index.tsx'
  } else {
    entry = 'index.js'
    initialTab = 'index.js'
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
  if (!files.hasOwnProperty(initialTab)) {
    initialTab = entry
  }

  return {
    title,
    files,
    entry,
    initialTab,
    css,
    styles,
    fullscreen,
    sharedEnvironment,
    panes: panes.map(normalizePane),
    responsivePaneSets: responsivePaneSets.map((set) => ({
      ...set,
      panes: set.panes.map(normalizePane),
    })),
    workspaces,
    playground,
    typescript: typescriptOptions,
  }
}
