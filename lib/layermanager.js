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

    var Promise = require("bluebird"),
        EventEmitter = require("eventEmitter"),
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

        adapter.on("select", this._handleSelect.bind(this));
        adapter.on("make", this._handleSelect.bind(this));
    };
    util.inherits(LayerManager, EventEmitter);
    
    /**
     * Holds the currently selected layer indices
     * 
     * @type {Array<number>}
     */
    LayerManager.prototype._currentSelection = null;
    
    /**
     * Event handler for low level select and make events
     * "Make" layer may cause selection to change as well
     * Grabs the current selected layer indices, saves them in _currentSelection
     * and emits a "selectionChanged" event with the current Selection array
     * 
     * @private
     */
    LayerManager.prototype._handleSelect = function () {
        this.getSelectedLayerIndices().bind(this).then(function (layers) {
            this._currentSelection = layers;
            this.emit("selectionChanged", this._currentSelection);
        });
    };

    /**
     * Gets the action descriptor of the layer at given index
     *
     * Will check for correct index, if image is only a background layer, will return that
     *
     * @param {number} index Layer index
     * @return {Promise.<Object>} Promise that resolve to the action descriptor of the layer
     */
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
     * @return {Promise.<Array.<ref: object, index: number>>} Resolves to an array of
     *      layers with index and ref(:layer) keys
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
    
    /**
     * Gets the action descriptors for all selected layers
     *
     * @return {Promise.<Array.<ActionDescriptor>>} Resolves to an array of 
     *     action descriptor for each selected layers
     */
    LayerManager.prototype.getSelectedLayerDescriptors = function () {
        return this.getSelectedLayerIndices().then(function (indices) {
            var layerGetPromises = indices.map(function (index) {
                return adapter.get({ref: "layer", index: index});
            });
            return Promise.all(layerGetPromises);
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
     * @return {Promise.<Array.<ActionDescriptor>>} Resolves to an array of all array descriptors
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
        if (index !== null) {
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
     * Causes the layer at the given index to be selected in Photoshop.
     * 
     * @param {!number} index Index of the layer to select
     * @return {Promise}
     */
    LayerManager.prototype.selectLayerAtIndex = function (index) {
        var selectArgs = {
            "null": {
                "ref": "$Lyr",
                "index": index
            }
        };

        return adapter.call("$slct", selectArgs);
    };

    /**
     * Moves a layer
     * If index is null, will move the selected layer
     *
     * @param {?number} index Index of the layer to move, default is currently selected layer
     * @param {number=} dx Pixel value to move the layer horizontally (Default 0)
     * @param {number=} dy Pixel value to move the layer vertically (Default 0)
     * @return {Promise.<Object>} Promise that resolves to empty object
     */
    LayerManager.prototype.moveLayer = function (index, dx, dy) {
        // If index is given, this ensures that the layer with given index is selected first
        var selectPromise = index !== null ?
            this.selectLayerAtIndex(index) :
            Promise.resolve();

        return selectPromise.then(function () {
            var nullArgs = { "ref": "$Lyr" };

            if (index !== null) {
                nullArgs.index = index;
            } else {
                nullArgs.enum = "$Ordn";
                nullArgs.value = "$Trgt";
            }

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
     * @param {?number} index Index of the layer to copy, default is currently selected layer
     * @param {number=} dx Pixel value to move the copied layer horizontally (Default 0)
     * @param {number=} dy Pixel value to move the copied layer vertically (Default 0)
     * @return {Promise.<Object>} Promise that resolves to empty object
     */
    LayerManager.prototype.copyLayer = function (index, dx, dy) {
        // If index is given, this ensures that the layer with given index is selected first
        var selectPromise = index !== null ?
            this.selectLayerAtIndex(index) :
            Promise.resolve();

        return selectPromise.then(function () {
            var nullArgs = { "ref": "$Lyr" };
            
            if (index !== null) {
                nullArgs.index = index;
            } else {
                nullArgs.enum = "$Ordn";
                nullArgs.value = "$Trgt";
            }

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

    /**
     * Copies a layer multiple times to the given offsets. If the index is null the currently
     * selected layer will be copied.
     *
     * @param {?number} index Index of the layer to copy, default is currently selected layer
     * @param {Array.{dx: number, dy: number}} offsets Offsets at which to copy the layer
     * @return {Promise.<Array.<object>>} Promise that resolves to an array of
     *      ActionDescriptor results
     */
    LayerManager.prototype.copyLayerMultiple = function (index, offsets) {
        var nullArgs = { "ref": "$Lyr" };
        
        if (index !== null) {
            nullArgs.index = index;
        } else {
            nullArgs.enum = "$Ordn";
            nullArgs.value = "$Trgt";
        }

        var commands = offsets.reduce(function (commands, offset) {
            var selectCommand = {
                name: "$slct",
                descriptor: {
                    "null": nullArgs
                }
            };

            var copyCommand = {
                name: "copyEvent",
                descriptor: {
                    "null": nullArgs,
                    "to": {
                        "obj": "Offset",
                        "value": {
                            "horizontal": {
                                "unit": "pixelsUnit",
                                "value": offset.dx || 0
                            },
                            "vertical": {
                                "unit": "pixelsUnit",
                                "value": offset.dy || 0
                            }
                        }
                    }
                }
            };

            commands.push(selectCommand);
            commands.push(copyCommand);

            return commands;
        }, []);

        return adapter.batchCall(commands);
    };
    
    /**
    * Given a layer index, adds that layer to the selected layers
    *
    * @param {Number} index Index of layer to be added to selection
    */
    LayerManager.prototype.addLayerToSelection = function (index) {
        return adapter.call("$slct", {
            "null": {
                "ref": "$Lyr",
                "index": index
            },
            "selectionModifier": {
                value: "addToSelection",
                enum: "selectionModifierType"
            },
            "$MkVs": 0
        });
    };

    /**
    * Given an array of layer indices
    * Has Photoshop select those layers.
    *
    * If array is empty, will deselect all layers
    *  
    * Note: If the layer at a given index is an endSection, it will be a no-op for that layer
    * It is a good idea to not call this function directly as indices are not what they seem on Photoshop UI
    *
    * @param {Array.<Number>} layerIndices Indexes of layers to be selected
    *
    * @returns {Promise.<Array.<ActionDescriptor>>} Promise that resolves to an array of ActionDescriptors for each layer selection
    *     If given array was empty, resolves to a single promise for layer deselection ActionDescriptor
    */
    LayerManager.prototype.selectLayers = function (layerIndices) {
        if (layerIndices.length === 0) {
            return adapter.call("selectNoLayers", {
                "null": {
                    ref: "$Lyr",
                    enum: "$Ordn",
                    value: "$Trgt"
                }
            });
        }
        
        var firstLayer = this.selectLayerAtIndex(layerIndices.shift());
        
        var selectPromises = layerIndices.reduce(function (selectors, layerIndex) {
            selectors.push(this.addLayerToSelection(layerIndex));
            
            return selectors;
        }.bind(this), [firstLayer]);
        
        return Promise.all(selectPromises);
    };

    /**
    * Given an array of layer indices, collects them into a new group with
    * given name (if any)
    *
    * @param {Array.<Number>} layerIndices layer indexes that are to be
    * grouped
    * @param {?String} groupName If given, will be used as the new group
    * name, default is what Photoshop assigns
    *
    * @returns {Promise.<ActionDescriptor>} Promise that resolves to the action descriptor 
    *     containing the Group command args
    */
    LayerManager.prototype.groupLayers = function (layerIndices, groupName) {
        return this.selectLayers(layerIndices).then(function () {
            var groupArgs = {
                "null": {
                    ref: "layerSection"
                },
                "$From": {
                    ref: "$Lyr",
                    value: "$Trgt",
                    enum: "$Ordn"
                }
            };
            
            if (groupName) {
                groupArgs.$Usng = {
                    "obj": "layerSection",
                    "value" : {
                        "$Nm" : groupName
                    }
                };
            }
            
            return adapter.call("$Mk", groupArgs);
        });
    };



    /** @type {LayerManager} The LayerManager singleton */
    var theLayerManager = new LayerManager();

    module.exports = theLayerManager;
});
