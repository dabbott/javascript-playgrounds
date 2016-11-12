# React Native Web Player
Run react native apps in your browser!

[Try it out!](https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html#title=React%20Native%20Web%20Player)

### Upgrade Instructions

Versions below `1.2.4` were hosted via `unpkg.com` (aka `npmcdn.com`). This host no longer supports serving static files. Please update your `iframe` url to point to `//cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html`.

### Instructions

Include the web player in an iframe.

```html
<iframe width="880" height="425" frameborder="0" src="//cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html"></iframe>
```

The iframe accepts the following parameters *after the hash* in the url:

- `code` - The code to show/run in the player. Defaults to the sample app.
- `title` - An optional title for the player. By default, there is no title.
- `width` - The width of the device. Defaults to `210`.
- `scale` - Zoom the device screen. Defaults to `1`.
- `platform` - One of `ios` or `android`. Defaults to `ios`. Currently this changes the phone image, but may also have an effect on how the code is executed in the future.
- `assetRoot` - Specifies the root url for asset `require`s. E.g. to require `http://localhost:8080/images/hello.png`, you could set `assetRoot=http%3A%2F%2Flocalhost%3A8080%2F` and write `require('./images/hello.png')` in your code.
- `vendorComponents` - JSON encoded array of 3rd party components to make available to the sandbox. The format is an array of a 3-element arrays. The first element is the `require()` name, the second element is the global namespace location (e.g. `window.moment`), and the third element is the source url. E.g. to load moment.js: set `vendorComponents` to the url-encoded value `encodeURIComponent('[["moment", "moment", "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js"]]')`

The easiest way to set the `code` parameter is to edit the code in the web player and copy and paste the url when you're done (the url updates automatically as you type).

Alternately, you can manually url-encode the parameters. You can do so via the JavaScript console.
```JavaScript
encodeURIComponent('Hello World')
# => "Hello%20World"
```

### Hosting

This project contains static assets that run standalone in the browser. You don't need a server, unless you want to host the assets yourself.

##### MaxCDN

The recommended host is rawgit + MaxCDN. MaxCDN is highly performant and serves over `http` and `https`. The examples in this readme all point to:

```html
<iframe width="880" height="425" frameborder="0" src="//cdn.rawgit.com/dabbott/react-native-web-player/v1.4.0/index.html"></iframe>
```

##### gh-pages

If you prefer, you may access the gh-pages branch directly. This has the advantage of always serving you the latest version, but the drawback of potentially failing on major API changes (along with slower download speeds for the assets).

```html
<iframe width="880" height="425" frameborder="0" src="//dabbott.github.io/react-native-web-player/"></iframe>
```

### Examples

- Custom code - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html#platform=ios&code=import%20React%2C%20%7B%20Component%2C%20%7D%20from%20'react'%3B%0Aimport%20%7B%20AppRegistry%2C%20Text%2C%20%7D%20from%20'react-native'%3B%0A%0Aconst%20App%20%3D%20()%20%3D%3E%20%3CText%3EHello%20World%3C%2FText%3E%3B%0A%0AAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20App)%3B
- Android device - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html#platform=android
- Custom title - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html#title=Hello%20Title
- Load moment.js - https://cdn.rawgit.com/dabbott/react-native-web-player/gh-v1.4.0/index.html#title=moment.js&vendorComponents=%5B%5B%22moment%22%2C%20%22moment%22%2C%20%22https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fmoment.js%2F2.14.1%2Fmoment.min.js%22%5D%5D&code=import%20React%2C%20%7B%20Component%2C%20%7D%20from%20'react'%3B%0Aimport%20%7B%0A%20%20AppRegistry%2C%0A%20%20StyleSheet%2C%0A%20%20Text%2C%0A%20%20View%2C%0A%7D%20from%20'react-native'%3B%0A%0Aconst%20moment%20%3D%20require('moment')%0A%0Aclass%20App%20extends%20Component%20%7B%0A%20%20render()%20%7B%0A%20%20%20%20return%20(%0A%20%20%20%20%20%20%3CView%20style%3D%7Bstyles.container%7D%3E%0A%20%20%20%20%20%20%20%20%3CText%20style%3D%7Bstyles.welcome%7D%3E%0A%20%20%20%20%20%20%20%20%20%20%7Bmoment().format('MMMM%20Do%20YYYY%2C%20h%3Amm%3Ass%20a')%7D%0A%20%20%20%20%20%20%20%20%3C%2FText%3E%0A%20%20%20%20%20%20%3C%2FView%3E%0A%20%20%20%20)%3B%0A%20%20%7D%0A%7D%0A%0Aconst%20styles%20%3D%20StyleSheet.create(%7B%0A%20%20container%3A%20%7B%0A%20%20%20%20flex%3A%201%2C%0A%20%20%20%20justifyContent%3A%20'center'%2C%0A%20%20%20%20alignItems%3A%20'center'%2C%0A%20%20%20%20backgroundColor%3A%20'%23F5FCFF'%2C%0A%20%20%7D%2C%0A%20%20welcome%3A%20%7B%0A%20%20%20%20fontSize%3A%2016%2C%0A%20%20%20%20textAlign%3A%20'center'%2C%0A%20%20%20%20margin%3A%2010%2C%0A%20%20%7D%2C%0A%7D)%3B%0A%0AAppRegistry.registerComponent('App'%2C%20()%20%3D%3E%20App)%3B

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
make TAG=v1.4.0
```

### License
BSD
