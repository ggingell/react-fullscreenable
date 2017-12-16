import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getDisplayName from 'react-display-name';

import Fullscreen from './Fullscreen';

const noop = () => {};
const pick = (obj = {}, keys = []) => {
    const result = {};
    keys.forEach(key => {
        result[key] = obj[key];
    });

    return result;
};

export default function withFullscreen({ onError = noop } = {}) {
    return WrappedComponent => {
        class Fullscreenable extends Component {
            render() {
                return (
                    <Fullscreen
                        {...this.props}
                        onError={onError}
                        render={(_state, props) => {
                            const state = pick(_state, [
                                'isPseudoFullscreen',
                                'isFullscreen',
                                'viewportDimensions',
                            ]);

                            return <WrappedComponent {...props} {...state} />;
                        }}
                    />
                );
            }
        }

        Fullscreenable.displayName = `Fullscreenable(${getDisplayName(WrappedComponent)})`;

        Fullscreenable.propTypes = {
            forcePseudoFullscreen: PropTypes.bool,
            isPseudoFullscreen: PropTypes.bool,
            onFullscreenChange: PropTypes.func,
        };

        Fullscreenable.defaultProps = {
            onFullscreenChange: () => {},
        };

        return Fullscreenable;
    };
}
