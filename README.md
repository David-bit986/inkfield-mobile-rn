# InkDraw

InkDraw wraps the inkField digital painting system in a React Native iOS application. It loads the WebGL rendering engine inside a native WebView and replaces the web interface with touch-optimized controls.

## Motivation

This project exists for fun and to learn React Native app development by building a tool I actually want to use.

## Capabilities

You can access the core inkField engine:
- Physics-based brushes using a spring-damper model
- 7 brush modes
- 6 ink effects
- Blend modes (Mix, Multiply, Darken, Spectral)
- PNG and transparent line exports

A native bottom menu replaces the original floating web panels. The layout places tools near the thumb for one-handed operation.

## Setup

Install Node.js and the Expo Go app.

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Scan the QR code using Expo Go.

## Architecture

The application uses `react-native-webview` to load the remote inkField environment. `App.js` injects CSS and JavaScript to hide the web interface. `components/BottomMenu.js` renders the native tabbed menu and bridges commands to the web environment via `postMessage` and JavaScript injection. 

`process-icon-2.js` generates the application icon by processing the raw image assets.

## Dependencies

- Expo SDK 54
- React Native 0.81

## License

The wrapper code is open source. The inkField system remains free to use but closed source. Review the inkField repository for specific usage terms.
