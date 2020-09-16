import './styles/reset.css'
import 'codemirror/lib/codemirror.css'
import './styles/codemirror-theme.css'
import './styles/index.css' // Load after CodeMirror, since it overrides defaults

import React from 'react'
import ReactDOM from 'react-dom'

import { getHashString, buildHashString } from './utils/HashString'
import { prefixAndApply } from './utils/Styles'
import { appendCSS } from './utils/CSS'
import { normalize, InternalOptions, PublicOptions } from './utils/options'
import App from './components/workspace/App'

const { data = '{}', preset } = getHashString()

const publicOptions: PublicOptions = JSON.parse(data)

if (preset) {
  publicOptions.preset = decodeURIComponent(preset)
}

const { css, targetOrigin, ...rest }: InternalOptions = normalize(publicOptions)

if (css) {
  appendCSS(css)
}

const mount = document.getElementById('player-root') as HTMLDivElement

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(<App onChange={onChange} {...rest} />, mount)

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
