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

/* global _playground */

define(function (require, exports, module) {
    "use strict";

    var EventEmitter = require("eventEmitter"),
        util = require("./util"),
        Promise = require("bluebird");

    /**
     * Promisifyable versions of low-level _playground.ps.identity functions
     *
     * @private
     */
    var _identityDesc = function (desc, cb) {
        _playground._debug.descriptorIdentity(desc, null, function (err, odesc) { cb(err, odesc); });
    };

    var _identityRef = function (ref, cb) {
        _playground._debug.descriptorIdentity(null, ref, function (err, _, oref) { cb(err, oref); });
    };
    
    var _identityString = function (string, cb) {
        var nullInput = (typeof string !== "string" || string.length === 0),
            ref = nullInput ? null : { ref: string };
        
        _playground._debug.descriptorIdentity(null, ref, function (err, _, oref) {
            cb(err, oref ? oref.ref : null);
        });
    };

    /**
     * Promisified versions of low-level _playground.ps.descriptor functions
     *
     * @private
     */
    var _descriptor = {
        get: Promise.promisify(_playground.ps.descriptor.get),
        play: Promise.promisify(_playground.ps.descriptor.play),
        batchPlay: Promise.promisify(_playground.ps.descriptor.batchPlay),
        loopbackDescriptor: Promise.promisify(_identityDesc),
        loopbackReference: Promise.promisify(_identityRef),
        loopbackString: Promise.promisify(_identityString)
    };

    /**
     * Promisified version of low-level keyboard focus functions
     */
    var _keyboardFocus = Promise.promisifyAll(_playground.os.keyboardFocus);

    /**
     * Promisified version of modal text edit state finishing funcion 
     */
    var _endModalTextState = Promise.promisify(_playground.ps.endModalTextState);
     
    /**
     * The Adapter object provides helper methods for dealing with the
     * low-level native binding to Photoshop. This object will typically
     * not be used by user-level code.
     *
     * Emits low-level Photoshop events such as "select" with
     * the following parameters:
     *    1. @param {?} info about the event, dependent on event type (Note:
     *           this should become more specific as the native interface is
     *           further defined.)
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var Adapter = function () {
        EventEmitter.call(this);
    };
    util.inherits(Adapter, EventEmitter);

    /**
     * Event handler for events from the native bridge.
     *
     * @private
     * @param {*=} err Error information
     * @param {String} eventID typeID for event type
     * @param {Object} payload serialized ActionDescriptor for the event, dependent on event type
     */
    Adapter.prototype._psEventHandler = function (err, eventID, payload) {
        // this.log("[Adapter] low-level event: " + eventID + "\n" + JSON.stringify(payload, null, "  "));

        this.emit("all", eventID, payload);
        this.emit(eventID, payload);
    };

    /**
     * Emit the named event with the given arguments as parameters. Throws if the
     * event is "error" and there are no listeners.
     * 
     * @override EventEmitter.prototype.emitEvent
     * @param {string|RegExp} event Name of the event to emit and execute listeners for
     * @param {Array=} args Optional array of arguments to be passed to each listener
     * @return {object} Current instance for chaining
     */
    Adapter.prototype.emitEvent = function (event, args) {
        if (event === "error") {
            var listeners = this.getListeners(event);

            if (listeners.length === 0) {
                var message,
                    error;

                if (args.length > 0 && typeof args[0] === "string") {
                    message = args.shift();
                } else {
                    message = "Unhandled error event";
                }

                error = new Error(message);
                error.args = args;
                throw error;
            }
        }

        Adapter.super_.prototype.emitEvent.call(this, event, args);
    };

    /**
     * Add an event listener.
     * 
     * @override EventEmitter.prototype.addListener
     * @param {string|RegExp} event
     * @param {object} listener
     * @return {object} Current instance of EventEmitter for chaining.
     */
    Adapter.prototype.addListener = function (event, listener) {
        var currentListeners = this.getListeners(event);

        if (currentListeners.length === 0) {
            _playground.ps.descriptor.addEvent(event, function (err) {
                if (err) {
                    this.emit("error", "Failed to add listener for event: " + event, err);
                }
            }.bind(this));
        }

        return Adapter.super_.prototype.addListener.call(this, event, listener);
    };

    /**
     * Remove an event listener.
     * 
     * @override EventEmitter.prototype.removeListener
     * @param {string|RegExp} event
     * @param {object} listener
     */
    Adapter.prototype.removeListener = function (event, listener) {
        var result = Adapter.super_.prototype.removeListener.call(this, event, listener),
            currentListeners = this.getListeners(event);

        if (currentListeners.length === 0) {
            _playground.ps.descriptor.removeEvent(event, function (err) {
                if (err) {
                    this.emit("Failed to remove listener for event: " + event, err);
                }
            }.bind(this));
        }

        return result;
    };

    /**
     * Executes a low-level "get" call using an ActionReference.
     *
     * @param {(string|Array.<(string|Object)>|Object)} reference The reference to retrieve. Can be:
     *     - string of a class name
     *     - Object representation of ActionReference key/value pairs
     *     - An array of a combination of the above, which will get turned into the appropriate ActionReference
     * @return {Promise.<?>} The value of the reference, dependent on reference type
     */
    Adapter.prototype.get = function (reference) {
        var wrap = function (toWrap) {
            if (Array.isArray(toWrap)) {
                return {ref: toWrap.map(wrap).reverse()};
            } else if (typeof toWrap === "string") {
                return {ref: toWrap, enum: "$Ordn", value: "$Trgt"};
            } else {
                return toWrap;
            }
        };

        return _descriptor.get(wrap(reference));
    };

    /**
     * Retrieves a property of a reference
     *
     * @param {String} reference The name of the reference
     * @param {String} property The name of the property
     * @return {Promise.<?>} The value of the property, dependent on reference type
     */
    Adapter.prototype.getProperty = function (reference, property) {
        var propertyDescriptor = {
            ref: "$Prpr",
            property: property
        };

        return this.get([reference, propertyDescriptor])
            .then(function (obj) {
                if (!obj.hasOwnProperty(property)) {
                    throw new Error("No such property: " + property);
                }

                return obj[property];
            });
    };

    /**
     * Executes a low-level "play" call on the specified ActionDescriptor.
     *
     * @param {string} name Name of the ActionDescriptor command
     * @param {Object=} descriptor JS Object representation of ActionDescriptor key/value pairs, defaults to {}
     * @param {Object=} options options, defaults to "silent"
     * @return {Promise.<object>} Resolves when the call is complete (Note: eventually, this will
     *     return the value resulting from the execution of the ActionDescriptor, if any).
     */
    Adapter.prototype.call = function (name, descriptor, options) {
        descriptor = descriptor || {};
        options = options || {
            interactionMode: _playground.ps.descriptor.interactionMode.SILENT
        };

        return _descriptor.play(name, descriptor, options);
    };

    /**
     * Executes a low-level "batchPlay" call on the specified ActionDescriptors.
     *
     * @param {Array.<{name: string, descriptor: object}>} commands Array of ActionDescriptors to play
     * @param {object=} options Options applied to the execution of each ActionDescriptor individually
     * @param {{continueOnError: boolean=}}=} batchOptions Options that control how the batch of
     *      ActionDescriptors is executed.
     * @return {Promise.<Array.object>} Resolves with the list of ActionDescriptor results. 
     */
    Adapter.prototype.batchCall = function (commands, options, batchOptions) {
        batchOptions = batchOptions || {};
        options = options || {
            interactionMode: _playground.ps.descriptor.interactionMode.SILENT
        };

        return _descriptor.batchPlay(commands, options, batchOptions);
    };

    /**
     * Determine whether or not CEF currently has keyboard focus.
     *
     * @param {object=} options Options passed directly to the low-level call
     * @return {Promise} Resolves once the status of focus has been determined.
     */
    Adapter.prototype.hasKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.isActiveAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from Photoshop to CEF. 
     *
     * @param {object=} options Options passed directly to the low-level aquire call
     * @return {Promise} Resolves once focus has been transferred.
     */
    Adapter.prototype.acquireKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.acquireAsync(options);
    };

    /**
     * Request that keyboard focus be transferred from CEF to Photoshop.
     *
     * @param {object=} options Options passed directly to the low-level release call
     * @return {Promise} Resolves once focus has been transferred.
     */
    Adapter.prototype.releaseKeyboardFocus = function (options) {
        options = options || {};

        return _keyboardFocus.releaseAsync(options);
    };
    
    /**
     * Commits or cancel the current modal text edit state
     *
     * @param {bool=false} commit True to commit, false to cancel
     * @return {Promise} Resolves once the text state is ended
     */
    Adapter.prototype.endModalTextState = function (commit) {
        commit = commit || false;
        
        return _endModalTextState(commit);
    };

    /**
     * Executes a low-level "identity" call on the specified ActionDescriptor.
     *  Used to verify notation by parsing to ActionDescriptor and then serializing back to JS Object representation
     *
     * @param {Object=} params JS Object representation of ActionDescriptor key/value pairs.
     * @return {Promise.<Object>} The JS Object representation of the input ActionDescriptor
     */

    Adapter.prototype.loopbackDescriptor = _descriptor.loopbackDescriptor;

    /**
     * Executes a low-level "identity" call on the specified ActionReference.
     *  Used to verify notation by parsing to ActionReference and then serializing back to JS Object representation
     *
     * @param {Object=} params JS Object representation of ActionReference key/value pairs.
     * @return {Promise.<Object>} The JS Object representation of the input ActionReference
     */
    Adapter.prototype.loopbackReference = _descriptor.loopbackReference;

    /**
     * Executes a low-level "identity" call on the specified Action Descriptor ID.
     *
     * @param {String=} Runtime ID string (e.g: "name")  or $-prefixed OSType ID (e.g: "$Nm  ")
     * @return {Promise.<String>} The Runtime ID string for the given ID, if available.
     */
    Adapter.prototype.loopbackString = _descriptor.loopbackString;

    /**
     * Logs a string to Photoshop's ScriptListener output.
     *
     * Note: when the ScriptListener output goes away, this command will change to log to
     * Photoshop's stdout.
     *
     * @param {string} s The string to log (does NOT support string formatting like console.log).
     */
    Adapter.prototype.log = function (s) {
        _playground._debug.logMessage("----\n[" + (new Date()).toTimeString() + "] " + s + "\n----");
    };

    /** @type {Adapter} The Adapter singleton */
    var theAdapter = new Adapter();

    // bind native phtooshop event handler to our handler function
    _playground.ps.descriptor.registerEventListener(theAdapter._psEventHandler.bind(theAdapter));
    
    module.exports = theAdapter;
});
