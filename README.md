# React Native Web Player
Run react native apps in your browser!

[Try it out!](https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#title=React%20Native%20Web%20Player)

### About

This project uses [`react-native-web`](https://github.com/necolas/react-native-web) to create an environment for learning and experimenting with React Native.  

The web player is implemented as an `iframe` for easy, performant inclusion in any webpage. Transpilation is done in a web worker so the main thread isn't blocked as the page loads.

### Usage

The web player may be included in your site either as a React component or directly as an `iframe`.

#### As React Component

If you're using React:

```
npm install --save react-native-web-player
```

Then:

```js
import WebPlayer from 'react-native-web-player'

export default () => (
  <WebPlayer
    style={{width: 800, height: 500}}
  />
)
```

This component is a simple wrapper around the `iframe` that handles encoding parameters for you. While it passes most props along to the `iframe`, it has a few extra props:

- **`style`** - The style of the `div` which wraps the `iframe` (the iframe has `100%` width and height).
- **`className`** - The className of the `div` which wraps the `iframe`.
- **`baseURL`** - Optionally, specify a custom url to load the player from. This url should not include a hash. Defaults to the `//cdn.rawgit.com` url as described below.

A `umd` build of this React component is available in the `dist` directory.

#### As `iframe`

If you're not using React, include the web player in an `iframe`.

```html
<iframe width="880" height="425" frameborder="0" src="//cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html"></iframe>
```

### Parameters

The React component accepts the following props. Props don't need to be URI-encoded or JSON-encoded, as this is handled automatically.

The `iframe` accepts the following parameters *after the hash* in the url. You must URI encode every parameter.

- **`code`** - The code to show/run in the player. Defaults to the sample app.
- **`title`** - An optional title for the player. By default, there is no title.
- **`width`** - The width of the device. Defaults to `210`.
- **`scale`** - Zoom the device screen. Defaults to `1`.
- **`platform`** - One of `ios` or `android`. Defaults to `ios`. Currently this changes the phone image, but may also have an effect on how the code is executed in the future.
- **`entry`** - The filename of the entry file. This is only relevant when showing multiple files with the `files` parameter. Defaults to `index.js`.
- **`initialTab`** - The filename of the tab to show by default. This is only relevant when showing multiple files with the `files` parameter. Defaults to `index.js`.
- **`fullscreen`** - Show a button to enable fullscreen editing. Defaults to `false`. Note that the iframe must have the `allowfullscreen` attribute for this to work.
- **`assetRoot`** - Specifies the root url for asset `require`s. E.g. to require `http://localhost:8080/images/hello.png`, you could set `assetRoot` to `'http://localhost:8080/'` and write `require('./images/hello.png')` in your code.
- **`transpilerTitle`** - An optional title for the transpiler output pane. By default, there is no title.
- **`playerTitle`** - An optional title for the player pane. By default, there is no title.
- **`workspaceCSS`** - An optional CSS string to apply to the workspace `iframe`.
- **`playerCSS`** - An optional CSS string to apply to the player's `iframe`.
- **`playerStyleSheet`** - One of `reset` or `none`. When `reset`, the meyerweb CSS reset is applied to the player's `iframe`. Defaults to `reset`.

When using the iframe directly, the following parameters must be JSON encoded *and then also* URI encoded:

- **`files`** - Array of files to show, one per tab. The format is an array of 2-element arrays, where the first element is the filename (e.g. `index.js`) and the second is the code.

  Example usage: `[['index.js', 'console.log(1)'], ['foo.js', 'console.log(2)']]`

  Files may be required from one another by name. E.g. if the files are `index.js` and `helpers.js`, in the code of `index.js` you may write `import Foo from './helpers'` to use its default export.

  Use the `entry` and `initialTab` parameters to control which file is executed first and which tab is shown by default.

- **`panes`** - Array of panes to show. Each element is one of:
`editor`, `player`, `transpiler`.

  The default value is: `['editor', 'player']`

- **`vendorComponents`** - Array of 3rd party components to make available to the sandbox. The format is an array of either 2-element or 3-element arrays.

  - To use a CommonJS `require`-style loader, pass a 2-element array, where the first element is the `require()` name, and the second is the source url. E.g. to load moment.js: set `vendorComponents` to the value `[['moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js']]`

  - To load a component as a property on `window`, pass a 3-element array, where the first element is the `require()` name, the second element is the window property name (e.g. `window.moment`), and the third element is the source url. E.g. to load moment.js: set `vendorComponents` to the value `[['moment', 'moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js']]`

- **`styles`** - An object containing style objects. If you're familiar with React Native, this is the `foo` in `StyleSheet.create(foo)`. Styles passed will be vendor-prefixed automatically. The following named styles can be used to override default styling.

  - `header`
  - `headerText`
  - `tab`
  - `tabText`
  - `tabTextActive`
  - `transpilerHeader`
  - `transpilerHeaderText`
  - `playerPane`
  - `playerHeader`
  - `playerHeaderText`

  Example usage: `{header: {backgroundColor: 'red'}}`

##### Notes on setting parameters:

When used as an `iframe`, the easiest way to set the `code` parameter is to edit the code in the web player and copy and paste the url when you're done (the url updates automatically as you type).

Alternately, you can manually url-encode the parameters. You can do so programmatically or via the JavaScript console.
```JavaScript
encodeURIComponent('Hello World')
# => "Hello%20World"
```

### Hosting

This project contains static assets that run standalone in the browser. You don't need a server, unless you want to host the assets yourself.

##### MaxCDN

The recommended host is rawgit + MaxCDN. MaxCDN is highly performant and serves over `http` and `https`. The examples in this readme all point to:

```html
<iframe width="880" height="425" frameborder="0" src="//cdn.rawgit.com/dabbott/react-native-web-player/v1.9.1/index.html"></iframe>
```

##### gh-pages

If you prefer, you may access the gh-pages branch directly. This has the advantage of always serving you the latest version, but the drawback of potentially failing on major API changes (along with slower download speeds for the assets).

```html
<iframe width="880" height="425" frameborder="0" src="//dabbott.github.io/react-native-web-player/"></iframe>
```

### Basic Examples

- Custom code - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#platform=ios&code=import%20React%2C%20%7B%20Component%2C%20%7D%20from%20'react'%3B%0Aimport%20%7B%20AppRegistry%2C%20Text%2C%20%7D%20from%20'react-native'%3B%0A%0Aconst%20App%20%3D%20()%20%3D%3E%20%3CText%3EHello%20World%3C%2FText%3E%3B%0A%0AAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20App)%3B
- Android device - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#platform=android
- Custom title - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#title=Hello%20Title
- Load moment.js - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#title=moment.js&vendorComponents=%5B%5B%22moment%22%2C%20%22moment%22%2C%20%22https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fmoment.js%2F2.14.1%2Fmoment.min.js%22%5D%5D&code=import%20React%2C%20%7B%20Component%2C%20%7D%20from%20'react'%3B%0Aimport%20%7B%0A%20%20AppRegistry%2C%0A%20%20StyleSheet%2C%0A%20%20Text%2C%0A%20%20View%2C%0A%7D%20from%20'react-native'%3B%0A%0Aconst%20moment%20%3D%20require('moment')%0A%0Aclass%20App%20extends%20Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3CView%20style%3D%7Bstyles.container%7D%3E%0A%20%20%20%20%20%20%20%20%3CText%20style%3D%7Bstyles.welcome%7D%3E%0A%20%20%20%20%20%20%20%20%20%20%7Bmoment().format('MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a')%7D%0A%20%20%20%20%20%20%20%20%3C%2FText%3E%0A%20%20%20%20%20%20%3C%2FView%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0A%0Aconst%20styles%20%3D%20StyleSheet.create(%7B%0A%20%20container%3A%20%7B%0A%20%20%20%20flex%3A%201%2C%0A%20%20%20%20justifyContent%3A%20'center'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%20%20backgroundColor%3A%20'%23F5FCFF'%2C%0A%20%20%7D%2C%0A%20%20welcome%3A%20%7B%0A%20%20%20%20fontSize%3A%2016%2C%0A%20%20%20%20textAlign%3A%20'center'%2C%0A%20%20%20%20margin%3A%2010%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0AAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20App)%3B

### Advanced Examples

[React/Redux To-do list with persistence][1]

[Transpiled output for ES6 const and let][2]

##### Notes on advanced examples:

These examples are taken from [React Native Express](www.reactnativeexpress.com).

Advanced examples tend to have extremely long URLs which load successfully in an `iframe` but sometimes fail to load when opened by clicking a link.

## Development

### Run

```
npm install
npm run start
=> localhost:8080
```

### Build

```
npm run build
```

### Publish

First publish to npm.

```
npm version (major|minor|patch)
npm publish
```

Then publish to gh-pages and make a special tagged release for hosting via CDN.

```
# Point to the latest release
make TAG=v1.9.1
```

### License
BSD


[1]:http://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#width=260&scale=0.75&fullscreen=true&styles=%7B%22tab%22%3A%7B%22backgroundColor%22%3A%22rgb(250%2C250%2C250)%22%7D%2C%22header%22%3A%7B%22backgroundColor%22%3A%22rgb(250%2C250%2C250)%22%2C%22boxShadow%22%3A%22rgba(0%2C%200%2C%200%2C%200.2)%200px%201px%201px%22%2C%22zIndex%22%3A10%7D%2C%22headerText%22%3A%7B%22color%22%3A%22%23AAA%22%2C%22fontWeight%22%3A%22normal%22%7D%2C%22transpilerHeader%22%3A%7B%22backgroundColor%22%3A%22rgb(240%2C240%2C240)%22%2C%22boxShadow%22%3A%22rgba(0%2C%200%2C%200%2C%200.2)%200px%201px%201px%22%2C%22zIndex%22%3A10%7D%2C%22transpilerHeaderText%22%3A%7B%22color%22%3A%22%23888%22%2C%22fontWeight%22%3A%22normal%22%7D%2C%22tabText%22%3A%7B%22color%22%3A%22%23AAA%22%7D%2C%22tabTextActive%22%3A%7B%22color%22%3A%22%23000%22%7D%7D&files=%5B%5B%22index.js%22%2C%22import%20%7B%20AppRegistry%2C%20View%20%7D%20from%20'react-native'%5Cnimport%20%7B%20createStore%20%7D%20from%20'redux'%5Cnimport%20%7B%20Provider%20%7D%20from%20'react-redux'%5Cnimport%20%7B%20persistStore%2C%20autoRehydrate%20%7D%20from%20'redux-persist'%5Cn%5Cn%2F%2F%20Import%20the%20reducer%20and%20create%20a%20store%5Cnimport%20%7B%20reducer%20%7D%20from%20'.%2FtodoListRedux'%5Cn%5Cn%2F%2F%20Add%20the%20autoRehydrate%20middleware%20to%20your%20redux%20store%5Cnconst%20store%20%3D%20createStore(reducer%2C%20undefined%2C%20autoRehydrate())%5Cn%5Cn%2F%2F%20Enable%20persistence%5CnpersistStore(store)%5Cn%5Cn%2F%2F%20Import%20the%20App%20container%20component%5Cnimport%20App%20from%20'.%2FApp'%5Cn%5Cn%2F%2F%20Pass%20the%20store%20into%20the%20Provider%5Cnconst%20AppWithStore%20%3D%20()%20%3D%3E%20(%5Cn%20%20%3CProvider%20store%3D%7Bstore%7D%3E%5Cn%20%20%20%20%3CApp%20%2F%3E%5Cn%20%20%3C%2FProvider%3E%5Cn)%5Cn%5CnAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20AppWithStore)%5Cn%22%5D%2C%5B%22todoListRedux.js%22%2C%22%2F%2F%20The%20types%20of%20actions%20that%20you%20can%20dispatch%20to%20modify%20the%20state%20of%20the%20store%5Cnexport%20const%20types%20%3D%20%7B%5Cn%20%20ADD%3A%20'ADD'%2C%5Cn%20%20REMOVE%3A%20'REMOVE'%2C%5Cn%7D%5Cn%5Cn%2F%2F%20Helper%20functions%20to%20dispatch%20actions%2C%20optionally%20with%20payloads%5Cnexport%20const%20actionCreators%20%3D%20%7B%5Cn%20%20add%3A%20(item)%20%3D%3E%20%7B%5Cn%20%20%20%20return%20%7Btype%3A%20types.ADD%2C%20payload%3A%20item%7D%5Cn%20%20%7D%2C%5Cn%20%20remove%3A%20(index)%20%3D%3E%20%7B%5Cn%20%20%20%20return%20%7Btype%3A%20types.REMOVE%2C%20payload%3A%20index%7D%5Cn%20%20%7D%5Cn%7D%5Cn%5Cn%2F%2F%20Initial%20state%20of%20the%20store%5Cnconst%20initialState%20%3D%20%7B%5Cn%20%20todos%3A%20%5B'Click%20to%20remove'%2C%20'Learn%20React%20Native'%2C%20'Write%20Code'%2C%20'Ship%20App'%5D%2C%5Cn%7D%5Cn%5Cn%2F%2F%20Function%20to%20handle%20actions%20and%20update%20the%20state%20of%20the%20store.%5Cn%2F%2F%20Notes%3A%5Cn%2F%2F%20-%20The%20reducer%20must%20return%20a%20new%20state%20object.%20It%20must%20never%20modify%5Cn%2F%2F%20%20%20the%20state%20object.%20State%20objects%20should%20be%20treated%20as%20immutable.%5Cn%2F%2F%20-%20We%20set%20%5C%5C%60state%5C%5C%60%20to%20our%20%5C%5C%60initialState%5C%5C%60%20by%20default.%20Redux%20will%5Cn%2F%2F%20%20%20call%20reducer()%20with%20no%20state%20on%20startup%2C%20and%20we%20are%20expected%20to%5Cn%2F%2F%20%20%20return%20the%20initial%20state%20of%20the%20app%20in%20this%20case.%5Cnexport%20const%20reducer%20%3D%20(state%20%3D%20initialState%2C%20action)%20%3D%3E%20%7B%5Cn%20%20const%20%7Btodos%7D%20%3D%20state%5Cn%20%20const%20%7Btype%2C%20payload%7D%20%3D%20action%5Cn%5Cn%20%20switch%20(type)%20%7B%5Cn%20%20%20%20case%20types.ADD%3A%20%7B%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20...state%2C%5Cn%20%20%20%20%20%20%20%20todos%3A%20%5Bpayload%2C%20...todos%5D%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%20%20case%20types.REMOVE%3A%20%7B%5Cn%20%20%20%20%20%20return%20%7B%5Cn%20%20%20%20%20%20%20%20...state%2C%5Cn%20%20%20%20%20%20%20%20todos%3A%20todos.filter((todo%2C%20i)%20%3D%3E%20i%20!%3D%3D%20payload)%2C%5Cn%20%20%20%20%20%20%7D%5Cn%20%20%20%20%7D%5Cn%20%20%7D%5Cn%5Cn%20%20return%20state%5Cn%7D%5Cn%22%5D%2C%5B%22App.js%22%2C%22import%20React%2C%20%7B%20Component%20%7D%20from%20'react'%5Cnimport%20%7B%20AppRegistry%2C%20View%20%7D%20from%20'react-native'%5Cnimport%20%7B%20connect%20%7D%20from%20'react-redux'%5Cn%5Cnimport%20%7B%20actionCreators%20%7D%20from%20'.%2FtodoListRedux'%5Cnimport%20List%20from%20'.%2FList'%5Cnimport%20Input%20from%20'.%2FInput'%5Cnimport%20Title%20from%20'.%2FTitle'%5Cn%5Cnconst%20mapStateToProps%20%3D%20(state)%20%3D%3E%20(%7B%5Cn%20%20todos%3A%20state.todos%2C%5Cn%7D)%5Cn%5Cnclass%20App%20extends%20Component%20%7B%5Cn%5Cn%20%20onAddTodo%20%3D%20(text)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20%7Bdispatch%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20dispatch(actionCreators.add(text))%5Cn%20%20%7D%5Cn%5Cn%20%20onRemoveTodo%20%3D%20(index)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20%7Bdispatch%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20dispatch(actionCreators.remove(index))%5Cn%20%20%7D%5Cn%5Cn%20%20render()%20%7B%5Cn%20%20%20%20const%20%7Btodos%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20return%20(%5Cn%20%20%20%20%20%20%3CView%3E%5Cn%20%20%20%20%20%20%20%20%3CTitle%3E%5Cn%20%20%20%20%20%20%20%20%20%20To-Do%20List%5Cn%20%20%20%20%20%20%20%20%3C%2FTitle%3E%5Cn%20%20%20%20%20%20%20%20%3CInput%5Cn%20%20%20%20%20%20%20%20%20%20placeholder%3D%7B'Type%20a%20todo%2C%20then%20hit%20enter!'%7D%5Cn%20%20%20%20%20%20%20%20%20%20onSubmitEditing%3D%7Bthis.onAddTodo%7D%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3CList%5Cn%20%20%20%20%20%20%20%20%20%20list%3D%7Btodos%7D%5Cn%20%20%20%20%20%20%20%20%20%20onPressItem%3D%7Bthis.onRemoveTodo%7D%5Cn%20%20%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2FView%3E%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnexport%20default%20connect(mapStateToProps)(App)%5Cn%22%5D%2C%5B%22List.js%22%2C%22import%20React%2C%20%7B%20Component%20%7D%20from%20'react'%5Cnimport%20%7B%20AppRegistry%2C%20View%2C%20TouchableOpacity%2C%20Text%2C%20StyleSheet%20%7D%20from%20'react-native'%5Cn%5Cnexport%20default%20class%20List%20extends%20Component%20%7B%5Cn%5Cn%20%20renderItem%20%3D%20(text%2C%20i)%20%3D%3E%20%7B%5Cn%20%20%20%20const%20%7BonPressItem%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20return%20(%5Cn%20%20%20%20%20%20%3CTouchableOpacity%5Cn%20%20%20%20%20%20%20%20style%3D%7Bstyles.item%7D%5Cn%20%20%20%20%20%20%20%20onPress%3D%7B()%20%3D%3E%20onPressItem(i)%7D%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%20%20%3CText%3E%7Btext%7D%3C%2FText%3E%5Cn%20%20%20%20%20%20%3C%2FTouchableOpacity%3E%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%5Cn%20%20render()%20%7B%5Cn%20%20%20%20const%20%7Blist%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20return%20(%5Cn%20%20%20%20%20%20%3CView%3E%5Cn%20%20%20%20%20%20%20%20%7Blist.map(this.renderItem)%7D%5Cn%20%20%20%20%20%20%3C%2FView%3E%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20styles%20%3D%20StyleSheet.create(%7B%5Cn%20%20item%3A%20%7B%5Cn%20%20%20%20backgroundColor%3A%20'whitesmoke'%2C%5Cn%20%20%20%20marginBottom%3A%205%2C%5Cn%20%20%20%20padding%3A%2015%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%22%5D%2C%5B%22Input.js%22%2C%22import%20React%2C%20%7B%20Component%20%7D%20from%20'react'%5Cnimport%20%7B%20AppRegistry%2C%20TextInput%2C%20StyleSheet%20%7D%20from%20'react-native'%5Cn%5Cnexport%20default%20class%20Input%20extends%20Component%20%7B%5Cn%5Cn%20%20state%20%3D%20%7B%5Cn%20%20%20%20text%3A%20''%2C%5Cn%20%20%7D%5Cn%5Cn%20%20onChangeText%20%3D%20(text)%20%3D%3E%20this.setState(%7Btext%7D)%5Cn%5Cn%20%20onSubmitEditing%20%3D%20()%20%3D%3E%20%7B%5Cn%20%20%20%20const%20%7BonSubmitEditing%7D%20%3D%20this.props%5Cn%20%20%20%20const%20%7Btext%7D%20%3D%20this.state%5Cn%5Cn%20%20%20%20if%20(!text)%20return%20%2F%2F%20Don't%20submit%20if%20empty%5Cn%5Cn%20%20%20%20onSubmitEditing(text)%5Cn%20%20%20%20this.setState(%7Btext%3A%20''%7D)%5Cn%20%20%7D%5Cn%5Cn%20%20render()%20%7B%5Cn%20%20%20%20const%20%7BonSubmitEditing%2C%20placeholder%7D%20%3D%20this.props%5Cn%20%20%20%20const%20%7Btext%7D%20%3D%20this.state%5Cn%5Cn%20%20%20%20return%20(%5Cn%20%20%20%20%20%20%3CTextInput%5Cn%20%20%20%20%20%20%20%20style%3D%7Bstyles.input%7D%5Cn%20%20%20%20%20%20%20%20value%3D%7Btext%7D%5Cn%20%20%20%20%20%20%20%20placeholder%3D%7Bplaceholder%7D%5Cn%20%20%20%20%20%20%20%20onChangeText%3D%7Bthis.onChangeText%7D%5Cn%20%20%20%20%20%20%20%20onSubmitEditing%3D%7Bthis.onSubmitEditing%7D%5Cn%20%20%20%20%20%20%2F%3E%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20styles%20%3D%20StyleSheet.create(%7B%5Cn%20%20input%3A%20%7B%5Cn%20%20%20%20padding%3A%2015%2C%5Cn%20%20%20%20height%3A%2050%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%22%5D%2C%5B%22Title.js%22%2C%22import%20React%2C%20%7B%20Component%20%7D%20from%20'react'%5Cnimport%20%7B%20View%2C%20Text%2C%20StyleSheet%20%7D%20from%20'react-native'%5Cn%5Cnexport%20default%20class%20Title%20extends%20Component%20%7B%5Cn%5Cn%20%20render()%20%7B%5Cn%20%20%20%20const%20%7Bchildren%7D%20%3D%20this.props%5Cn%5Cn%20%20%20%20return%20(%5Cn%20%20%20%20%20%20%3CView%20style%3D%7Bstyles.header%7D%3E%5Cn%20%20%20%20%20%20%20%20%3CText%20style%3D%7Bstyles.title%7D%3E%7Bchildren%7D%3C%2FText%3E%5Cn%20%20%20%20%20%20%3C%2FView%3E%5Cn%20%20%20%20)%5Cn%20%20%7D%5Cn%7D%5Cn%5Cnconst%20styles%20%3D%20StyleSheet.create(%7B%5Cn%20%20header%3A%20%7B%5Cn%20%20%20%20backgroundColor%3A%20'skyblue'%2C%5Cn%20%20%20%20padding%3A%2015%2C%5Cn%20%20%7D%2C%5Cn%20%20title%3A%20%7B%5Cn%20%20%20%20textAlign%3A%20'center'%2C%5Cn%20%20%20%20color%3A%20'white'%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%22%5D%5D&vendorComponents=%5B%5B%22redux%22%2C%22Redux%22%2C%22https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fredux%2F3.6.0%2Fredux.min.js%22%5D%2C%5B%22react-redux%22%2C%22ReactRedux%22%2C%22https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Freact-redux%2F4.4.5%2Freact-redux.min.js%22%5D%2C%5B%22redux-persist%22%2C%22redux-persist%22%2C%22https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fredux-persist%2F4.0.0-alpha7%2Fredux-persist.js%22%5D%5D&panes=%5B%22editor%22%2C%22player%22%5D

[2]:http://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.9.1/index.html#width=260&scale=0.75&fullscreen=false&styles=%7B%22tab%22%3A%7B%22backgroundColor%22%3A%22rgb(250%2C250%2C250)%22%7D%2C%22header%22%3A%7B%22backgroundColor%22%3A%22rgb(250%2C250%2C250)%22%2C%22boxShadow%22%3A%22rgba(0%2C%200%2C%200%2C%200.2)%200px%201px%201px%22%2C%22zIndex%22%3A10%7D%2C%22headerText%22%3A%7B%22color%22%3A%22%23AAA%22%2C%22fontWeight%22%3A%22normal%22%7D%2C%22transpilerHeader%22%3A%7B%22backgroundColor%22%3A%22rgb(240%2C240%2C240)%22%2C%22boxShadow%22%3A%22rgba(0%2C%200%2C%200%2C%200.2)%200px%201px%201px%22%2C%22zIndex%22%3A10%7D%2C%22transpilerHeaderText%22%3A%7B%22color%22%3A%22%23888%22%2C%22fontWeight%22%3A%22normal%22%7D%2C%22tabText%22%3A%7B%22color%22%3A%22%23AAA%22%7D%2C%22tabTextActive%22%3A%7B%22color%22%3A%22%23000%22%7D%7D&title=Using%20const%20and%20let&code=const%20a%20%3D%201%0Alet%20b%20%3D%20'foo'%0A%0A%2F%2F%20Not%20allowed!%0A%2F%2F%20a%20%3D%202%0A%0A%2F%2F%20Ok!%0Ab%20%3D%20'bar'%0A%0Aif%20(true)%20%7B%0A%20%20const%20a%20%3D%203%0A%7D&panes=%5B%22editor%22%2C%22transpiler%22%5D&transpilerTitle=Output%20compiled%20with%20Babel
