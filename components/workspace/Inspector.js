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

  static defaultProps = {
    onSelect: () => {},
  }

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
      inject: (done) => {
        const wall = {
          listen: (fn) => {
            contentWindow.parent.addEventListener('message', ({data}) => {
              fn(data)

              const {type, events} = data
              const {panel} = this.refs

              if (panel && type === 'many-events') {
                events.forEach(({type, evt}) => {
                  if (type === 'event' && evt === 'select') {
                    const store = this.refs.panel._store
                    const node = store.get(store.selected)

                    this.props.onSelect(node.get('key'))
                  }
                })
              }
            })
          },
          send: (data) => {
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
          <Panel ref={'panel'} {...this.state} />
        )}
      </div>
    )
  }
}
