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
        util = require("./util"),
        Promise = require("bluebird");

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

        adapter.on("select", this._handleSelect.bind(this));
        adapter.on("make", this._handleSelect.bind(this));
    };
    util.inherits(LayerManager, EventEmitter);
    
    /**
     * Holds the currently selected layer indices
     */
    LayerManager.prototype._currentSelection = [];
    
    /**
     * Event handler for low level select and make events
     * "Make" layer may cause selection to change as well
     * Grabs the current selected layer indices, saves them in _currentSelection
     * and emits a "selectionChanged" event with the current Selection array
     * 
     */
    LayerManager.prototype._handleSelect = function () {
        this.getSelectedLayerIndices().bind(this).then(function (layers) {
            this._currentSelection = layers;
            this.emit("selectionChanged", this._currentSelection);
        }).bind(this);
        
    };

    LayerManager.prototype.getLayerAtIndex = function (index) {
        return adapter.getProperty("document", "numberOfLayers").then(function (layerCount) {
            if (typeof index === undefined || index < 0 || index > layerCount) {
                throw new Error("Invalid layer index");
            }

            // If only background layer, count is 0, and background layer cannot be unselected
            if (layerCount === 0) {
                return adapter.get({ref: "$Lyr", value: "$Trgt", enum: "$Ordn"});
            } else {
                return adapter.get({ref: "$Lyr", "index": index});
            }
        });
    };

    /**
     * Gets an array of layer references for all selected layers in the current document
     *
     * @return {Promise.<Array.<Object>>} Resolves to an array of layers with index and ref(:layer) keys
     */
    LayerManager.prototype.getSelectedLayers = function () {
        return adapter.get("document").then(function (document) {
            return document.targetLayers || [];
        });
    };

    /**
     * Gets an array of layer indices for all selected layers in the current document
     *
     * @return {Promise.<Array.<Number>>} Resolves to an array of numbers for each index of layers
     */
    LayerManager.prototype.getSelectedLayerIndices = function () {
        return this.getSelectedLayers().then(function (layers) {
            return layers.map(function (layer) {
                return layer.index;
            });
        });
    };
    
    LayerManager.prototype.getSelectedLayerDescriptors = function () {
        return this.getSelectedLayerIndices().then(function (indices) {
            var layerGets = [];
            indices.map(function (index) {
                layerGets.push(adapter.get({ref: "layer", index: index}));
            });
            return Promise.all(layerGets);
        });
    };

    /**
     * Creates a new layer in the currently active document.
     * The returned promise resolves/rejects when the operation is complete/has an error
     *
     * @return {Promise.<Object>} Result of the layer creation call
     */
    LayerManager.prototype.createNewLayer = function () {
        return adapter.call("$Mk", {"null" : { "ref" : "$Lyr " }});
    };

    /**
     * Gets all layers in the document with their properties
     *
     * @return {Promise.<ActionDescriptor>} Result of the layer creation call
     */
    LayerManager.prototype.getAllLayers = function () {
        return adapter.getProperty("document", "numberOfLayers").then(function (layerCount) {
            return adapter.getProperty("document", "hasBackgroundLayer").then(function (hasBackground) {
                var layerGets = [];
                var startIndex = hasBackground ? 0 : 1;

                for (var i = startIndex; i <= layerCount; i++) {
                    layerGets.push(adapter.get({ref: "layer", index: i}));
                }
                return Promise.all(layerGets);
            });
        });
    };

    /**
     * Duplicates layers.
     * If index is supplied, will only duplicate the indexed layer
     *
     * If only one layer is selected, and newLayerName is not null, copy will be renamed
     * Otherwise layers get copied with their original names
     * The returned promise resolves to the dupeArgs object.
     *
     * @param {?number} index Index of the layer to duplicate, default is currently selected layer(s)
     * @param {?string} newLayerName If supplied, renames the new layer, only applies when a single layer is selected
     * @return {Promise.<Object>} Promise that resolves to a reference to currently selected layer
     */
    LayerManager.prototype.duplicateLayer = function (index, newLayerName) {
        var nullArgs = { "ref": "$Lyr" };

        // This way we can either choose the current layer or a layer by index
        if (typeof index !== undefined) {
            nullArgs.index = index;
        } else {
            nullArgs.enum = "$Ordn";
            nullArgs.value = "$Trgt";
        }

        var dupeArgs = { "null" : nullArgs };
        dupeArgs.$Vrsn = 5;

        if (newLayerName) {
            dupeArgs["$Nm  "] = newLayerName;
        }

        return adapter.call("$Dplc", dupeArgs);
    };

    /**
     * Moves a layer
     * If index is null, will move the selected layer
     *
     * @param {?number} index Index of the layer to move, default is currently selected layer
     * @param {?number} dx Pixel value to move the layer horizontally (Default 0)
     * @param {?number} dy Pixel value to move the layer vertically (Default 0)
     * @return {Promise.<Object>} Promise that resolves to empty object
     */
    LayerManager.prototype.moveLayer = function (index, dx, dy) {
        var nullArgs = { "ref": "$Lyr" };

        if (typeof index !== undefined) {
            nullArgs.index = index;
        } else {
            nullArgs.enum = "$Ordn";
            nullArgs.value = "$Trgt";
        }

        var selectArgs = {"null": nullArgs};

        // If index is given, this ensures that the layer with given index is selected first
        // Otherwise, is a no-op and will move on to copying the layer
        return adapter.call("$slct", selectArgs).then(function () {
            var moveArgs = { "null": nullArgs };

            moveArgs.to = {
                "obj": "Offset",
                "value": {
                    "horizontal": {
                        "unit": "pixelsUnit",
                        "value": dx || 0
                    },
                    "vertical": {
                        "unit": "pixelsUnit",
                        "value": dy || 0
                    }
                }
            };

            return adapter.call("move", moveArgs);
        });
    };

    /**
     * Copies a layer and moves it
     * If index is null, will copy the selected layer
     *
     * @param {?number=} index Index of the layer to copy, default is currently selected layer
     * @param {?number} dx Pixel value to move the copied layer horizontally (Default 0)
     * @param {?number} dy Pixel value to move the copied layer vertically (Default 0)
     * @return {Promise.<Object>} Promise that resolves to empty object
     */
    LayerManager.prototype.copyLayer = function (index, dx, dy) {
        var nullArgs = { "ref": "$Lyr" };

        if (typeof index !== undefined) {
            nullArgs.index = index;
        } else {
            nullArgs.enum = "$Ordn";
            nullArgs.value = "$Trgt";
        }

        var selectArgs = {"null": nullArgs};

        // If index is given, this ensures that the layer with given index is selected first
        // Otherwise, is a no-op and will move on to copying the layer
        return adapter.call("$slct", selectArgs).then(function () {
            var copyArgs = { "null": nullArgs };

            copyArgs.to = {
                "obj": "Offset",
                "value": {
                    "horizontal": {
                        "unit": "pixelsUnit",
                        "value": dx || 0
                    },
                    "vertical": {
                        "unit": "pixelsUnit",
                        "value": dy || 0
                    }
                }
            };

            return adapter.call("copyEvent", copyArgs);
        });
    };

    /** @type {LayerManager} The LayerManager singleton */
    var theLayerManager = new LayerManager();

    module.exports = theLayerManager;
    
});
