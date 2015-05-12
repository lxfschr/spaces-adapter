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

define(function (require, exports) {
    "use strict";
    
    var PlayObject = require("../playobject"),
        referenceLib = require("./reference"),
        referenceBy = referenceLib.wrapper("layer"),
        inUnits = require("./unit");

    var assert = require("../util").assert,
        referenceOf = require("./reference").refersTo;
        
    /**
     * Possible layer kind values
     * @const
     */
    var layerKinds = Object.defineProperties({}, {
        "ANY": {
            writeable: false,
            enumerable: true,
            value: 0
        },
        PIXEL: {
            writeable: false,
            enumerable: true,
            value: 1
        },
        ADJUSTMENT: {
            writeable: false,
            enumerable: true,
            value: 2
        },
        TEXT: {
            writeable: false,
            enumerable: true,
            value: 3
        },
        VECTOR: {
            writeable: false,
            enumerable: true,
            value: 4
        },
        SMARTOBJECT: {
            writeable: false,
            enumerable: true,
            value: 5
        },
        VIDEO: {
            writeable: false,
            enumerable: true,
            value: 6
        },
        GROUP: {
            writeable: false,
            enumerable: true,
            value: 7
        },
        "3D": {
            writeable: false,
            enumerable: true,
            value: 8
        },
        GRADIENT: {
            writeable: false,
            enumerable: true,
            value: 9
        },
        PATTERN: {
            writeable: false,
            enumerable: true,
            value: 10
        },
        SOLIDCOLOR: {
            writeable: false,
            enumerable: true,
            value: 11
        },
        BACKGROUND: {
            writeable: false,
            enumerable: true,
            value: 12
        },
        GROUPEND: {
            writeable: false,
            enumerable: true,
            value: 13
        }
    });


    /**
     * Moves the source layer to right before target reference 
     * (usually done by id)
     * 
     * @param {ActionDescriptor} sourceRef - Layer reference to move
     * @param {ActionDescriptor} targetRef - Target layer that layers are being
     *  moved next to
     * @returns {PlayObject}
     */
    var reorder = function (sourceRef, targetRef) {
        assert(referenceOf(sourceRef) === "layer", "reorder is passed a non-layer reference");
        return new PlayObject(
            "move",
            {
                "adjustment": false,
                "null": sourceRef,
                "to": targetRef,
                "version": 5
            }
        );
    };
    
    /**
     * Changes alignment of the given layers
     *
     * @param {ActionDescriptor} sourceRef - Reference of layers to align
     * @param {string} alignment - Alignment value, refer to align.vals
     *  moved next to
     * @returns {PlayObject}
     */
    var align = function (sourceRef, alignment) {
        assert(referenceOf(sourceRef) === "layer", "align is passed a non-layer reference");
        return new PlayObject(
            "align",
            {
                "null": sourceRef,
                "using": {
                    "enum": "alignDistributeSelector",
                    "value": align.vals[alignment]
                }
            }
        );
    };
    
    align.vals = {
        left: "ADSLefts",
        right: "ADSRights",

        horizontally: "ADSCentersH",
        center: "ADSCentersH",
        hCenter: "ADSCentersH",

        middle: "ADSCentersV",
        vCenter: "ADSCentersV",
        vertically: "ADSCentersV",

        top: "ADSTops",
        bottom: "ADSBottoms"
    };
    
    /**
     * Distribute given layers
     * 
     * @param {ActionDescriptor} sourceRef - Reference of layers to distribute
     * @param {string} alignment - Distribution spec
     *
     * @returns {PlayObject}
     */
    var distribute = function (sourceRef, alignment) {
        assert(referenceOf(sourceRef) === "layer", "distribute is passed a non-layer reference");
        return new PlayObject(
            "distort",
            {
                "null": sourceRef,
                "using": {
                    "enum": "alignDistributeSelector",
                    "value": align.vals[alignment]
                }
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to select
     * @param {bool} makeVisible - Flag to hide/show the layer
     * @param {string} modifier - Whether to select, add to selection, remove, or add upto
     * 
     * @returns {PlayObject}
     */
    var select = function (ref, makeVisible, modifier) {
        modifier = modifier || "select";
        makeVisible = makeVisible || false;
        
        assert(referenceOf(ref) === "layer", "select is passed a non-layer reference");
        return new PlayObject(
            "select",
            {
                "null": ref,
                "makeVisible": makeVisible,
                "selectionModifier": {
                    enum: "selectionModifierType",
                    value: select.vals[modifier]
                }
            }
        );
    };
    select.vals = {
        select: "0",
        deselect: "removeFromSelection",
        add: "addToSelection",
        addUpTo: "addToSelectionContinuous"
    };
    
    /**
     * Deselect all layers
     *
     * @returns {PlayObject}
     */
    var deselectAll = function () {
        return new PlayObject(
            "selectNoLayers",
            {
                "null": referenceBy.target
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to hide
     * 
     * @returns {PlayObject}
     */
    var hide = function (ref) {
        assert(referenceOf(ref) === "layer", "hide is passed a non-layer reference");
        return new PlayObject(
            "hide",
            {
                "null": ref
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to show
     * 
     * @returns {PlayObject}
     */
    var show = function (ref) {
        assert(referenceOf(ref) === "layer", "show is passed a non-layer reference");
        return new PlayObject(
            "show",
            {
                "null": ref
            }
        );
    };
    
    /**
     * Duplicate a layer from one document into another.
     * 
     * @param {object} fromRef Reference from which to duplicate
     * @param {object} toRef Reference to which to duplicate
     * @param {string=} name Name of the duplicated layer
     * @returns {PlayObject}
     */
    var duplicate = function (fromRef, toRef, name) {
        assert(referenceOf(fromRef[0]) === "layer", "duplicate is passed a non-layer first-from reference");
        assert(referenceOf(fromRef[1]) === "document", "duplicate is passed a non-layer second-from reference");
        assert(referenceOf(toRef) === "document", "duplicate is passed a non-document to reference");

        var descriptor = {
            "null": {
                "ref": fromRef
            },
            "to": toRef
        };

        if (name !== undefined) {
            descriptor.name = name;
        }

        return new PlayObject("duplicate", descriptor);
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to flip
     * @param {string} orientation - Which way to flip
     * 
     * @returns {PlayObject}
     */
    var flip = function (ref, orientation) {
        assert(referenceOf(ref) === "layer", "flip is passed a non-layer reference");
        return new PlayObject(
            "flip",
            {
                "null": ref,
                "axis": {
                    enum: "orientation",
                    value: orientation
                }
            }
        );
    };

    /**
     * @param {ActionDescriptor} ref Refernece of layer(s) to set position
     * @param {Unit} _x Left side to set in Units
     * @param {Unit} _y Top side to set in Units
     *
     * @returns {PlayObject} [description]
     */
    var setPosition = function (ref, _x, _y) {
        assert(referenceOf(ref) === "layer", "setPosition is passed a non-layer reference");
        return new PlayObject(
            "transform",
            {
                "null": ref,
                "snapToDocBounds": true,
                "relative": false,
                "position": {
                    "obj": "position",
                    "value": {
                        "horizontal": inUnits.pixels(_x),
                        "vertical": inUnits.pixels(_y)
                    }
                }
            }
        );
    };

    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to set size
     * @param {Unit} _w - Width to set in Units
     * @param {Unit} _h - Height to set in Units
     * @param {boolean} relative Whether to set the size from center, or top-left corner of selection
     * @param {Unit} _x Left of the bounds, if relative is false, this has to be provided
     * @param {Unit} _y Top of the bounds, if relative is false, this has to be provided
     *
     * If relative is false, Photoshop will resize the layers from top left, but push them to top left of document
     * 
     * @returns {PlayObject}
     */
    var setSize = function (ref, _w, _h, relative, _x, _y) {
        assert(referenceOf(ref) === "layer", "setHeight is passed a non-layer reference");
        var sizeDescriptor = {
                "null": ref,
                "snapToDocBounds": true
            };

        if (_w) {
            sizeDescriptor.width = inUnits.pixels(_w);
        }

        if (_h) {
            sizeDescriptor.height = inUnits.pixels(_h);
        }

        // Relative is true by default in Photoshop
        if (relative !== undefined && !relative) {
            sizeDescriptor.relative = false;

            assert(_x !== undefined && _y !== undefined,
                "Calling setSize with absolute flag with no x,y provided");

            sizeDescriptor.position = {
                "obj": "position",
                "value": {
                    "horizontal": inUnits.pixels(_x),
                    "vertical": inUnits.pixels(_y)
                }
            };
        } else {
            sizeDescriptor.relative = true;
        }

        return new PlayObject(
            "transform",
            sizeDescriptor
        );
    };
    
    /**
     * Rotates the given layers angle degrees, rotation in Photoshop is stateless
     * so rotate(x) + rotate(y) = rotate(x+y)
     * @param {ActionDescriptor} ref - Reference of layer(s) to rotate
     * @param {number} angle - Angle of rotation
     * 
     * @returns {PlayObject}
     */
    var rotate = function (ref, angle) {
        assert(referenceOf(ref) === "layer", "rotate is passed a non-layer reference");
        return new PlayObject(
            "transform",
            {
                "null": ref,
                "snapToDocBounds": true,
                "angle": inUnits.angle(angle)
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to set opacity
     * @param {number} opacity - Opacity in percentage
     * 
     * @returns {PlayObject}
     */
    var setOpacity = function (ref, opacity) {
        assert(referenceOf(ref) === "layer", "setOpacity is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "obj": "to",
                    "value": {
                        "opacity": inUnits.percent(opacity)
                    }
                }
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to set fill opacity
     * @param {number} opacity - Fill opacity in percentage
     * 
     * @returns {PlayObject}
     */
    var setFillOpacity = function (ref, opacity) {
        assert(referenceOf(ref) === "layer", "setFillOpacity is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "obj": "to",
                    "value": {
                        "fillOpacity": inUnits.percent(opacity)
                    }
                }
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to set blend mode
     * @param {string} mode - Blend mode
     * 
     * @returns {PlayObject}
     */
    var setBlendMode = function (ref, mode) {
        assert(referenceOf(ref) === "layer", "setBlendMode is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "obj": "layer",
                    "value": {
                        "mode": {
                            "enum": "blendMode",
                            "value": mode
                        }
                    }
                }
            }
        );
    };

    /**
     * Sets the proportional scaling property of a layer descriptor.
     *
     * @param {ActionDescriptor} ref Reference of layer(s) to set blend mode
     * @param {boolean} proportion Proptional scaling flag
     * @return {PlayObject}
     */
    var setProportionalScaling = function (ref, proportion) {
        assert(referenceOf(ref) === "layer", "setProportionalScaling is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "obj": "layer",
                    "value": {
                        "proportionalScaling": proportion
                    }
                }
                
            }
        );
    };



    /**
     * FIXME: Only works with current document!
     * SIDE EFFECT: Creates a brand new layer with a new ID and name
     * 
     * @param {number} id Background layer id
     * 
     * @return {PlayObject}
     */
    var unlockBackgroundLayer = function (id) {
        return new PlayObject(
            "set",
            {
                "layerID": id,
                "null": {
                    "property": "background",
                    "ref": "layer"
                },
                "to": {
                    "obj": "layer",
                    "value": {
                        "mode": {
                            "enum": "blendMode",
                            "value": "normal"
                        },
                        "opacity": {
                            "unit": "percentUnit",
                            "value": 100
                        }
                    }
                }
            }
        );
    };
    
    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to delete
     * 
     * @returns {PlayObject}
     */
    var deleteLayer = function (ref) {
        assert(referenceOf(ref) === "layer", "deleteLayer is passed a non-layer reference");
        return new PlayObject(
            "delete",
            {
                "null": ref
            }
        );
    };

    /**
     * @param {ActionDescriptor} ref - Reference of layer to rename
     * @param {string} name - What to rename the layer to
     *
     * @returns {PlayObject}
     */
    var renameLayer = function (ref, name) {
        assert(referenceOf(ref) === "layer", "renameLayer is passed a non-layer reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "obj": "layer",
                    "value": {
                        "name": name
                    }
                }
            }
        );
    };

    /**
     *
     * @returns {PlayObject}
     */
    var groupSelectedLayers = function () {
        return new PlayObject(
            "make",
            {
                "from": referenceBy.target,
                "null": {
                    "ref": "layerSection"
                }
            }
        );
    };

    /** 
     * @param {ActionDescriptor} ref - Reference of layer(s) to change lock
     * @param {boolean} lock - Flag for locking
     *
     * @returns {PlayObject}
     */
    var setLocking = function (ref, lock) {
        assert(referenceOf(ref) === "layer", "setLocking is passed a non-layer reference");
        var lockObject = lock ? { "protectAll": true } : { "protectNone": true };
        return new PlayObject(
            "applyLocking",
            {
                "null": ref,
                "group": true,
                "layerLocking": {
                    "obj": "layerLocking",
                    "value": lockObject
                }
            }
        );
    };

    /**
     * @param {ActionDescriptor} ref - Reference of layer(s) to translate
     * @param {Unit} _x Horizontal offset in Units
     * @param {Unit} _y Vertical offset in Units
     *
     * @returns {PlayObject}
     */
    var translate = function (ref, _x, _y) {
        assert(referenceOf(ref) === "layer", "translate is passed a non-layer reference");
        var x = _x || 0,
            y = _y || 0;

        return new PlayObject(
            "transform",
            {
                "null": ref,
                "snapToDocBounds": true,
                "position": {
                    "obj": "position",
                    "value": {
                        "horizontal": inUnits.pixels(x),
                        "vertical": inUnits.pixels(y)
                    }
                }
            }
        );
    };

    // Left overs:
    // _offsetCommand
    
    exports.referenceBy = referenceBy;
    exports.layerKinds = layerKinds;
    
    exports.reorder = reorder;
    exports.align = align;
    exports.distribute = distribute;
    exports.select = select;
    exports.deselectAll = deselectAll;
    exports.hide = hide;
    exports.show = show;
    exports.duplicate = duplicate;
    exports.flip = flip;
    exports.setPosition = setPosition;
    exports.setProportionalScaling = setProportionalScaling;
    exports.setSize = setSize;
    exports.rotate = rotate;
    exports.setOpacity = setOpacity;
    exports.setFillOpacity = setFillOpacity;
    exports.setBlendMode = setBlendMode;
    exports.delete = deleteLayer;
    exports.rename = renameLayer;
    exports.groupSelected = groupSelectedLayers;
    exports.setLocking = setLocking;
    exports.translate = translate;
    exports.unlockBackground = unlockBackgroundLayer;
});
