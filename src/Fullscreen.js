import React from 'react';
// import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Instead of using a HOC, we can share code using a
// regular component with a render prop!
class Fullscreen extends React.Component {
    constructor() {
        super();

        this.state = {};
    }

    render() {
        return <div style={{ height: '100%' }}>{this.props.render(this.state)}</div>;
    }
}

Fullscreen.propTypes = {
    render: PropTypes.func.isRequired,
};
