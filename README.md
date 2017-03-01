# react-fullscreenable

> This is a [higher order component](https://facebook.github.io/react/docs/higher-order-components.html) that enhances any component with props that allow it to enter native fullscreen.

## Usage

The first provided prop is a boolean `isFullscreen` that updates when the fullscreen change event fires. The second is a function `toggleFullscreen` that must be attached to a node used for toggling fullscreen by the user. **Note: You cannot call `.toggleFullscreen` outside of an actual user event or the browser will throw an error.** (Unless using forcePseudoFullscreen) When native fullscreen is not possible (either because it is disabled or because it is not supported) this component will fall back to a pseudo-fullscreen effect. This is achieve by sizing and positioning the wrapper node to fit the window. When in either native or pseudo fullscreen mode the prop `viewportDimensions` is provided to the wrapped component as: `{ height: <window.clientHeight>, width: <window.clientWidth> }`. `viewportDimensions` is otherwise passed as `null`. Device orientation and other window resize events will update these dimensions. This allows you to size the child components as needed.

Make these changes in the component you want to enhance with fullscreen. In these examples we'll call it `DemoComponent`:

1. Import `fullscreenable`. (See [./example/DemoComponent.js](./example/DemoComponent.js))

    ```javascript
    import fullscreenable from 'react-fullscreenable';
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

4. Enhance the component with `fullscreenable` and export it however it makes sense for you.

    ```javascript
    const FullscreenableDemoComponent = fullscreenable()(DemoComponent);

    // You could also make this a named export instead of the default if you want the flexibility to use the component with or without the fullscreen enhancement.
    export default FullscreenableDemoComponent;
    ```

5. Simply import and use your component the same way as you normally would. (See [./example/demo.js](./example/demo.js))

    ```javascript
    import DemoComponent from '../path/to/DemoComponent';
    ```

Also take a look at [./example/demo.css](./example/demo.css). No CSS is required for this component to function
correctly. However you will probably want rules for some child elements.

## Development

    npm i

    npm run start

Your browser should open to the live demo page.

## Testing

    Tests are written with Jest and Enzyme.

    npm t

> grantgi@zillowgroup.com
