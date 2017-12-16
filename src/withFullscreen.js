import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getDisplayName from 'react-display-name';

import Fullscreen from './Fullscreen';

const noop = () => {};

export default function withFullscreen({ onError = noop } = {}) {
    return WrappedComponent => {
        class Fullscreenable extends Component {
            render() {
                return (
                    <Fullscreen
                        {...this.props}
                        onError={onError}
                        render={(_state, props) => {
                            const { isPseudoFullscreen, isFullscreen, viewportDimensions } = _state;

                            return (
                                <WrappedComponent
                                    {...props}
                                    isPseudoFullscreen={isPseudoFullscreen}
                                    isFullscreen={isFullscreen}
                                    viewportDimensions={viewportDimensions}
                                />
                            );
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
