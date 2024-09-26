import type * as ts from 'typescript'
import type { ExternalModule } from '../components/player/VendorComponents'
import {
  ExternalStyles,
  PlaygroundOptions,
  ResponsivePaneSet,
} from '../components/workspace/Workspace'
import * as DefaultCode from '../constants/DefaultCode'
import defaultCompilerOptions from '../utils/TypeScriptDefaultConfig'
import defaultLibs from '../utils/TypeScriptDefaultLibs'
import { PaneOptions, PaneShorthand, normalizePane } from './Panes'
import { extname } from './path'

export interface TypeScriptOptions {
  enabled?: boolean
  libs?: string[]
  types?: { name: string; url: string }[]
  compilerOptions?: ts.CompilerOptions
}

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

const userInterfaceStrings = {
  loading: 'Loading dependencies...',
  about: '',
  noErrors: 'No Errors',
  showDetails: 'Show Details',
  fullscreen: 'Fullscreen',
  openInNewWindow: 'Open in new window',
  codesandbox: 'Open in CodeSandbox',
  reload: 'Reload',
}

export type UserInterfaceStrings = typeof userInterfaceStrings

export interface CompilerOptions {
  type: 'none' | 'babel' | 'tsc'
  maxLoopIterations?: number
}

export interface PublicOptions {
  preset?: string
  environment?: string
  title?: string
  code?: string
  files?: Record<string, string>
  entry?: string
  initialTab?: string
  strings?: UserInterfaceStrings
  css?: string // was workspaceCSS
  _css?: string // workaround for styled-components renaming this props
  styles?: ExternalStyles
  fullscreen?: boolean
  codesandbox?: boolean
  openInNewWindow?: boolean
  sharedEnvironment?: boolean
  reloadMode?: 'soft' | 'hard'
  compiler?: CompilerOptions
  playground?: Partial<PlaygroundOptions>
  typescript?: TypeScriptOptions
  workspaces?: WorkspaceStep[]
  panes?: PublicPaneOptions[]
  responsivePaneSets?: PublicResponsivePaneSet[]
  detectDependencies?: boolean
  modules?: ExternalModule[] // These are added to each player pane's options
  targetOrigin?: string
}

export type PublicPaneOptions = PaneShorthand | PaneOptions

export type PublicResponsivePaneSet = {
  maxWidth: number
  panes: PublicPaneOptions[]
}

export type InternalOptions = Required<
  Omit<
    PublicOptions,
    | 'preset'
    | 'panes'
    | 'responsivePaneSets'
    | 'code'
    | 'detectDependencies'
    | 'modules'
    | 'environment'
    | 'playground'
  >
> & {
  environmentName: string
  responsivePaneSets: ResponsivePaneSet[]
  detectedModules: ExternalModule[]
  playground: PlaygroundOptions
}

const defaults: {
  compiler: CompilerOptions
  playground: PlaygroundOptions
  typescript: TypeScriptOptions
} = {
  compiler: {
    type: 'babel',
    maxLoopIterations: 1000,
  },
  playground: {
    enabled: true,
    inspector: 'browser',
    renderReactElements: true,
    debounceDuration: 200,
    instrumentExpressionStatements: false,
  },
  typescript: {
    enabled: false,
    libs: defaultLibs,
    types: [],
    compilerOptions: defaultCompilerOptions,
  },
}

const presetOptions: Record<string, PublicOptions> = {
  none: {
    code: '',
    environment: 'javascript',
    compiler: {
      type: 'none',
    },
    panes: [
      'editor',
      {
        id: 'player',
        type: 'player',
        platform: 'web',
        style: { display: 'none' },
      },
    ],
    playground: {
      enabled: false,
      inspector: 'browser',
      renderReactElements: true,
      debounceDuration: 200,
      instrumentExpressionStatements: false,
    },
  },
  html: {
    code: '',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My page</title>
    <link rel="stylesheet" href="./main.css"></link>
  </head>
  <body>  
    <p>Hello, world!</p>
  </body>
</html>`,
      'main.css': `* {
  box-sizing: border-box;
}

body, p {
  padding: 0;
  margin: 0;
}`,
    },
    environment: 'html',
    compiler: {
      type: 'none',
    },
    panes: [
      'editor',
      {
        id: 'player',
        type: 'player',
        platform: 'web',
      },
    ],
  },
  python: {
    code: `import sys\n\nprint(sys.version)`,
    environment: 'python',
    sharedEnvironment: true,
    compiler: {
      type: 'none',
    },
    panes: [
      'editor',
      {
        id: 'player',
        type: 'player',
        platform: 'web',
        style: { display: 'none' },
      },
    ],
  },
  javascript: {
    code: DefaultCode.javaScript,
    panes: [
      'editor',
      {
        id: 'player',
        type: 'player',
        platform: 'web',
        style: { display: 'none' },
      },
    ],
    playground: {
      enabled: true,
      inspector: 'browser',
      renderReactElements: true,
      debounceDuration: 200,
      instrumentExpressionStatements: false,
    },
  },
  typescript: {
    code: DefaultCode.javaScript,
    environment: 'javascript',
    compiler: {
      type: 'tsc',
    },
    panes: [
      'editor',
      {
        id: 'player',
        type: 'player',
        platform: 'web',
        style: { display: 'none' },
      },
    ],
    playground: {
      enabled: true,
      inspector: 'browser',
      renderReactElements: true,
      debounceDuration: 200,
      instrumentExpressionStatements: false,
    },
    typescript: {
      enabled: true,
    },
  },
  react: {
    code: DefaultCode.react,
    panes: ['editor', { id: 'player', type: 'player', platform: 'web' }],
    styles: {
      playerApp: {
        width: '100%',
        height: '100%',
      },
    },
  },
  ['react-native']: {},
}

const importRe = /import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:(?:"(.*?)")|(?:'(.*?)'))[\s]*?(?:;|$|)/gm

function findImports(code: string) {
  const imports: string[] = []

  let match
  while ((match = importRe.exec(code))) {
    const name = match[1] || match[2]

    // Check if this import looks like a module name (and not a relative import)
    if (name && (name.startsWith('@') || name.match(/^[a-zA-Z]/))) {
      imports.push(name)
    }
  }

  return imports
}

function detectAllDependencies(files: string[]) {
  const allImports: string[] = []

  files.forEach((code) => {
    const imports = findImports(code)

    for (let value of imports) {
      if (allImports.indexOf(value) === -1) {
        allImports.push(value)
      }
    }
  })

  return allImports
}

export function normalize(options: PublicOptions): InternalOptions {
  const preset = options.preset || 'javascript'

  let {
    environment = preset,
    title = '',
    code = DefaultCode.reactNative,
    files = {},
    entry,
    initialTab,
    strings: rawStrings,
    css = '', // was workspaceCSS
    _css = '',
    styles = Object.assign({}, presetOptions[preset]?.styles, options.styles),
    fullscreen = false,
    codesandbox = false,
    openInNewWindow = false,
    sharedEnvironment = false,
    reloadMode = 'soft',
    panes = ['editor', 'player'],
    responsivePaneSets = [],
    workspaces = [],
    compiler: rawCompiler,
    playground: rawPlayground,
    typescript: rawTypescript,
    detectDependencies = true,
    targetOrigin = '',
  } = Object.assign({}, presetOptions[preset], options)

  const compiler = {
    ...defaults.compiler,
    ...presetOptions[preset].compiler,
    ...rawCompiler,
  }
  const playground = {
    ...defaults.playground,
    ...presetOptions[preset].playground,
    ...rawPlayground,
  }
  const typescript = {
    ...defaults.typescript,
    ...presetOptions[preset].typescript,
    ...rawTypescript,
  }

  if (!entry) {
    entry =
      environment === 'python'
        ? 'main.py'
        : environment === 'html'
        ? 'index.html'
        : typescript.enabled
        ? 'index.tsx'
        : 'index.js'
  }

  if (Object.keys(files).length > 0) {
    // If entry file is invalid or not given, choose the first file
    if (!files.hasOwnProperty(entry)) {
      entry = Object.keys(files)[0]
    }
  } else {
    // If no files are given, use the code param
    files = { [entry]: code }
  }

  // If initial tab is invalid or not given, use the entry file
  if (!initialTab || !files.hasOwnProperty(initialTab)) {
    initialTab = entry
  }

  const normalizedPaneSets: ResponsivePaneSet[] = [
    ...responsivePaneSets,
    {
      panes,
      maxWidth: Infinity,
    },
  ].map((set) => ({
    ...set,
    panes: set.panes.map((pane) => normalizePane(pane, options)),
  }))

  return {
    environmentName: environment,
    title,
    files,
    entry,
    initialTab,
    css,
    _css,
    styles,
    strings: Object.assign({}, userInterfaceStrings, rawStrings),
    reloadMode,
    codesandbox,
    openInNewWindow,
    fullscreen,
    sharedEnvironment,
    responsivePaneSets: normalizedPaneSets,
    workspaces,
    playground,
    typescript,
    detectedModules: detectDependencies
      ? detectAllDependencies(
          Object.values(files).concat(
            ...workspaces.map((workspace) =>
              Object.values(workspace.workspace.files)
            )
          )
        )
      : [],
    targetOrigin,
    compiler,
  }
}

/**
 * Get every file name from every option
 */
function getFileNames(options: InternalOptions): string[] {
  const names = Object.keys(options.files).concat(
    ...options.workspaces.map((workspace) =>
      Object.keys(workspace.workspace.files)
    )
  )

  return names
}

/**
 * Get every file extension in options
 */
export function getFileExtensions(options: InternalOptions): string[] {
  return getFileNames(options).map((filename) => extname(filename))
}
