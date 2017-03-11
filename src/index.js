/* eslint-disable no-return-assign */

import React, { Component, PropTypes } from 'react';
import fullscreen from 'fullscreen';
import { findDOMNode } from 'react-dom';
import getDisplayName from 'react-display-name';
import classNames from 'classnames';

import getViewportDimensions from './getViewportDimensions';
const CAN_HAS_DOM = (typeof window !== 'undefined'
                     && window.document
                     && window.document.createElement);

const noop = () => {};

export default function withFullscreen({
        onError = noop
    } = {}) {

    return (WrappedComponent) => {

        class Fullscreenable extends Component {
            constructor(props) {
                super(props);
                let isAvailable;
                let isEnabled;

                if (CAN_HAS_DOM) {
                    isAvailable = fullscreen.available();
                    isEnabled = fullscreen.enabled();
                }

                this.handleRootNodeRef = this.handleRootNodeRef.bind(this);
                this.onFullscreenClick = this.onFullscreenClick.bind(this);

                this.handleResize = this.handleResize.bind(this);
                this.handleOrntChange = this.handleOrntChange.bind(this);
                this.squelchTouchMove = this.squelchTouchMove.bind(this);

                this.state = {
                    isFullscreen: false,
                    isAvailable,
                    isEnabled,
                    isNativeCapable: (isAvailable && isEnabled),
                    viewportDimensions: null,
                    scrollYStart: 0
                };
            }

            componentDidMount() {

                if(this.state.isNativeCapable && !this.props.forcePseudoFullscreen) {
                    this.fs = this.attachNativeFullscreen();
                } else {
                    this.fs = this.attachPseudoFullscreen();
                }
            }

            attachNativeFullscreen() {

                const emitter = fullscreen(this.rootNode);

                emitter.on('attain', () => {
                    this.rootNode.style.height = '100%';
                    this.rootNode.style.width = '100%';

                    // Delay is necessary in order to be able to get the
                    // correct dimensions of the window. If we update too soon
                    // the values reported by innerHeight and innerWidth are
                    // incorrect.
                    setTimeout(() => {
                        this.setState({
                            isFullscreen: true,
                            viewportDimensions: getViewportDimensions()
                        });
                    }, 500);
                });

                emitter.on('release', () => {
                    this.rootNode.style.height = '';
                    this.rootNode.style.width = '';

                    this.setState({
                        isFullscreen: false,
                        viewportDimensions: null
                    });
                });

                emitter.on('error', (error) => {

                    this.setState({
                        isFullscreen: false,
                        viewportDimensions: null
                    });

                    // You really only get onfullscreenerror when requesting
                    // fullscreen outside of a real event, or if it's disabled
                    // by the user. In that case, we don't
                    // pass a toggle function so there shouldn't be any requests
                    // when it's disabled.
                    onError(error);
                });

                return emitter;
            }

            attachPseudoFullscreen() {

                return {
                    request: () => {
                        window.addEventListener('resize', this.handleResize);
                        window.addEventListener('orientationchange', this.handleOrntChange);

                        window.scrollTo(0, 0);

                        this.setState({
                            isPseudoFullscreen: true,
                            viewportDimensions: getViewportDimensions(),
                            scrollYStart: window.scrollY
                        });
                    },
                    release: () => {
                        window.removeEventListener('resize', this.handleResize);
                        window.removeEventListener('orientationchange', this.handleOrntChange);

                        window.scrollTo(0, this.state.scrollYStart);

                        this.setState({
                            isPseudoFullscreen: false,
                            viewportDimensions: null,
                            scrollYStart: 0
                        });
                    },
                    // noop for now. May be useful if event listeners are ever required
                    // during the attachPseudoFullscreen() call itself.
                    dispose: noop
                }
            }

            handleResize() {

                window.scrollTo(0, 0);
                this.setState({
                    viewportDimensions: getViewportDimensions()
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

            onFullscreenClick() {
                const {
                    isFullscreen,
                    isPseudoFullscreen
                } = this.state;

                if (isFullscreen || isPseudoFullscreen) {
                    this.fs.release();
                } else {
                    this.fs.request();
                }
            }

            squelchTouchMove(event) {
                // This will not interfere with touchMove listeners attached to
                // immediate children.
                event.preventDefault();

                // If the user taps the top of the screen on an iPad or iPhone
                // this can trigger the URL bar to show. However this does not
                // fire a resize event. Instead, we check window size on
                // movement to see if it has changed.
                const dims = this.state.viewportDimensions;
                const newDims = getViewportDimensions();

                if (dims) {
                    if (dims.height !== newDims.height || dims.width !== newDims.width) {
                        this.handleResize();
                    }
                }
            }

            render() {
                const {
                    isEnabled,
                    isPseudoFullscreen,
                    isFullscreen,
                   viewportDimensions
                } = this.state;

                const wrapperClass = classNames({
                    'fullscreenable': true,
                    'fullscreen': (isFullscreen || isPseudoFullscreen),
                    'fullscreen_disabled': !isEnabled,
                    'fullscreen_pseudo': isPseudoFullscreen
                });

                let squelchTouchMove;
                let style = null;
                if (isPseudoFullscreen) {
                    squelchTouchMove = this.squelchTouchMove;
                    style = {
                        height: viewportDimensions.height,
                        width: viewportDimensions.width,
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        left: '0'
                    }
                }

                return (
                    <div className={wrapperClass}
                         style={style}
                         onTouchMove={squelchTouchMove}
                         ref={this.handleRootNodeRef}>
                        <WrappedComponent {...this.props}
                                          toggleFullscreen={this.onFullscreenClick}
                                          isFullscreen={Boolean(isFullscreen || isPseudoFullscreen)}
                                          viewportDimensions={viewportDimensions} />
                    </div>
                );
            }
        }

        Fullscreenable.displayName = `Fullscreenable(${getDisplayName(WrappedComponent)})`;

        Fullscreenable.propTypes = {
            forcePseudoFullscreen: PropTypes.bool
        }

        return Fullscreenable;
    };
}
