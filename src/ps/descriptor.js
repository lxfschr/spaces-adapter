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
        util = require("../util"),
        Promise = require("bluebird");

    /**
     * Promisified versions of low-level _playground.ps.descriptor functions
     *
     * @private
     */
    var _descriptor = Promise.promisifyAll(_playground.ps.descriptor);

    /**
     * The Descriptor object provides helper methods for dealing with the
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
    var Descriptor = function () {
        EventEmitter.call(this);
    };
    util.inherits(Descriptor, EventEmitter);

    /**
     * Event handler for events from the native bridge.
     *
     * @private
     * @param {*=} err Error information
     * @param {String} eventID typeID for event type
     * @param {Object} payload serialized ActionDescriptor for the event, dependent on event type
     */
    Descriptor.prototype._psEventHandler = function (err, eventID, payload) {
        if (err) {
            this.emit("error", "Failed to handle Photoshop event: " + err);
            return;
        }

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
    Descriptor.prototype.emitEvent = function (event, args) {
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

        Descriptor.super_.prototype.emitEvent.call(this, event, args);
    };

    /**
     * Add an event listener.
     * 
     * @override EventEmitter.prototype.addListener
     * @param {string|RegExp} event
     * @param {object} listener
     * @return {object} Current instance of EventEmitter for chaining.
     */
    Descriptor.prototype.addListener = function (event, listener) {
        var currentListeners = this.getListeners(event);

        if (currentListeners.length === 0) {
            _playground.ps.descriptor.addEvent(event, function (err) {
                if (err) {
                    this.emit("error", "Failed to add listener for event: " + event, err);
                }
            }.bind(this));
        }

        return Descriptor.super_.prototype.addListener.call(this, event, listener);
    };

    /**
     * Remove an event listener.
     * 
     * @override EventEmitter.prototype.removeListener
     * @param {string|RegExp} event
     * @param {object} listener
     */
    Descriptor.prototype.removeListener = function (event, listener) {
        var result = Descriptor.super_.prototype.removeListener.call(this, event, listener),
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
    Descriptor.prototype.get = function (reference) {
        var wrap = function (toWrap) {
            if (Array.isArray(toWrap)) {
                return {ref: toWrap.map(wrap).reverse()};
            } else if (typeof toWrap === "string") {
                return {ref: toWrap, enum: "$Ordn", value: "$Trgt"};
            } else {
                return toWrap;
            }
        };

        return _descriptor.getAsync(wrap(reference));
    };

    /**
     * Retrieves a property of a reference
     *
     * @param {String} reference The name of the reference
     * @param {String} property The name of the property
     * @return {Promise.<?>} The value of the property, dependent on reference type
     */
    Descriptor.prototype.getProperty = function (reference, property) {
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
    Descriptor.prototype.play = function (name, descriptor, options) {
        descriptor = descriptor || {};
        options = options || {
            interactionMode: _playground.ps.descriptor.interactionMode.SILENT
        };

        return _descriptor.playAsync(name, descriptor, options);
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
    Descriptor.prototype.batchPlay = function (commands, options, batchOptions) {
        batchOptions = batchOptions || {};
        options = options || {
            interactionMode: _playground.ps.descriptor.interactionMode.SILENT
        };

        return _descriptor.batchPlayAsync(commands, options, batchOptions);
    };

    /** @type {Descriptor} The Descriptor singleton */
    var theDescriptor = new Descriptor();

    // bind native phtooshop event handler to our handler function
    _playground.ps.descriptor.registerEventListener(theDescriptor._psEventHandler.bind(theDescriptor));
    
    module.exports = theDescriptor;
});
