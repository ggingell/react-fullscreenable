import React from 'react';
import ReactDOM from 'react-dom';
import DemoComponent from './DemoComponent';

ReactDOM.render(
    <div>
        <pre>without forcePseudoFullscreen prop (default):</pre>
        <DemoComponent
            onFullscreenChange={isFullscreen => {
                console.log('onFullscreenChange demo callback > isFullscreen', isFullscreen);
            }}
        />
        <pre>with forcePseudoFullscreen = true:</pre>
        <DemoComponent forcePseudoFullscreen={true} isPseudoFullscreen={false} />
    </div>,
    document.getElementById('stage')
);
