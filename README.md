# React Native Web Player

Run react native apps in your browser!

[Try it out!](https://unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html#title=React%20Native%20Web%20Player)

### About

This project uses [`react-native-web`](https://github.com/necolas/react-native-web) to create an environment for learning and experimenting with React Native.

The web player is implemented as an `iframe` for easy, performant inclusion in any webpage. Babel and/or TypeScript run in a web worker so the main thread isn't blocked as the page loads.

### Usage

The web player may be included in your site either:

- [as a React component](#as-a-react-component)
- [directly as an `iframe`](#as-an-iframe)

#### As a React Component

If you're using React:

```bash
npm install --save react-native-web-player

# or

yarn add react-native-web-player
```

Then:

```js
import WebPlayer from 'react-native-web-player'

export default function App() {
  return <WebPlayer style={{ width: 800, height: 500 }} />
}
```

This component is a simple wrapper around the `iframe` that handles encoding parameters for you. While it passes most props along to the `iframe`, it has a few extra props:

- **`style`** - The style of the `div` which wraps the `iframe` (the iframe has `100%` width and height).
- **`className`** - The className of the `div` which wraps the `iframe`.
- **`baseURL`** - Optionally, specify a custom url to load the player from. This url should not include a hash. Defaults to the `unpkg.com` url as described below.

#### As an `iframe`

If you're not using React, include the web player in an `iframe`.

```html
<iframe
  width="880"
  height="425"
  frameborder="0"
  src="//unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html"
></iframe>
```

Configuration parameters should be passed as part of the hash string, after `#data=`. They should be JSON-encoded _and then_ URI-encoded:

```JavaScript
const parameters = { code: `console.log('Hello, world!')` }
const hashString = '#data=' + encodeURIComponent(JSON.stringify(parameters))
```

> When used as an `iframe`, the easiest way to set the `code` parameter is to edit the code in the web player and copy and paste the url when you're done (the url updates automatically as you type).

### Parameters

The web player accepts the following props/parameters.

- **`title`** - An optional title for the editor pane. By default, there is no title.
- **`code`** - The code to show/run in the player. Defaults to the sample app.
- **`files`** - A map of `{ [filename]: code }`. This will take precedence over `code` if given.
- **`entry`** - The filename of the file that runs first. This is only relevant when showing multiple files with the `files` parameter. Defaults to `index.js`, or `index.tsx` if TypeScript is enabled.
- **`initialTab`** - The filename of the tab to show by default. This is only relevant when showing multiple files with the `files` parameter. Defaults to the value of `entry`.
- **`css`** - An optional CSS string to apply within the workspace `iframe`.
- **`styles`** - An map of inline style objects, applied to various elements to customize the style of the UI. Example: `{ header: { backgroundColor: 'red' } }`
- **`sharedEnvironment`** - This affects how the iframes share data with one another, mainly for the "playgrounds" feature. When `true`, iframes will pass JavaScript objects back and forth, while when `false`, they'll pass serialized JSON. Defaults to `false`.
- **`fullscreen`** - Show a button to enable fullscreen editing (in most configurations of panes). Defaults to `false`. Note that the iframe must have the `allowfullscreen` attribute for this to work.
- **`playground`** - Settings for playgrounds (inline widgets that display runtime values)
  - **`enabled`** - Turn on playgrounds? Defaults to `false`
  - **`renderReactElements`** - Render React elements? If `false`, will print the React element object, e.g. `{ type, props, key }`, rather than render it. Defaults to `true`
  - **`debounceDuration`** - How frequently widgets update. A little delay helps keep the UI feeling smoother. Defaults to `200` milliseconds.
- **`typescript`** - TypeScript settings
  - **`enabled`** - Turn on TypeScript hover tooltip info? Defaults to `false`
  - **`libs`** - An array of default libraries to include, e.g. `'dom'` and `'es2015'`. We don't include some newer/esoteric ones by default, to reduce download size.
  - **`types`** - An array of additional type files to download. Each should be an object `{ name, url }`.
- **`workspaces`** - Add a tutorial-like sequence of sets of files, highlighting changes between each set. Each object in this array can contain: `{ title, description, workspace: { title, files, entry, initialTab } }`. Properties in the `workspace` object will override those given as top level parameters.
- **`panes`** - An array of UI panes to display. To display a pane without options, use a string. Otherwise, use an object with a `type` property. The available panes are: `'stack'`, `'editor'`, `'transpiler'`, `'player'`, `'workspaces'`, `'console'`. The default value is: `['editor', 'player']`. Note that there _must be_ a `player` pane for any code to run. For pane options, see below.
- **`responsivePaneSets`** - An array of `{ maxWidth, panes }` objects to show at different responsive breakpoints. The iframe will use the first set where the `maxWidth` is greater than the current window width. The top-level `panes` parameter has `maxWidth: Infinity` so that it's used by default if there's no matching set of panes.

### Pane options

Each pane supports pane-specific options. They all support:

- **`style`** - The inline styles for this specific pane, merged with those passed in the top-level `styles` object if given.

#### For `player` pane

Display the running app, optionally with the image of a phone around it.

| Title                     | Description                                                                                                                                                                                                                                                 | Default   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **`platform`**            | One of `ios`, `android`, or `web`. When `web`, no phone image is displayed.                                                                                                                                                                                 | `'ios'`   |
| **`width`**               | The width of the device.                                                                                                                                                                                                                                    | `210px`   |
| **`scale`**               | Zoom the device screen. This has no effect if the platform is `web`.                                                                                                                                                                                        | `1`       |
| **`assetRoot`**           | Specifies the root url for asset `require`s. E.g. to require `http://localhost:8080/images/hello.png`, you could set `assetRoot` to `'http://localhost:8080/'` and write `require('./images/hello.png')` in your code.                                      | `''`      |
| **`css`**                 | An optional CSS string to apply within the player's `iframe`.                                                                                                                                                                                               | `''`      |
| **`styleSheet`**          | One of `reset` or `none`. When `reset`, the meyerweb CSS reset is applied to the player's `iframe`.                                                                                                                                                         | `'reset'` |
| **`statusBarHeight`**     | Display a rectangle at the top of the phone screen, mimicking a status bar.                                                                                                                                                                                 | `0px`     |
| **`statusBarColor`**      | The color of the fake status bar.                                                                                                                                                                                                                           | `'black'` |
| **`prelude`**             | JavaScript code that runs before the entry file.                                                                                                                                                                                                            | `''`      |
| **`modules`**             | An array of external modules to make available to the sandbox. Each object in the array should be an object containing a `name` and `url`. As a shorthand, pass a string name to load a module from unpkg (`https://unpkg.com/${name}`). More detail below. | `[]`      |
| **`console`**             | Display an embedded console in this pane. See the `console` options below. Additionally, the embedded version of the console has the following properties...                                                                                                | `{}`      |
| **`console.visible`**     | Show the console?                                                                                                                                                                                                                                           | `false`   |
| **`console.maximized`**   | Show the console over the entire player?                                                                                                                                                                                                                    | `false`   |
| **`console.collapsible`** | Allow collapsing the console via a toggle button.                                                                                                                                                                                                           | `true`    |

##### Examples of loading modules:

- To load a CommonJS `require`-style module, the `name` is the `require(name)` name, and the second is the source url. E.g. to load moment.js: set `modules` to the value `[{ name: 'moment', url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js' }]`
- To load a component as a property on `window`, also pass a `globalName`, which will be the window property name (e.g. `window.moment`). E.g. to load moment.js this way: set `modules` to the value `[{ name: 'moment', globalName: 'moment', url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js' }]` | Ok |

#### For `console` pane

Show the output `console.log`, similar to the Chrome inspector. This can be a separate pane, or embedded in the player pane.

| Title                     | Description                                                | Default |
| ------------------------- | ---------------------------------------------------------- | ------- |
| **`showFileName`**        | Show the file name containing the `console.log`.           | `false` |
| **`showLineNumber`**      | Show the line number of the `console.log`.                 | `true`  |
| **`renderReactElements`** | Render React elements, instead of displaying element JSON. | `false` |

#### For `stack` pane

A nested stack of panes.

| Title          | Description                                                   | Default |
| -------------- | ------------------------------------------------------------- | ------- |
| **`children`** | An array of panes, just like the top level `panes` parameter. | `[]`    |

#### For `editor` pane

| Title       | Description                                                                                                                | Default |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | ------- |
| **`title`** | An optional title for the editor. By default, there is no title. This will override a top-level `title`, if one was given. | `''`    |

#### For `transpiler` pane

None at the moment.

#### For `workspaces` pane

None at the moment.

### Hosting

This project contains static assets that run standalone in the browser. You don't need a server, unless you want to host the assets yourself.

##### unpkg

The recommended host is https://unpkg.com, which is a CDN that serves content from the npm registry. The examples in this readme all point to:

```html
<iframe
  width="880"
  height="425"
  frameborder="0"
  src="//unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html"
></iframe>
```

### Basic Examples

These examples were created by loading the demo page and running roughly the following JS in the console:

```js
window.location.origin +
  '#data=' +
  encodeURIComponent(
    JSON.stringify({
      title: 'Custom title',
      panes: [
        'editor',
        { type: 'player', platform: 'android', modules: ['moment'] },
      ],
    })
  )
```

- Custom code - https://unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html#data=%7B%22code%22%3A%22import%20React%20from%20'react'%5Cnimport%20%7B%20Text%20%7D%20from%20'react-native'%5Cn%5Cnexport%20default%20()%20%3D%3E%20%3CText%3EHello%2C%20world!%3C%2FText%3E%5Cn%22%7D
- Android device - https://unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html#data=%7B%22panes%22%3A%5B%22editor%22%2C%7B%22type%22%3A%22player%22%2C%22platform%22%3A%22android%22%7D%5D%7D
- Custom title - https://unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html#data=%7B%22title%22%3A%22Hello%22%7D
- Load moment.js - https://unpkg.com/react-native-web-player@^2.0.0-alpha/public/index.html#data=%7B"panes"%3A%5B"editor"%2C%7B"type"%3A"player"%2C"modules"%3A%5B"moment"%5D%2C"id"%3A"3"%7D%5D%2C"code"%3A"import%20React%20from%20'react'%5Cnimport%20%7B%20Text%20%7D%20from%20'react-native'%5Cnimport%20moment%20from%20'moment'%5Cn%5Cnexport%20default%20function%20App()%20%7B%5Cn%20%20return%20(%5Cn%20%20%20%20<Text>%5Cn%20%20%20%20%20%20%7Bmoment().toString()%7D%5Cn%20%20%20%20<%2FText>%5Cn%20%20)%5Cn%7D%5Cn"%7D

##### Advanced Examples:

These open source sites use this project in more complex ways.

- [React Native Express](https://www.reactnative.express)
- [React Express](https://www.react.express)
- [JavaScript Express](https://www.javascript.express)
- [TypeScript Express](https://www.typescript.express)

## Development

### Run

```bash
yarn
yarn start
# => localhost:8080
```

### Build

```bash
yarn build
```

### License

BSD
