import React from 'react';
import ReactDOM from 'react-dom';
import DemoComponent from './DemoComponent';

ReactDOM.render(
    <div>
        <pre>without forcePseudoFullscreen prop (default):</pre>
        <DemoComponent />
        <pre>with forcePseudoFullscreen = true:</pre>
        <DemoComponent forcePseudoFullscreen={true} />
    </div>,
    document.getElementById('stage')
);
