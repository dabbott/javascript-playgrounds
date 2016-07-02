import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'
import Panel from 'react-devtools/frontend/Panel'

const styles = prefixObject({
  container: {
    flex: '0 0 300px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderTop: '1px solid rgb(238,238,238)',
  },
})

@pureRender
export default class extends Component {

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    const {iframe} = this.props

    if (iframe) {
      this.start(iframe)
    }
  }

  componentDidUpdate(prevProps) {
    const {iframe} = this.props

    if (iframe && iframe !== prevProps.iframe) {
      this.start(iframe)
    }
  }

  start({contentWindow}) {
    this.setState({
      alreadyFoundReact: true,
      inject(done) {
        const wall = {
          listen(fn) {
            contentWindow.parent.addEventListener('message', evt => fn(evt.data))
          },
          send(data) {
            contentWindow.postMessage(data, '*')
          },
        }
        done(wall)
      },
    })
  }

  render() {
    const {alreadyFoundReact} = this.state

    return (
      <div style={styles.container}>
        {alreadyFoundReact && (
          <Panel {...this.state} />
        )}
      </div>
    )
  }
}
