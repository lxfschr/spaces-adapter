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
     * The DocumentManager provides an API for keeping track of all open
     * Photoshop documents.
     *
     * Emits "documentChanged" event whenever the current document changes
     * with the following parameters
     *    1. @param {Object} the document
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var DocumentManager = function () {
        EventEmitter.call(this);

        adapter.on("slct", this._handleSelect.bind(this));
    };
    util.inherits(DocumentManager, EventEmitter);

    /**
     * Event handler for low-level "slct" events.
     *
     * @private
     * @param {?} params Info about the event
     */
    DocumentManager.prototype._handleSelect = function (params) {
        // TODO: A "slct" event with a "Dcmn" reference only happens when the user
        // switches between two already-open documents. There are other cases where
        // the current document might change: A document is closed, or a new
        // document is created. We should emit a documentChanged event for that, too.
        if (params &&
            params["null"] &&
            params["null"].ref === "Dcmn") {
            this.getActiveDocument().then(function (doc) {
                this.emit("documentChanged", doc);
            }.bind(this));
        }
    };

    /**
     * Returns a Promise that resolves to the active document, or
     * rejects if there is no active document.
     *
     * @return {Promise.<Object|string>} The active document, or an error string
     */
    DocumentManager.prototype.getActiveDocument = function () {
        return adapter.get("Dcmn");
    };

    /** @type {DocumentManager} The DocumentManager singleton */
    var theDocumentManager = new DocumentManager();

    module.exports = theDocumentManager;

});
