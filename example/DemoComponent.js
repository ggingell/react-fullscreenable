import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fullscreenable from '../src/';

export class DemoComponent extends Component {
    componentWillReceiveProps(nextProps) {
        if (this.props.isFullscreen !== nextProps.isFullscreen) {
            // Fullscreen status has changed.
        }
    }

    render() {
        const { isFullscreen, toggleFullscreen } = this.props;

        const buttonLabel = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';

        const toggleButton = <button onClick={toggleFullscreen}>{buttonLabel}</button>;

        return (
            <div className="demo-component">
                <h1>{DemoComponent.displayName}</h1>

                <p>This component is enhanced with Fullscreenable.</p>

                {toggleButton}

                <h2>Props</h2>
                <pre>{JSON.stringify(this.props, null, '  ')}</pre>
            </div>
        );
    }
}

DemoComponent.displayName = 'DemoComponent';

DemoComponent.propTypes = {
    isFullscreen: PropTypes.bool,
    toggleFullscreen: PropTypes.func,
    viewportDimensions: PropTypes.object,
};

const FullscreenableDemoComponent = Fullscreenable()(DemoComponent);

export default FullscreenableDemoComponent;
