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
     * Wraps certain type of parameters making it easier to call Descriptor.prototype.get
     * For arrays, returns the reference to array recursively mapping everything inside
     * For string values, references to the currently active one
     * For objects, leaves them as is.
     * 
     * @private
     * @param {(string|Array.Object|Object)} toWrap object to reference to
     * @return {Object} Reference to the toWrap object in a form .get will accept
     */
    var _wrap = function (toWrap) {
        var reference;

        if (Array.isArray(toWrap)) {
            reference = {
                ref: toWrap.map(_wrap).reverse()
            };
        } else if (typeof toWrap === "string") {
            reference = {
                ref: toWrap,
                enum: "$Ordn",
                value: "$Trgt"
            };
        } else {
            reference = toWrap;
        }

        return reference;
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
        var wrappedReference = _wrap(reference),
            getAsync = Promise.promisify(_playground.ps.descriptor.get,
                _playground.ps.descriptor);

        return getAsync(wrappedReference);
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

        var playAsync = Promise.promisify(_playground.ps.descriptor.play,
            _playground.ps.descriptor);

        return playAsync(name, descriptor, options);
    };

    /**
     * Executes a low-level "play" call on the PlayObject by unwrapping it
     *
     * @param {PlayObject} playObject Contains command, descriptor and options information
     *
     * @returns {Promise} Resolves to the result of the call
     */
    Descriptor.prototype.playObject = function (playObject) {
        var command = playObject.command,
            descriptor = playObject.descriptor,
            options = playObject.options;

        return this.play(command, descriptor, options);
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

        var batchPlayAsync = Promise.promisify(_playground.ps.descriptor.batchPlay,
            _playground.ps.descriptor);

        return batchPlayAsync(commands, options, batchOptions);
    };

    /**
     * Executes a low-level "batchPlay" call on the specified PlayObjects.
     *
     * @param {Array.<PlayObject>} objects Array of PlayObjects to play
     * @param {object=} options Options applied to the execution of each PlayObject individually
     * @param {{continueOnError: boolean}=} batchOptions Options that control how the batch of
     *      ActionDescriptors is executed.
     * @return {Promise.<Array.object>} Resolves with the list of ActionDescriptor results. 
     */
    Descriptor.prototype.batchPlayObjects = function (objects, options, batchOptions) {
        batchOptions = batchOptions || {};
        options = options || {
            interactionMode: _playground.ps.descriptor.interactionMode.SILENT
        };
        
        var commands = objects.map(function (object) {
            return {
                name: object.command,
                descriptor: object.descriptor
            };
        });

        return this.batchPlay(commands, options, batchOptions);
    };

    /** @type {Descriptor} The Descriptor singleton */
    var theDescriptor = new Descriptor();

    // bind native phtooshop event handler to our handler function
    _playground.setNotifier(_playground.notifierGroup.PHOTOSHOP, {}, theDescriptor._psEventHandler.bind(theDescriptor));
    
    module.exports = theDescriptor;
});
