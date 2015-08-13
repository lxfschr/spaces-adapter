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

/* global _spaces */

define(function (require, exports, module) {
    "use strict";

    var EventEmitter = require("eventEmitter"),
        Promise = require("bluebird"),
        _ = require("lodash");

    var util = require("../util");

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

        this._transactions = new Map();
        this._psEventHandler = this._psEventHandler.bind(this);
        this._batchPlayAsync = Promise.promisify(_spaces.ps.descriptor.batchPlay, _spaces.ps.descriptor);
        this._getAsync = Promise.promisify(_spaces.ps.descriptor.get, _spaces.ps.descriptor);
    };
    util.inherits(Descriptor, EventEmitter);

    /**
     * Low-level promisified get function.
     * @private
     * @type {function():Promise}
     */
    Descriptor.prototype._getAsync = null;

    /**
     * Low-level promisified batchPlay function.
     * @private
     * @type {function():Promise}
     */
    Descriptor.prototype._batchPlayAsync = null;

    /**
     * Transaction ID counter
     * @private
     * @type {number}
     */
    Descriptor.prototype._transactionIDCounter = 0;

    /**
     * Map of active transactions by transaction ID
     * @private
     * @type {Map.<number, {commands: Array.<object>, options: object}>}
     */
    Descriptor.prototype._transactions = null;

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
     * @see EventEmitter.prototype.emitEvent
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
     * @param {(string|Array.<object>|object)} reference object to reference to
     * @param {Array.<string>=} multiGetProperties For multiGet references, the
     *  list of properties to include in the wrapped reference.
     * @return {object} Reference to the toWrap object in a form .get will accept
     */
    var _wrap = function (reference, multiGetProperties) {
        if (Array.isArray(reference)) {
            reference = _.chain(reference)
                .map(function (ref) {
                    return _wrap(ref);
                })
                .reverse()
                .value();
        } else if (typeof reference === "string") {
            reference = {
                _ref: reference,
                _enum: "ordinal",
                _value: "targetEnum"
            };
        } else if (reference.hasOwnProperty("null")) {
            // Special case for play objects
            reference["null"] = _wrap(reference["null"]);
        }

        if (multiGetProperties) {
            reference = {
                _multiGetRef: [{
                    _propertyList: multiGetProperties
                }].concat(reference)
            };
        } else if (Array.isArray(reference)) {
            reference = {
                _ref: reference
            };
        }

        return reference;
    };

    /**
     * Constructs a property reference from the given action reference and
     * property name.
     *
     * @private
     * @param {(string|Array.<object>|object)} reference
     * @param {string} property
     * @return {Array.<object>}
     */
    var _makePropertyReference = function (reference, property) {
        var propertyDescriptor = {
                _ref: "property",
                _property: property
            };

        return Array.isArray(reference) ?
                reference.concat(propertyDescriptor) :
                [reference, propertyDescriptor];
    };

    /**
     * Executes a low-level "get" call using an ActionReference.
     *
     * @param {(string|Array.<(string|Object)>|Object)} reference The reference to retrieve. Can be:
     *     - string of a class name
     *     - Object representation of ActionReference key/value pairs
     *     - An array of a combination of the above, which will get turned into the appropriate ActionReference
     * @param {object=} options
     * @return {Promise.<?>} The value of the reference, dependent on reference type
     */
    Descriptor.prototype.get = function (reference, options) {
        if (options === undefined) {
            options = {};
        }

        var wrappedReference = _wrap(reference);

        return this._getAsync(wrappedReference, options);
    };

    /**
     * Retrieves a property of a reference
     *
     * @param {string} reference The name of the reference
     * @param {string} property The name of the property
     * @param {object=} options
     * @return {Promise.<?>} The value of the property, dependent on reference type
     */
    Descriptor.prototype.getProperty = function (reference, property, options) {
        var propertyReference = _makePropertyReference(reference, property);

        return this.get(propertyReference, options)
            .then(function (obj) {
                if (!obj || !obj.hasOwnProperty(property)) {
                    throw new Error("No such property: " + property);
                }

                return obj[property];
            });
    };

    /**
     * Executes a "set" call on the given property of the reference to set to value.
     *
     * @param {object} reference A full reference object, possibly created by lib/reference.js wrappers
     * @param {string} property Property name to edit
     * @param {object|string} value Desired new value of the property
     * @param {Object=} options options, defaults to "silent"
     * @return {Promise.<object>} Resolves when property is set
     */
    Descriptor.prototype.setProperty = function (reference, property, value, options) {
        if (!reference.hasOwnProperty("_ref")) {
            throw new Error("You must pass a full reference to setProperty or else PS will crash!");
        }

        // We need to reverse this because for play calls _makePropertyReference orders it wrong
        var propertyReference = _makePropertyReference(reference, property).reverse(),
            propertyValue = {
                "_obj": property,
                "_value": value
            },
            propertyDescriptor = {
                "null": { "_ref": propertyReference },
                "to": propertyValue
            };

        return this.play("set", propertyDescriptor, options);
    };

    /**
     * Get a list of properties on a continguous range of references, (e.g.,
     * layers at a contiguous range of layer indices).
     * 
     * @param {object} reference
     * @param {{range: string, index: number=, count: number=}} rangeOpts By default,
     *  count is -1, which indicates that the rest of the range should be fetched, and
     *  index is 1.
     * @param {Array.<string>} properties
     * @param {object=} options
     * @return {Promise.<Array.<Object.<string, *>>>}
     */
    Descriptor.prototype.getPropertiesRange = function (reference, rangeOpts, properties, options) {
        var range = rangeOpts.range,
            index = rangeOpts.hasOwnProperty("index") ? rangeOpts.index : 1,
            count = rangeOpts.hasOwnProperty("count") ? rangeOpts.count : -1;

        if (options === undefined) {
            options = {};
        }

        var multiRef = {
            _multiGetRef: [
                {
                    _propertyList: properties
                },
                {
                    _range: range,
                    _index: index,
                    _count: count
                },
                reference
            ]
        };

        return this._getAsync(multiRef, options).get("list");
    };

    /**
     * Get a single property on a continguous range of references, (e.g.,
     * layers at a contiguous range of layer indices).
     * 
     * @see Descriptor.prototype.getPropertiesRange
     * @param {object} reference
     * @param {{range: string, index: number=, count: number=}} rangeOpts
     * @param {string} property
     * @param {object=} options
     * @return {Promise.<Array.<*>>}
     */
    Descriptor.prototype.getPropertyRange = function (reference, rangeOpts, property, options) {
        return this.getPropertiesRange(reference, rangeOpts, [property], options)
            .then(function (results) {
                return _.pluck(results, property);
            });
    };

    /**
     * Defines an enumeration of three constants that control dialog display
     * while executing action descriptors: DONT_DISPLAY, DISPLAY and SILENT.
     * 
     * @const
     * @type {Object.<string, number>}
     */
    Descriptor.prototype.interactionMode = _spaces.ps.descriptor.interactionMode;

    /**
     * Executes a low-level "play" call on the specified ActionDescriptor.
     * 
     * NOTE: play is now implemented internally with batchPlay, which has
     * additional options for describing history states.
     *
     * @param {string} name Name of the ActionDescriptor command
     * @param {object=} descriptor JS Object representation of ActionDescriptor key/value pairs, defaults to {}
     * @param {object=} options options, defaults to "silent"
     * @return {Promise.<object>} Resolves when the call is complete (Note: eventually, this will
     *     return the value resulting from the execution of the ActionDescriptor, if any).
     */
    Descriptor.prototype.play = function (name, descriptor, options) {
        var commands = [{
            name: name,
            descriptor: descriptor || {}
        }];

        return this.batchPlay(commands, options).get(0);
    };

    /**
     * Executes a low-level "play" call on the PlayObject by unwrapping it
     *
     * @param {PlayObject} playObject Contains command, descriptor and options information
     * @param {object=} options Overrides any options in the playObject
     * @returns {Promise} Resolves to the result of the call
     */
    Descriptor.prototype.playObject = function (playObject, options) {
        return this.batchPlayObjects([playObject], options).get(0);
    };
    
    /**
     * Executes a low-level "batchPlay" call on the given commands immediately
     * skipping transaction collection
     *
     * @param {Array.<{name: string, descriptor: object, options: object=}>} commands Array of 
     *  ActionDescriptors to play
     * @param {{continueOnError: boolean=}=} options Options applied to the execution of the batchPlay
     * @return {Promise.<Array.<object>>} Resolves with the list of ActionDescriptor results, or rejects
     *      with either an adapter error, or a single command error if not continueOnError mode. In
     *      continueOnError mode, always resolve with both the results and errors arrays.
     */
    Descriptor.prototype._batchPlayImmediate = function (commands, options) {
        if (!options.hasOwnProperty("interactionMode")) {
            options.interactionMode = this.interactionMode.SILENT;
        }

        return this._batchPlayAsync(commands, options)
            .then(function (response) {
                // Never reject in continueOnError mode; the caller must always check the results
                if (options.continueOnError) {
                    return response;
                }

                var theError;
                response[1].some(function (error) {
                    if (error) {
                        theError = error;
                        return true;
                    }
                });

                if (theError) {
                    // otherwise, throw the first error, because there is only one
                    throw theError;
                }
                
                // if there are no errors, resolve with just the results
                return response[0];
            });
    };

    /**
     * Adds the given commands with the options to the given existing transaction
     *
     * @private
     * @param {number} tid Transaction ID, must have been started with beginTransaction
     * @param {Array.<{name: string, descriptor: object, options: object=}>} commands Array of 
     *  ActionDescriptors to play
     * @param {{continueOnError: boolean=}=} options Options applied to the execution of the batchPlay
     */
    Descriptor.prototype._addToTransaction = function (tid, commands, options) {
        var transactionInfo = this._transactions.get(tid);
        if (!transactionInfo) {
            throw new Error("Invalid transaction ID: " + tid);
        }

        var nextOptions = _.merge(transactionInfo.options, options, function (a, b) {
            if (a === undefined) {
                return b;
            } else if (b === undefined) {
                return a;
            } else if (!_.isEqual(a, b)) {
                throw new Error("Incompatible options in transaction.");
            } else {
                return a;
            }
        });

        transactionInfo.options = nextOptions;
        transactionInfo.commands = transactionInfo.commands.concat(commands);

        return Promise.resolve(new Array(commands.length));
    };

    /**
     * Initiates a transaction, saving all batchPlay calls being added to this transaction
     * from being played until @see endTransaction is called
     *
     * @param {{historyStateInfo: object}} options contains a single history state information for this
     * transaction to apply
     * @return {number} Initiated transaction ID
     */
    Descriptor.prototype.beginTransaction = function (options) {
        var transactionID = this._transactionIDCounter++,
            transactionInfo = {
                txOptions: options || {},
                options: {},
                commands: []
            };

        this._transactions.set(transactionID, transactionInfo);

        return transactionID;
    };

    /**
     * Finalizes a transaction, playing all accumulated batchPlay objects
     * under the same history state
     *
     * @param {number} tid Transaction ID
     * @return {Promise.<Array.<object>>} Resolves with the list of ActionDescriptor results, or rejects
     *      with either an adapter error, or a single command error if not continueOnError mode. In
     *      continueOnError mode, always resolve with both the results and errors arrays.
     */
    Descriptor.prototype.endTransaction = function (tid) {
        var transactionInfo = this._transactions.get(tid);
        if (!transactionInfo) {
            throw new Error("Invalid transaction ID: " + tid);
        }

        var finalOptions = _.merge(transactionInfo.options, transactionInfo.txOptions);

        return this._batchPlayImmediate(transactionInfo.commands, finalOptions);
    };

    /**
     * Executes a low-level "batchPlay" call on the specified ActionDescriptors.
     *
     * @param {Array.<{name: string, descriptor: object, options: object=}>} commands Array of 
     *  ActionDescriptors to play
     * @param {{continueOnError: boolean=}=} options Options applied to the execution of the batchPlay
     * @return {Promise.<Array.<object>>} Resolves with the list of ActionDescriptor results, or rejects
     *      with either an adapter error, or a single command error if not continueOnError mode. In
     *      continueOnError mode, always resolve with both the results and errors arrays.
     */
    Descriptor.prototype.batchPlay = function (commands, options) {
        options = options || {};

        if (options.hasOwnProperty("transaction")) {
            return this._addToTransaction(options.transaction, commands, options);
        } else {
            return this._batchPlayImmediate(commands, options);
        }
    };

    /**
     * Executes a low-level "batchPlay" call on the specified PlayObjects.
     *
     * @param {Array.<PlayObject>} objects Array of PlayObjects to play
     * @param {{continueOnError: boolean=}=} options Options applied to the execution of the batchPlay
     * @return {Promise.<Array.<object>>} Resolves with the list of ActionDescriptor results. 
     */
    Descriptor.prototype.batchPlayObjects = function (objects, options) {
        var commands = objects.map(function (object) {
            var command = {
                name: object.command,
                descriptor: _wrap(object.descriptor)
            };

            if (object.hasOwnProperty("options")) {
                command.options = object.options;
            }

            return command;
        });

        return this.batchPlay(commands, options);
    };

    /**
     * Executes a sequence of low-level "get" calls using batchPlay.
     *
     * NOTE: batchGet is currently slightly slower than simply executing the
     * get calls independently, which is almost certainly an adapter bug.
     * If that bug isn't fixed, we should consider replacing the implementation
     * of this method with one that simply performs the gets independently.
     *
     * @see Descriptor.prototype.get
     * @see Descriptor.prototype.batchPlay
     * @param {Array.<object>} references The references to retrieve.
     * @param {object=} options
     * @return {Promise.<Array.<object>>} Resolves with an array of results.
     */
    Descriptor.prototype.batchGet = function (references, options) {
        var commands = references.map(function (reference) {
            return {
                name: "get",
                descriptor: {
                    "null": _wrap(reference)
                }
            };
        });

        return this.batchPlay(commands, options);
    };

    /**
     * Executes a sequence of low-level "getProperty" calls using batchPlay.
     *
     * @see Descriptor.prototype.get
     * @see Descriptor.prototype.batchPlay
     * @param {Array.<{reference: object, property: string}>} refObjs
     *      The references and properties to retrieve.
     * @param {object=} options
     * @return {Promise.<Array.<object>>} Resolves with an array of property results.
     */
    Descriptor.prototype.batchGetProperties = function (refObjs, options) {
        options = options || {};

        var propertyReferences = refObjs.map(function (refObj) {
            return _makePropertyReference(refObj.reference, refObj.property);
        });

        return this.batchGet(propertyReferences, options)
            .then(function (response) {
                if (options.continueOnError) {
                    return response;
                }

                return response.map(function (result, index) {
                    var property = refObjs[index].property;
                    if (!result || !result.hasOwnProperty(property)) {
                        throw new Error("No such property: " + property);
                    }

                    return result[property];
                });
            });
    };

    /**
     * Fetch optional properties, which might not exist, and ignore errors.
     * 
     * @param {object} reference
     * @param {Array.<string>} properties
     * @return {Promise.<object>} Always resolves to an object, but keys that
     *  don't exist are omitted from the resolved value.
     */
    Descriptor.prototype.batchGetOptionalProperties = function (reference, properties) {
        var makeRefObj = function (property) {
            return {
                reference: reference,
                property: property
            };
        };

        var refObjs = properties.map(makeRefObj),
            options = {
                continueOnError: true
            };

        return this.batchGetProperties(refObjs, options)
            .then(function (results) {
                var values = results[0];

                return values.reduce(function (result, value, index) {
                    var property = properties[index];
                    if (value && value.hasOwnProperty(property)) {
                        result[property] = value[property];
                    }
                    return result;
                }, {});
            });
    };

    /**
     * Executes a sequence of low-level "getProperty" calls for a single property
     * using batchPlay.
     *
     * @see Descriptor.prototype.get
     * @see Descriptor.prototype.batchPlay
     * @param {object} references The references to retrieve
     * @param {string} property The property to retrieve
     * @param {object=} options
     * @return {Promise.<Array.<object>>} Resolves with an array of property results.
     */
    Descriptor.prototype.batchGetProperty = function (references, property, options) {
        var refObjs = references.map(function (reference) {
            return {
                reference: reference,
                property: property
            };
        });

        return this.batchGetProperties(refObjs, options);
    };

    /**
     * Efficiently get a set of properties on an arbitrary set of references.
     * 
     * @param {Array.<object|string|Array.<object>>} references
     * @param {Array.<string>} properties
     * @param {object=} options Use continueOnError to allow some properties to
     *  not be returned
     * @return {Promise.<Array.<Object.<string, *>>>}
     */
    Descriptor.prototype.batchMultiGetProperties = function (references, properties, options) {
        if (properties.length === 0) {
            return Promise.resolve([{}]);
        }

        if (options === undefined) {
            options = {};
        }

        var multiGetOptions = {
            useMultiGet: true,
            failOnMissingProperty: !options.continueOnError
        };

        var commands = references.map(function (reference) {
            var descriptor = {
                null: _wrap(reference, properties)
            };

            return {
                name: "get",
                descriptor: descriptor,
                options: multiGetOptions
            };
        });

        return this.batchPlay(commands, options)
            .then(function (response) {
                if (options.continueOnError) {
                    return response[0];
                } else {
                    return response;
                }
            });
    };

    /**
     * Efficiently get a set of properties on a single reference. Not all
     * properties need be present.
     * 
     * @param {object|string|Array.<object>} reference
     * @param {Array.<string>} properties
     * @param {object=} options Use continueOnError to allow some properties to
     *  not be returned
     * @return {Promise.<Object.<string, *>>}
     */
    Descriptor.prototype.multiGetOptionalProperties = function (reference, properties, options) {
        if (properties.length === 0) {
            return Promise.resolve({});
        }

        if (options === undefined) {
            options = {};
        }

        return this._getAsync(_wrap(reference, properties), options);
    };

    /**
     * Effeciently get a set of properties on a single reference.
     * 
     * @param {object|string|Array.<object>} reference
     * @param {Array.<string>} properties
     * @param {object=} options Use continueOnError to allow some properties to
     *  not be returned
     * @return {Promise.<Object.<string, *>>}
     */
    Descriptor.prototype.multiGetProperties = function (reference, properties, options) {
        if (options === undefined) {
            options = {};
        }

        // FIXME: This following option doesn't work when properties ===
        // ["targetLayers"], which is why the .tap below is needed.
        // See Watson 4010314 for details.
        options.failOnMissingProperty = true;

        return this.multiGetOptionalProperties(reference, properties, options)
            .tap(function (obj) {
                properties.forEach(function (property) {
                    if (!obj.hasOwnProperty(property)) {
                        throw new Error("No such property: " + property);
                    }
                });
            });
    };

    /**
     * The Descriptor singleton
     * @type {Descriptor} 
     */
    var descriptor = new Descriptor();

    // bind native Photoshop event handler to our handler function
    _spaces.setNotifier(_spaces.notifierGroup.PHOTOSHOP, {}, descriptor._psEventHandler);
    
    module.exports = descriptor;
});
