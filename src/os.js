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
     * Promisified version of low-level os functions
     */
    var _os = Promise.promisifyAll(_playground.os);

    /**
     * Promisified version of low-level keyboard focus functions
     */
    var _keyboardFocus = Promise.promisifyAll(_playground.os.keyboardFocus);

    /**
     * Promisified version of low-level keyboard focus functions
     */
    var _clipboard = Promise.promisifyAll(_playground.os.clipboard);

    /**
     * The OS object provides helper methods for dealing with operating
     * system by way of Photoshop.
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var OS = function () {
        EventEmitter.call(this);
    };
    util.inherits(OS, EventEmitter);

    /**
     * OS notifier kinds
     * 
     * @const
     * @type{Object.<string, number>}
     */
    OS.prototype.notifierKind = _os.notifierKind;

    /**
     * OS event kinds
     * 
     * @const
     * @type{Object.<string, number>}
     */
    OS.prototype.eventKind = _os.eventKind;

    /**
     * OS event modifiers
     * 
     * @const
     * @type{Object.<string, number>}
     */
    OS.prototype.eventModifiers = _os.eventModifiers;

    /**
     * OS event keyCodes
     * 
     * @const
     * @type{Object.<string, number>}
     */
    OS.prototype.eventKeyCode = _os.eventKeyCode;


    /**
     * Event handler for events from the native bridge.
     *
     * @private
     * @param {*=} err Error information
     * @param {String} event Name of the event
     * @param {*} payload
     */
    OS.prototype._eventHandler = function (err, event, payload) {
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
    OS.prototype.hasKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.isActiveAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from Photoshop to CEF. 
     *
     * @param {object=} options Options passed directly to the low-level aquire call
     * @return {Promise} Resolves once focus has been transferred.
     */
    OS.prototype.acquireKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.acquireAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from CEF to Photoshop.
     *
     * @param {object=} options Options passed directly to the low-level release call
     * @return {Promise} Resolves once focus has been transferred.
     */
    OS.prototype.releaseKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.releaseAsync(options);
    };

    /**
     * @return {Promise}
     */
    OS.prototype.postEvent = function (eventInfo, options) {
        options = options || {};

        return _os.postEventAsync(eventInfo, options);
    };

    /**
     * @param {Array.<string>=} formats
     * @return {Promise.<{data: *, format: string}>}
     */
    OS.prototype.clipboardRead = function (formats) {
        var options = {
            formats: formats || ["string"]
        };

        return _clipboard.readAsync(options);
    };

    /**
     * @param {*} data
     * @param {string} format
     * @return {Promise}
     */
    OS.prototype.clipboardWrite = function (data, format) {
        var options = {
            data: data,
            format: format || "string"
        };

        return _clipboard.writeAsync(options);
    };

    /** @type {OS} The OS singleton */
    var theOS = new OS();

    // bind native phtooshop event handler to our handler function
    _playground.setNotifier(_playground.notifierGroup.OS, {}, theOS._eventHandler.bind(theOS));
    
    module.exports = theOS;
});
