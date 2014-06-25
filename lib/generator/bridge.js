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

define(function (require, exports, module) {
    "use strict";

    var Promise = require("bluebird");

    var NodeDomain = require("./NodeDomain");

    var BRIDGE_DOMAIN_REL_PATH = "/playground-api/lib/generator/bridge-domain.js";

    /**
     * GeneratorBridge presents a high-level interface to a Generator instance.
     * 
     * @constructor
     */
    var GeneratorBridge = function () {
        var href = window.location.href,
            playgroundAPIIndex = href.lastIndexOf("/playground-api"),
            playgroundURI,
            domainSpecURI;

        if (playgroundAPIIndex > 0) {
            playgroundURI = href.substring(0, playgroundAPIIndex);
            domainSpecURI = playgroundURI + BRIDGE_DOMAIN_REL_PATH;
        } else {
            playgroundURI = href.substring(0, href.lastIndexOf("/playground-www"));
            domainSpecURI = playgroundURI + "/playground-www/bower_components" + BRIDGE_DOMAIN_REL_PATH;
        }

        var domainSpecPath = domainSpecURI.substring("file://".length);
        this._domain = new NodeDomain("generator-bridge", domainSpecPath);
    };

    /**
     * Get a set of open document IDs.
     * 
     * @see Generator.prototype.getOpenDocumentIDs
     * @return {Promise.<Array.<number>>}
     */
    GeneratorBridge.prototype.getOpenDocumentIDs = function () {
        return this._domain.exec("getOpenDocumentIDs");
    };

    /**
     * Get a document info object for the given document ID.
     * 
     * @see Generator.prototype.getDocumentInfo
     * @param {number=} id
     * @param {flags=} flags
     * @return {Promise.<object>}
     */
    GeneratorBridge.prototype.getDocumentInfo = function (id, flags) {
        return this._domain.exec("getDocumentInfo", id, flags);
    };

    /**
     * Register a listener for a Photoshop event.
     * 
     * @see Generator.prototype.onPhotoshopEvent
     * @param {string} event
     * @param {function()} listener
     * @param {boolean=} once
     * @return {Promise}
     */
    GeneratorBridge.prototype.onPhotoshopEvent = function (event, listener, once) {
        var listeners = this._domain.getListeners(event),
            promise;

        if (listeners.length > 0) {
            promise = Promise.resolve();
        } else {
            promise = this._domain.exec("addPhotoshopEvent", event, once);

            promise.then(function () {
                // addPhotoshopEvent registers new events in the generator-bridge domain;
                // we need to refresh the NodeDomain interface so it can listen for these 
                // new events on its underlying NodeConnection and re-emit them.
                this._domain.refreshInterface();
            }.bind(this));
        }

        if (once) {
            this._domain.once(event, listener);
        } else {
            this._domain.on(event, listener);
        }
        
        return promise;
    };

    /**
     * @see GeneratorBridge.prototype.onPhotoshopEvent
     */
    GeneratorBridge.prototype.addPhotoshopEventListener = GeneratorBridge.prototype.onPhotoshopEvent;

    /**
     * Register a one-time listener for a Photoshop event.
     * 
     * @see Generator.prototype.oncePhotoshopEvent
     * @param {string} event
     * @param {function()} listener
     * @return {Promise}
     */
    GeneratorBridge.prototype.oncePhotoshopEvent = function (event, listener) {
        return this.onPhotoshopEvent(event, listener, true);
    };

    /**
     * Remove a listener for a Photoshop event.
     * 
     * @see Generator.prototype.onPhotoshopEvent
     * @param {string} event
     * @param {function()} listener
     * @return {Promise}
     */
    GeneratorBridge.prototype.removePhotoshopEventListener = function (event, listener) {
        var listeners = this._domain.getListeners(),
            promise;

        this._domain.off(event, listener);

        if (listeners.length > 0) {
            promise = Promise.resolve();
        } else {
            promise = this._domain.exec("removePhotoshopEvent", event);
        }

        return promise;
    };

    /**
     * Evaluate an ExtendScript string in Photoshop.
     * 
     * @param {string} jsx The ExtendScript string to evaluate.
     * @return {Promise.<string>} Promise that resolves with the stringified result
     *      of evaluating the ExtendScript string. 
     */
    GeneratorBridge.prototype.evaluateJSXString = function (jsx) {
        return this._domain.exec("evaluateJSXString", jsx);
    };

    module.exports = new GeneratorBridge();
});
