import './styles/reset.css'
import 'codemirror/lib/codemirror.css'
import './styles/codemirror-theme.css'
import './styles/index.css' // Load after CodeMirror, since it overrides defaults

import React from 'react'
import ReactDOM from 'react-dom'

import { getHashString, buildHashString } from './utils/HashString'
import { prefixAndApply } from './utils/Styles'
import { appendCSS } from './utils/CSS'
import { normalize, PublicOptions, getFileExtensions } from './utils/options'
import App from './components/workspace/App'
import { OptionsProvider } from './contexts/OptionsContext'

const { data = '{}', preset } = getHashString()

const publicOptions: PublicOptions = JSON.parse(data)

if (preset) {
  publicOptions.preset = decodeURIComponent(preset)
}

const internalOptions = normalize(publicOptions)

const { css, _css, targetOrigin, ...rest } = internalOptions

const documentCSS = css || _css

if (documentCSS) {
  appendCSS(document, documentCSS)
}

const mount = document.getElementById('player-root') as HTMLDivElement

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

function render() {
  ReactDOM.render(
    <OptionsProvider value={internalOptions}>
      <App onChange={onChange} {...rest} />
    </OptionsProvider>,
    mount
  )
}

const extensions = getFileExtensions(internalOptions)
const editorModes: Promise<void>[] = []

if (extensions.includes('.py')) {
  editorModes.push(import('codemirror/mode/python/python' as any))
}
if (extensions.includes('.html')) {
  editorModes.push(import('codemirror/mode/htmlmixed/htmlmixed' as any))
}
if (extensions.includes('.css')) {
  editorModes.push(import('codemirror/mode/css/css' as any))
}

Promise.all(editorModes).then(render)

function onChange(files: Record<string, string>) {
  const merged = {
    ...publicOptions,
    ...(publicOptions.files
      ? { files }
      : { code: files[Object.keys(files)[0]] }),
  }

  if (preset) {
    delete merged.preset
  }

  const data = JSON.stringify(merged)

  const hashString = buildHashString({ ...(preset ? { preset } : {}), data })

  if (targetOrigin && parent) {
    parent.postMessage(data, targetOrigin)
  }

  try {
    history.replaceState({}, '', hashString)
  } catch (e) {
    // Browser doesn't support pushState
  }
}
