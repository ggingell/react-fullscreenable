# react-fullscreenable

> This is a [higher order component](https://facebook.github.io/react/docs/higher-order-components.html) that enhances any component with props that allow it to enter native fullscreen.

## Changelog

* **2.5.0** - Package and test hygiene for React 16. Thanks [@schneidmaster](https://github.com/schneidmaster).

* **2.4.3** - Fix for [issue #3](https://github.com/ggingell/react-fullscreenable/issues/3).
              Native fullscreen detection fixed in Firefox.

* **2.4.2** - Fix for [issue #2](https://github.com/ggingell/react-fullscreenable/issues/2).
              Update issue #2 or create a new one as needed if this is causing issues for you. Any feedback appreciated!

* **2.4.0** - Feature: Component now accepts prop isPseudoFullscreen that will immediately enter
                    into pseudoFullscreen when passed as true. This cannot work with native fullscreen
                    since that requires a user-generated event in order for the request to be fulfilled
                    by the browser.

* **2.3.1** - Bugfix: Component now disposes of event handlers and inline styles during componentWillUnmount()
                    that would otherwise leak if component was unmounted while in pseudo fullscreen.

* **2.3.0** - Component now accepts a callback function as optional prop `onFullscreenChange` that will be called
                    whenever fullscreen is entered or exited.

* **2.2.1** - Now using `prop-types` npm module to be compatible with React beyond 15.5.

* **2.2.0** - Component now sets body style to prevent scrolling document in background.
            - Fixed issue where TouchMove events that made it to the component would be prevented,
                    which caused jitter during native scroll.
            - Fixed bug where scrollY was not restored in pseudo fullscreen.

* **2.1.1** - Now Universal. Added DOM check before checking if native fullscreen is available on document.

## Usage

The first provided prop is a boolean `isFullscreen` that updates when the fullscreen change event fires. The second is a function `toggleFullscreen` that must be attached to a node used for toggling fullscreen by the user. **Note: You cannot call `.toggleFullscreen` outside of an actual user event or the browser will throw an error.** (Unless using forcePseudoFullscreen.)

When native fullscreen is not possible (either because it is disabled or because it is not supported) this component will fall back to a pseudo-fullscreen effect. This is achieved by sizing and positioning the wrapper node to fit the window. When in either mode the prop `viewportDimensions` is provided to the wrapped component as:

    {
        height: <window.clientHeight>,
        width: <window.clientWidth>
    }

`viewportDimensions` is otherwise passed as `null`. Device orientation and other window resize events will update these dimensions. This allows you to size the child components as needed.

Make these changes in the component you want to enhance with fullscreen. In these examples we'll call it `DemoComponent`:

1. Import `Fullscreenable`. (See [./example/DemoComponent.js](./example/DemoComponent.js))

    ```javascript
    import Fullscreenable from 'react-fullscreenable';
    ```


2. Add the props `isFullscreen`, `toggleFullscreen` and `viewportDimensions`. `forcePseudoFullscreen` will also be passed down if it was passed into the enhanced component.


    ```javascript
    DemoComponent.propTypes = {
        isFullscreen: PropTypes.bool,
        toggleFullscreen: PropTypes.func
    };
    ```

3. Use the `toggleFullscreen` prop on a button or other node in the render method.

    ```javascript
    <button onClick={this.props.toggleFullscreen}>Fullscreen</button>
    ```

4. Enhance the component with `Fullscreenable` and export it however it makes sense for you.

    ```javascript
    const FullscreenableDemoComponent = Fullscreenable()(DemoComponent);

    // You could also make this a named export instead of the default if you want the flexibility to use the component with or without the fullscreen enhancement.
    export default FullscreenableDemoComponent;
    ```

5. Simply import and use your component the same way as you normally would. (See [./example/demo.js](./example/demo.js))

    ```javascript
    import DemoComponent from '../path/to/DemoComponent';
    ```

Also take a look at [./example/demo.css](./example/demo.css). No CSS is required for this component to function
correctly. However you will probably want rules for some child elements. demo.css is a good starting point.

## Development

```
npm i
npm run start
```

Your browser should open to the live demo page.

## Testing

Tests are written with Jest and Enzyme.

```
npm t
```

> grantgi@zillowgroup.com
