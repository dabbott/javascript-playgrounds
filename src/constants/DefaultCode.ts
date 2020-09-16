export const javaScript = `console.log('Hello, playgrounds!')`

export const reactNative = `import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome to React Native!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
})
`

export const react = `import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  const style = {
    padding: '40px',
    textAlign: 'center',
    background: 'lightskyblue',
  }

  return <div style={style}>Welcome to React!</div>
}

ReactDOM.render(<App />, document.querySelector('#app'))
`
