import installGlobalHook from 'react-devtools/backend/installGlobalHook'
import installRelayHook from 'react-devtools/plugins/Relay/installRelayHook'

import Agent from 'react-devtools/agent/Agent'
import BananaSlugBackendManager from 'react-devtools/plugins/BananaSlug/BananaSlugBackendManager'
import Bridge from 'react-devtools/agent/Bridge'
import setupHighlighter from 'react-devtools/frontend/Highlighter/setup'
import setupRelay from 'react-devtools/plugins/Relay/backend'
import inject from 'react-devtools/agent/inject'

installGlobalHook(window)
installRelayHook(window)

const wall = {
  listen(fn) {
    window.addEventListener('message', evt => fn(evt.data))
  },
  send(data) {
    window.parent.postMessage(data, '*')
  },
}

const bridge = new Bridge(wall)
const agent = new Agent(window)
agent.addBridge(bridge)

inject(window.__REACT_DEVTOOLS_GLOBAL_HOOK__, agent)

setupHighlighter(agent, true)
setupRelay(bridge, agent, window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

BananaSlugBackendManager.init(agent)
