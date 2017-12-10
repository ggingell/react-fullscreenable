// __mocks__/fullscreen.js
'use strict';

/* This mocks the Fullscreen polyfill seen here:
 * https://github.com/chrisdickinson/fullscreen/blob/master/index.js
 * It returns an event emitter with:
 *     on - Function to attach events
 *     request - Function to request fullscreen
 *     release - Function to exit fullscreen
 *     dispose - Function to remove event listeners
 *
 * It has two static methods:
 *     available - Checks if document.body has fullscreen request methods
 *     enabled   - Checks if document.fullscreenenabled is true
 *
 */

/* Mock the event emitter factory itself.
 *  In the real module this method accepts an element that is has
 *  the appropriate event listeners added to it. We've mocked them all below.
 */
function fullscreen() {
    return {
        on: on,
        request: request,
        release: release,
        dispose: disposeMock,
    };
}

// The fullscreen event emitter only supports these event names:
const validEvents = ['attain', 'release', 'error'];
// We'll use a pojo to store them e.g. { attain: someCbFunc }
let listeners = {};
function __resetListeners() {
    listeners = {};
}

//
// Event emitter methods
//

function on(name, cb) {
    if (listeners[name] || typeof listeners[name] === 'function') {
        console.error('Duplicate event name supplied to fullscreen.on()');
    }

    if (validEvents.indexOf(name) < 0) {
        console.error(
            'Invalid event listener name supplied to fullscreen.on(...) should be one of ',
            validEvents
        );
    }

    listeners[name] = cb;
}

function request() {
    let cb = listeners['attain'];

    if (cb) {
        if (_simulateError) {
            let ecb = listeners['error'];
            if (ecb) {
                ecb(new Error('Mock fullscreen error event message'));
            } else {
                console.error('Fullscreen error occured but no listener was registered!');
            }
        } else {
            process.nextTick(cb);
        }
    } else {
        console.error('Fullscreen request() was called but no listener was registered!');
    }
}

function release() {
    let cb = listeners['release'];
    if (cb) {
        process.nextTick(cb);
    } else {
        console.error('Fullscreen release() was called but no listener was registered!');
    }
}

// Set module level function mocks
fullscreen.available = jest.fn();
fullscreen.enabled = jest.fn();

function __setAvailable(value) {
    fullscreen.available.mockReturnValue(value);
}

function __setEnabled(value) {
    fullscreen.enabled.mockReturnValue(value);
}

// Internal flag for the mock
let _simulateError = false;
function __setSimulateError() {
    _simulateError = true;
}

let disposeMock = jest.fn();
function __getDisposeMock() {
    return disposeMock;
}

// Set test only helper setters
fullscreen.__setSimulateError = __setSimulateError;
fullscreen.__setAvailable = __setAvailable;
fullscreen.__setEnabled = __setEnabled;
fullscreen.__resetListeners = __resetListeners;
fullscreen.__getDisposeMock = __getDisposeMock;

module.exports = fullscreen;
