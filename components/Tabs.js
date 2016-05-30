import React, { Component } from 'react'

const styles = {
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#3B3738',
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 13,
  },
  item: {
    color: '#AAA',
    lineHeight: '34px',
    borderTop: '3px solid transparent',
    borderBottom: '3px solid transparent',
    padding: '0 20px',
    cursor: 'pointer',
  },
}

styles.active = {
  ...styles.item,
  color: '#FFF',
  borderBottom: '3px solid #05A5D1',
}

export default class extends Component {

  static defaultProps = {
    tabs: [],
    active: null,
    onChange: () => {},
  }

  render() {
    const {tabs, active, onChange} = this.props

    return (
      <div style={styles.container}>
        {tabs.map((option, i) => {
          return (
            <div
              key={i}
              style={option === active ? styles.active : styles.item}
              onClick={onChange.bind(null, option)}>
              {option}
            </div>
          )
        })}
      </div>
    )
  }
}
