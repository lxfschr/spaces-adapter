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

/* global PS */

define(function (require, exports, module) {
    "use strict";

    var EventEmitter = require("eventEmitter"),
        util = require("./util"),
        Promise = require("bluebird");


    /**
     * The Adapter object provides helper methods for dealing with the
     * low-level native binding to Photoshop. This object will typically
     * not be used by user-level code.
     *
     * Emits low-level "4 character" Photoshop events such as "slct" with
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
     * @param {string} command Event name
     * @param {?} params Info about the event, dependent on event type
     */
    Adapter.prototype._onPSEvent = function (command, params) {
        this.log("[Adapter] low-level event: " + command + "\n" + JSON.stringify(params, null, "  "));
        this.emit(command, params);
    };

    /**
     * Executes a low-level "get" call using an ActionReference.
     *
     * @param {string} reference
     * @return {Promise.<?>} The value of the reference, dependent on reference type
     */
    Adapter.prototype.get = function (reference) {
        this.log("[Adapter] execute PS.get" + "\n" + JSON.stringify(reference, null, "  "));

        return new Promise(function (resolve, reject) {
            var callback = function (response) {
                // TODO: As near as I can tell, errors from PS.getAsync are always strings,
                // and successes are always Objects. Once the PS.getAsync interface is updated,
                // this should be cleaned up.
                if (typeof(response) === "string") {
                    reject(response);
                } else {
                    resolve(response);
                }
            };

            PS.get(reference, callback);
        });
    };

    /**
     * Executes a low-level "play" call on the specified ActionDescriptor.
     *
     * @param {string} command Name of the ActionDescriptor command
     * @param {Object} params JS Object representation of ActionDescriptor key/value pairs
     * @return {Promise.<null>} Resolves when the call is complete (Note: eventually, this will
     *     return the value resulting from the execution of the ActionDescriptor, if any).
     */
    Adapter.prototype.call = function (command, params) {
        this.log("[Adapter] execute PS.call " + command + "\n" + JSON.stringify(params, null, "  "));

        return new Promise(function (resolve) {
            PS.call(command, params);
            // TODO: The current PS.call native function doesn't seem to notify
            // of success/error, or return anything via a callback. Once we
            // have a richer PS.call function, we'll need to revisit this method.
            setTimeout(resolve, 1);
        });
    };

    /**
     * Logs a string to Photoshop's ScriptListener output.
     *
     * Note: when the ScriptListener output goes away, this command will change to log to
     * Photoshop's stdout.
     *
     * @param {string} s The string to log (does NOT support string formatting like console.log).
     */
    Adapter.prototype.log = function (s) {
        PS.log("----\n[" + (new Date()).toTimeString() + "] " + s + "\n----");
    };

    /** @type {Adapter} The Adapter singleton */
    var theAdapter = new Adapter();

    // bind native phtooshop event handler to our handler function
    window.onPSEvent = theAdapter._onPSEvent.bind(theAdapter);
    
    module.exports = theAdapter;

});
