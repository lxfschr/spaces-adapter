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

    var EventEmitter = require("eventEmitter"),
        adapter = require("./adapter"),
        util = require("./util");

    /**
     * The LayerManager provides an API for dealing with the layers of the
     * currently active document
     *
     * Right now, this is purely demonstration code. This will need to be elaborated
     * to deal with all documents (or changed to be document specific / not a singleton).
     *
     * Emits "selectionChanged" event whenever the currently selected layer changes
     * with the following parameters
     *    1. @param {String} the selected layer name
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var LayerManager = function () {
        EventEmitter.call(this);

        adapter.on("slct", this._handleSelect.bind(this));
    };
    util.inherits(LayerManager, EventEmitter);

    /**
     * Event handler for low-level "slct" events.
     *
     * @private
     * @param {?} params Info about the event
     */
    LayerManager.prototype._handleSelect = function (params) {
        // TODO: This doesn't do the right thing when the user selects
        // multiple layers (or removes layers from the selected set).
        // We need to look at the selectionModifier parameter.
        if (params &&
            params["null"] &&
            params["null"].ref === "Lyr ") {
            this.emit("selectionChanged", params["null"]["enum"]);
        }
    };

    /**
     * Creates a new layer in the currently active document.
     * The returned promise resolves/rejects when the operation is complete/has an error
     *
     * @return {Promise.<Object|string>} Result of the layer creation call
     */
    LayerManager.prototype.createNewLayer = function () {
        return adapter.call("Mk  ", {"null" : { "ref" : "Lyr " }});
    };

    /** @type {LayerManager} The LayerManager singleton */
    var theLayerManager = new LayerManager();

    module.exports = theLayerManager;
    
});
