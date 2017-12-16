import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fullscreen from 'fullscreen';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

import getViewportDimensions from './getViewportDimensions';
const CAN_HAS_DOM =
    typeof window !== 'undefined' && window.document && window.document.createElement;

const noop = () => {};

// Instead of using a HOC, we can share code using a
// regular component with a render prop!
export default class Fullscreen extends Component {
    constructor() {
        super();
        let isAvailable;
        let isEnabled;

        if (CAN_HAS_DOM) {
            isAvailable = fullscreen.available();
            isEnabled = fullscreen.enabled();
        }

        this.handleRootNodeRef = this.handleRootNodeRef.bind(this);
        this.handleToggleFullscreen = this.handleToggleFullscreen.bind(this);
        this.handleResize = this.handleResize.bind(this);
        // orientation change
        this.handleOrntChange = this.handleOrntChange.bind(this);
        // ignore touch events
        this.listenTouchMove = this.listenTouchMove.bind(this);

        this.disposePseudoFullscreen = this.disposePseudoFullscreen.bind(this);

        this.state = {
            isFullscreen: false,
            isPseudoFullscreen: false,
            isAvailable,
            isEnabled,
            isNativeCapable: isAvailable && isEnabled,
            viewportDimensions: null,
            scrollYStart: 0,
        };
    }

    componentDidMount() {
        const { isPseudoFullscreen } = this.props;

        if (
            this.state.isNativeCapable &&
            !this.props.forcePseudoFullscreen &&
            !isPseudoFullscreen
        ) {
            this.fs = this.attachNativeFullscreen();
        } else {
            this.fs = this.attachPseudoFullscreen();
            if (isPseudoFullscreen) {
                this.fs.request();
            }
        }
    }

    attachNativeFullscreen() {
        const emitter = fullscreen(this.rootNode);

        emitter.on('attain', () => {
            this.rootNode.style.height = '100%';
            this.rootNode.style.width = '100%';

            // Set state immediately to avoid race condition with pressing Escape key
            this.setState(
                {
                    isFullscreen: true,
                },
                () => {
                    this.props.onFullscreenChange(true);
                }
            );

            // Delay is necessary in order to be able to get the
            // correct dimensions of the window. If we update too soon
            // the values reported by innerHeight and innerWidth are
            // incorrect.
            setTimeout(() => {
                if (this.state.isFullscreen) {
                    this.setState({
                        viewportDimensions: getViewportDimensions(),
                    });
                }
            }, 300);
        });

        emitter.on('release', () => {
            this.rootNode.style.height = '';
            this.rootNode.style.width = '';

            this.setState(
                {
                    isFullscreen: false,
                    viewportDimensions: null,
                },
                () => {
                    this.props.onFullscreenChange(false);
                }
            );
        });

        emitter.on('error', error => {
            this.setState({
                isFullscreen: false,
                viewportDimensions: null,
            });

            // You really only get onfullscreenerror when requesting
            // fullscreen outside of a real event, or if it's disabled
            // by the user. In that case, we don't
            // pass a toggle function so there shouldn't be any requests
            // when it's disabled.
            this.props.onError && this.props.onError(error);
        });

        return emitter;
    }

    attachPseudoFullscreen() {
        return {
            request: () => {
                window.addEventListener('resize', this.handleResize);
                window.addEventListener('orientationchange', this.handleOrntChange);

                const scrawly = window.scrollY;

                window.scrollTo(0, 0);

                this.bodyPosOrig = window.document.body.style.position;
                this.bodyMarginOrig = window.document.body.style.margin;
                window.document.body.style.position = 'fixed';
                window.document.body.style.margin = '0';

                this.setState(
                    {
                        isPseudoFullscreen: true,
                        viewportDimensions: getViewportDimensions(),
                        scrollYStart: scrawly,
                    },
                    () => {
                        this.props.onFullscreenChange(true);
                    }
                );
            },
            release: () => {
                this.disposePseudoFullscreen();

                this.setState(
                    {
                        isPseudoFullscreen: false,
                        viewportDimensions: null,
                        scrollYStart: this.state.scrollYStart,
                    },
                    () => {
                        this.props.onFullscreenChange(false);
                    }
                );
            },
            dispose: () => {
                this.disposePseudoFullscreen();
            },
        };
    }

    disposePseudoFullscreen() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleOrntChange);

        window.document.body.style.position = this.bodyPosOrig || '';
        window.document.body.style.margin = this.bodyMarginOrig;

        window.scrollTo(0, this.state.scrollYStart);
    }

    handleResize() {
        window.scrollTo(0, 0);
        this.setState({
            viewportDimensions: getViewportDimensions(),
        });
    }

    handleOrntChange() {
        // On iPhone/iPad the orientationchange event is fired at the
        // start of the rotation. The window.inner* dimension values
        // are not correct until after the animation completes.
        // So we wait.
        setTimeout(this.handleResize, 400);
    }

    componentWillUnmount() {
        this.fs.dispose();
    }

    handleRootNodeRef(ref) {
        this.rootNode = findDOMNode(ref);
    }

    handleToggleFullscreen() {
        const { isFullscreen, isPseudoFullscreen } = this.state;

        if (isFullscreen || isPseudoFullscreen) {
            this.fs.release();
        } else {
            this.fs.request();
        }
    }

    listenTouchMove(event) {
        // If the user taps the top of the screen on an iPad or iPhone
        // this can trigger the URL bar to show. However this does not
        // fire a resize event. Instead, we check window size on
        // movement to see if it has changed.
        // If you don't want this to happen, you can call
        // event.stopPropagation(); in your own listener on a child node
        // and this handler won't see it.
        const dims = this.state.viewportDimensions;
        const newDims = getViewportDimensions();

        if (dims) {
            let didResize = false;
            if (dims.height !== newDims.height || dims.width !== newDims.width) {
                this.handleResize();
                didResize = true;
            }

            if (this.props.onTouchMove) {
                this.props.onTouchMove(event, {
                    didResize,
                    dimensions: dims,
                });
            }
        }
    }

    render() {
        const { render, children } = this.props;
        const { isEnabled, isPseudoFullscreen, isFullscreen, viewportDimensions } = this.state;

        const wrapperClass = classNames({
            fullscreenable: true,
            fullscreen: isFullscreen || isPseudoFullscreen,
            fullscreen_disabled: !isEnabled,
            fullscreen_pseudo: isPseudoFullscreen,
        });

        let listenTouchMove;
        let style = null;
        if (isPseudoFullscreen) {
            listenTouchMove = this.listenTouchMove;
            style = {
                height: viewportDimensions.height,
                width: viewportDimensions.width,
                position: 'absolute',
                top: '0',
                right: '0',
                bottom: '0',
                left: '0',
            };
        }

        let _render = render;

        if (typeof children === 'function') {
            _render = children;
        }

        const state = {
            isEnabled,
            isPseudoFullscreen,
            isFullscreen,
            viewportDimensions,
        };

        const props = Object.assign(
            {},
            {
                toggleFullscreen: this.handleToggleFullscreen,
            },
            this.props
        );

        return (
            <div
                style={style}
                className={wrapperClass}
                onTouchMove={listenTouchMove}
                ref={this.handleRootNodeRef}
            >
                {_render(state, props)}
            </div>
        );
    }
}

Fullscreen.defaultProps = {
    onError: noop,
    onTouchMove: noop,
    onFullscreenChange: () => {},
};

Fullscreen.propTypes = {
    /*
     */
    render: PropTypes.func,
    /*
     */
    children: PropTypes.func,
    /*
     */
    onError: PropTypes.func,
    /*
     */
    /* TouchMove event listener. is passed the original event and
     * { didResize: PropTypes.bool, dimensions: PropTypes.shape({});
     */
    onTouchMove: PropTypes.func,
    /*
     */
    forcePseudoFullscreen: PropTypes.bool,
    /* Boolean that applies style to the wrapper to make the container fill
     *  the viewport.
     *
     */
    isPseudoFullscreen: PropTypes.bool,
    /* Called when state.isFullscreen changes.
     */
    onFullscreenChange: PropTypes.func,
};
