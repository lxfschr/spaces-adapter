/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/* global _playground, console */

define(function (require, exports, module) {
    "use strict";

    var EventEmitter = require("eventEmitter"),
        util = require("./util"),
        Promise = require("bluebird");

    /**
     * Promisified version of low-level keyboard focus functions
     */
    var _keyboardFocus = Promise.promisifyAll(_playground.os.keyboardFocus);

    /**
     * Promisified version of low-level os functions
     */
    var _os = Promise.promisifyAll(_playground.os);

    /**
     * The OSAdapter object provides helper methods for dealing with operating
     * system by way of Photoshop.
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var OSAdapter = function () {
        EventEmitter.call(this);
    };
    util.inherits(OSAdapter, EventEmitter);

    /**
     * Event handler for events from the native bridge.
     *
     * @private
     * @param {*=} err Error information
     * @param {String} event Name of the event
     * @param {*} payload
     */
    OSAdapter.prototype._eventHandler = function (err, event, payload) {
        if (err) {
            // TODO: emit an error event, as in adapter.js
            console.error("Failed to handle OS event: " + err);
            return;
        }
        
        this.emit("all", event, payload);
        this.emit(event, payload);
    };

    /**
     * Determine whether or not CEF currently has keyboard focus.
     *
     * @param {object=} options Options passed directly to the low-level call
     * @return {Promise} Resolves once the status of focus has been determined.
     */
    OSAdapter.prototype.hasKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.isActiveAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from Photoshop to CEF. 
     *
     * @param {object=} options Options passed directly to the low-level aquire call
     * @return {Promise} Resolves once focus has been transferred.
     */
    OSAdapter.prototype.acquireKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.acquireAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from CEF to Photoshop.
     *
     * @param {object=} options Options passed directly to the low-level release call
     * @return {Promise} Resolves once focus has been transferred.
     */
    OSAdapter.prototype.releaseKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.releaseAsync(options);
    };

    /**
     * @return {Promise}
     */
    OSAdapter.prototype.postEvent = function (eventInfo, options) {
        options = options || {};

        return _os.postEventAsync(eventInfo, options);
    };

    /**
     * OS event types
     * 
     * @const
     * @type{object.<string>}
     */
    OSAdapter.prototype.eventTypes = _os.eventTypes;

    /**
     * OS event kinds
     * 
     * @const
     * @type{object.<number>}
     */
    OSAdapter.prototype.eventKind = _os.eventKind;

    /**
     * OS event modifiers
     * 
     * @const
     * @type{object.<number>}
     */
    OSAdapter.prototype.eventModifiers = _os.eventModifiers;

    /** @type {OSAdapter} The OSAdapter singleton */
    var theOSAdapter = new OSAdapter();

    // bind native phtooshop event handler to our handler function
    _playground.os.registerEventListener(theOSAdapter._eventHandler.bind(theOSAdapter));
    
    module.exports = theOSAdapter;
});
