jest.mock('fullscreen');

jest.mock('../src/getViewportDimensions', () => {
    return jest.fn();
});

import React from 'react';
import PropTypes from 'prop-types';

import { mount } from 'enzyme';
import deepEqual from 'deep-equal';

import Fullscreenable from '../src/';

const TestComponent = (props) => {
    return (
        <div className="test-component">
            <button className="toggle-button" onClick={props.toggleFullscreen}>
                Enter Fullscreen
            </button>
            <div className="flag">{props.isFullscreen}</div>
        </div>
    );
}
TestComponent.propTypes = {
    toggleFullscreen: PropTypes.func,
    isFullscreen: PropTypes.bool
}


describe('Fullscreenable when native fullscreen is enabled and available', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        const mocked = require('fullscreen');
        mocked.__resetListeners();
        mocked.__setAvailable(true);
        mocked.__setEnabled(true);
    });

    it('should provide a function as its default export', () => {
        expect(Fullscreenable).toBeInstanceOf(Function);
    });

    it('should compose a display name based on the wrapped component', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        expect(EnhancedComponent.displayName).toBe("Fullscreenable(TestComponent)");
    });

    it('should add three props to the wrapped component', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const wrappedComponent = wrapper.children().first();
        const enhancedProps = wrappedComponent.props();

        expect(enhancedProps.toggleFullscreen).toBeDefined();
        expect(enhancedProps.toggleFullscreen).not.toBeNull();

        // Fullscreen is enabled by default in most browsers.(And in our mock)
        expect(enhancedProps.toggleFullscreen).toBeInstanceOf(Function);
        expect(enhancedProps.isFullscreen).toBe(false);

        expect(enhancedProps.viewportDimensions).toBeNull();

    });

    it('should pass other props along', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const unrelatedProp = { testing: true, leaveMeAlone: true };
        const wrapper = mount(<EnhancedComponent unrelatedProp={unrelatedProp}/>);
        const wrappedComponent = wrapper.children().first();
        const enhancedProps = wrappedComponent.props();

        expect(deepEqual(enhancedProps.unrelatedProp, unrelatedProp)).toBe(true);

    });

    it('should have appropriate classes on its root node', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);

        expect(wrapper.hasClass('fullscreenable')).toBe(true);
        expect(wrapper.hasClass('fullscreen')).toBe(false);
        expect(wrapper.hasClass('fullscreen_disabled')).toBe(false);
    });

    it('should request fullscreen when toggleFullscreen is called and update props once reached', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        expect(toggleButton).toBeDefined();
        toggleButton.simulate('click');

        setTimeout(function() {

            wrapper.update();

            const wrappedComponent = wrapper.children().first();
            const enhancedProps = wrappedComponent.props();

            expect(enhancedProps.isFullscreen).toBe(true);

            done();

        }, 515);
    });

    it('should release fullscreen when toggleFullscreen is called', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        setTimeout(function() {

            const wrappedComponent = wrapper.children().first();
            const enhancedProps = wrappedComponent.props();

            expect(enhancedProps.isFullscreen).toBe(true);

            toggleButton.simulate('click');

            setTimeout(function() {

                wrapper.update();

                const wrappedComponent = wrapper.children().first();
                const enhancedProps = wrappedComponent.props();

                expect(enhancedProps.isFullscreen).toBe(false);

                done();
            }, 515);
        }, 515);
    });

    it('should call this.props.onFullscreenChange when state.isFullscreen changes', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const onFullscreenChangeSpy = jest.fn();

        const wrapper = mount(<EnhancedComponent
            onFullscreenChange={onFullscreenChangeSpy} />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        setTimeout(function() {

            expect(onFullscreenChangeSpy).toHaveBeenCalledTimes(1);
            expect(onFullscreenChangeSpy.mock.calls[0][0]).toEqual(true);

            toggleButton.simulate('click');

            setTimeout(function() {

                wrapper.update();

                expect(onFullscreenChangeSpy).toHaveBeenCalledTimes(2);
                expect(onFullscreenChangeSpy.mock.calls[1][0]).toEqual(false);

                done();
            }, 515);
        }, 515);
    });
});

describe('Fullscreenable when an error occurs', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        const mocked = require('fullscreen');
        mocked.__resetListeners();
        mocked.__setAvailable(true);
        mocked.__setEnabled(true);
        mocked.__setSimulateError(true);
    });

    it('should handle not being provided an onError callback', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);

        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        wrapper.update();

        setTimeout(() => {
            const wrappedComponent = wrapper.children().first();
            const enhancedProps = wrappedComponent.props();
            expect(enhancedProps.isFullscreen).toBe(false);
            done();
        }, 12);
    });

    it('should call the onError callback', function(done) {
        const errorCbSpy = jest.fn();
        let EnhancedComponent = Fullscreenable({
            onError: errorCbSpy
        })(TestComponent);

        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        wrapper.update();

        setTimeout(() => {
            const wrappedComponent = wrapper.children().first();
            const enhancedProps = wrappedComponent.props();
            expect(errorCbSpy).toHaveBeenCalled();
            expect(errorCbSpy.mock.calls[0][0]).toBeInstanceOf(Error);
            expect(enhancedProps.isFullscreen).toBe(false);
            done();
        }, 12);
    });
});

describe('Fullscreenable when unmounted', () => {

    it('should call .dispose() on this.fs', () => {
        jest.resetAllMocks();
        const mocked = require('fullscreen');
        mocked.__resetListeners();
        mocked.__setAvailable(true);
        mocked.__setEnabled(true);

        const disposeSpy = mocked.__getDisposeMock();

        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);

        wrapper.unmount();

        expect(disposeSpy).toHaveBeenCalled();
    });
});

describe('Fullscreenable when fullscreen is not available', () => {
    let mockGetVD;

    beforeEach(() => {
        jest.resetAllMocks();
        const mocked = require('fullscreen');
        mocked.__resetListeners();
        mocked.__setAvailable(false);
        mocked.__setEnabled(false);
        mockGetVD = require('../src/getViewportDimensions');
        mockGetVD.mockReturnValue({width: 1024, height: 768});

    });

    it('should have fullscreen_disabled class on its root node', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);

        expect(wrapper.hasClass('fullscreenable')).toBe(true);
        expect(wrapper.hasClass('fullscreen')).toBe(false);
        expect(wrapper.hasClass('fullscreen_disabled')).toBe(true);
    });

    it('should enter pseudo fullscreen when toggleFullscreen is called and update state immediately', function() {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        wrapper.update();

        const wrappedComponent = wrapper.children().first();
        const enhancedProps = wrappedComponent.props();

        expect(enhancedProps.isFullscreen).toBe(true);
        expect(enhancedProps.viewportDimensions).toEqual({width: 1024, height: 768});

    });

    it('should have appropriate classes when in pseudo fullscreen', function() {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        wrapper.update();

        expect(wrapper.hasClass('fullscreenable')).toBe(true);
        expect(wrapper.hasClass('fullscreen')).toBe(true);
        expect(wrapper.hasClass('fullscreen_disabled')).toBe(true);
        expect(wrapper.hasClass('fullscreen_pseudo')).toBe(true);

    });

    // it('should swallow TouchMove events when in pseudo fullscreen (call preventDefault())', function() {
    //     let EnhancedComponent = Fullscreenable()(TestComponent);
    //     const wrapper = mount(<EnhancedComponent />);
    //     const toggleButton = wrapper.find('.toggle-button');

    //     const touchMovePrevDefaultSpy = jest.fn();

    //     toggleButton.simulate('click');

    //     wrapper.update();

    //     wrapper.simulate('touchmove', {
    //         preventDefault: touchMovePrevDefaultSpy
    //     });

    //     expect(touchMovePrevDefaultSpy).toHaveBeenCalled();

    // });

    it('should check if window size changed in TouchMove handler (iOS Devices do not fire when URL bar is shown)', function() {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');
        const inst = wrapper.instance();
        const setStateSpy = jest.spyOn(inst, 'setState');

        toggleButton.simulate('click');

        wrapper.update();

        mockGetVD.mockReturnValue({"height": 1440, "width": 2560});

        wrapper.simulate('touchmove');

        wrapper.update();

        expect(setStateSpy).toHaveBeenCalledTimes(2);

        expect(setStateSpy.mock.calls[1][0]).toEqual({ "viewportDimensions": {"height": 1440, "width": 2560} });
    });

    it('should release pseudo fullscreen when toggleFullscreen is called', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        // Update wrapper to be in pseudo fullscreen effect
        wrapper.update();

        let wrappedComponent = wrapper.children().first();
        let enhancedProps = wrappedComponent.props();

        expect(enhancedProps.isFullscreen).toBe(true);
        expect(enhancedProps.viewportDimensions).toEqual({width: 1024, height: 768});

        toggleButton.simulate('click');

        wrapper.update();

        wrappedComponent = wrapper.children().first();
        enhancedProps = wrappedComponent.props();

        expect(enhancedProps.isFullscreen).toBe(false);
        expect(enhancedProps.viewportDimensions).toEqual(null);
    });

    it('should call setState in handleResize if the window size has changed', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');
        const inst = wrapper.instance();
        const setStateSpy = jest.fn();
        inst.setState = setStateSpy;

        toggleButton.simulate('click');

        // Update wrapper to be in pseudo fullscreen effect
        wrapper.update();

        inst.handleResize();

        // Simulate the window getting larger
        mockGetVD.mockReturnValue({"height": 1440, "width": 900})

        inst.handleResize();

        wrapper.update();

        expect(setStateSpy).toHaveBeenCalledTimes(3);
        expect(setStateSpy.mock.calls[2][0]).toEqual({ "viewportDimensions": {"height": 1440, "width": 900} });
    });

    it('should call setState when its handleOrntChange is called', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');
        const inst = wrapper.instance();
        const setStateSpy = jest.fn();
        inst.setState = setStateSpy;

        toggleButton.simulate('click');

        // Update wrapper to be in pseudo fullscreen effect
        wrapper.update();

        mockGetVD.mockReturnValue({"height": 1024, "width": 768})

        inst.handleOrntChange();

        setTimeout(function() {
            wrapper.update();

            expect(setStateSpy).toHaveBeenCalledTimes(2);
            expect(setStateSpy.mock.calls[1][0]).toEqual({ "viewportDimensions": {"height": 1024, "width": 768} });

            done();
        }, 416);
    });

    it('should immediately call fullscreen.request() if isPseudoFullscreen prop is passed as true', function (done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent isPseudoFullscreen={true} />);

        setTimeout(function() {

            wrapper.update();

            let wrappedComponent = wrapper.children().first();
            let enhancedProps = wrappedComponent.props();

            expect(enhancedProps.isFullscreen).toBe(true);
            expect(enhancedProps.isPseudoFullscreen).toBe(true);

            done();
        }, 515);
    });

    it('should call this.props.onFullscreenChange when state.isFullscreen changes even when in pseudoFullscreen', function(done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const onFullscreenChangeSpy = jest.fn();

        mockGetVD.mockReturnValue({"height": 1024, "width": 768})

        const wrapper = mount(<EnhancedComponent
            forcePseudoFullscreen={true}
            onFullscreenChange={onFullscreenChangeSpy} />);
        const toggleButton = wrapper.find('.toggle-button');

        toggleButton.simulate('click');

        setTimeout(function() {

            expect(onFullscreenChangeSpy).toHaveBeenCalledTimes(1);
            expect(onFullscreenChangeSpy.mock.calls[0][0]).toEqual(true);

            toggleButton.simulate('click');

            setTimeout(function() {

                wrapper.update();

                expect(onFullscreenChangeSpy).toHaveBeenCalledTimes(2);
                expect(onFullscreenChangeSpy.mock.calls[1][0]).toEqual(false);

                done();
            }, 515);
        }, 515);
    });

    it('should call .dispose() on this.fs when unmounted', function (done) {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);
        const toggleButton = wrapper.find('.toggle-button');
        const inst = wrapper.instance();

        const disposePseudoFullscreenSpy = jest.spyOn(inst, 'disposePseudoFullscreen');

        toggleButton.simulate('click');

        setTimeout(function() {
            wrapper.unmount();

            expect(disposePseudoFullscreenSpy).toHaveBeenCalledTimes(1);

            done();
        });
    });
});

describe('Fullscreenable when fullscreen is not enabled', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        const mocked = require('fullscreen');
        mocked.__resetListeners();
        mocked.__setAvailable(true);
        mocked.__setEnabled(false);
    });

    it('should have class fullscreen_disabled on its root node', () => {
        let EnhancedComponent = Fullscreenable()(TestComponent);
        const wrapper = mount(<EnhancedComponent />);

        expect(wrapper.hasClass('fullscreenable')).toBe(true);
        expect(wrapper.hasClass('fullscreen')).toBe(false);
        expect(wrapper.hasClass('fullscreen_disabled')).toBe(true);
    });
});
