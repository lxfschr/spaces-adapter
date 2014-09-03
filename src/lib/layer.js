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
    
    var referenceBy = require("src/lib/reference").wrapper("layer"),
        inUnits = require("src/lib/unit");

    var reorder = function (sourceRef, targetRef) {
        return {
            command: "move",
            descriptor: {
                "null": sourceRef,
                "to": targetRef,
                "version": 5
            }
        };
    };
    
    var align = function (sourceRef, alignment) {
        return {
            command: "align",
            descriptor: {
                "null": sourceRef,
                "using": {
                    "enum": "alignDistributeSelector",
                    "value": align.vals[alignment]
                }
            }
        };
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
    
    var distribute = function (sourceRef, alignment) {
        return {
            command: "distort",
            descriptor: {
                "null": sourceRef,
                "using": {
                    "enum": "alignDistributeSelector",
                    "value": align.vals[alignment]
                }
            }
        };
    };
    
    var select = function (ref, makeVisible, modifier) {
        modifier = modifier || "select";
        makeVisible = makeVisible || false;
        
        return {
            command: "select",
            descriptor: {
                "null": ref,
                "makeVisible": makeVisible,
                "selectionModifier": {
                    enum: "selectionModifierType",
                    value: select.vals[modifier]
                }
            }
        };
    };
    select.vals = {
        select: "0",
        deselect: "removeFromSelection",
        add: "addToSelection",
        addUpTo: "addToSelectionContinuous"
    };
    
    var deselectAll = function () {
        return {
            command: "selectNoLayers",
            descriptor: {
                "null": referenceBy.target
            }
        };
    };
    
    var hide = function (ref) {
        return {
            command: "hide",
            descriptor: {
                "null": ref
            }
        };
    };
    
    var show = function (ref) {
        return {
            command: "show",
            descriptor: {
                "null": ref
            }
        };
    };
    
    var duplicate = function (ref, name) {
        var rval = {
            command: "duplicate",
            descriptor: {
                "null": ref
            }
        };
        if (name) {
            rval.descriptor[name] = name;
        }
        return rval;
    };
    
    var flip = function (ref, orientation) {
        return {
            command: "flip",
            descriptor: {
                "null": ref,
                "axis": {
                    enum: "orientation",
                    value: orientation
                }
            }
        };
    };
    
    var setHeight = function (ref, value, unit) {
        return {
            command: "transform",
            descriptor: {
                "null": ref,
                "height": inUnits[unit](value)
            }
        };
    };
    
    var setWidth = function (ref, value, unit) {
        return {
            command: "transform",
            descriptor: {
                "null": ref,
                "width": inUnits[unit](value)
            }
        };
    };
    
    var rotate = function (ref, angle) {
        return {
            command: "transform",
            descriptor: {
                "null": ref,
                "angle": inUnits.angle(angle)
            }
        };
    };
    
    var setOpacity = function (ref, opacity) {
        return {
            command: "set",
            descriptor: {
                "null": ref,
                "to": {
                    "obj": "to",
                    "value": {
                        "opacity": inUnits.percent(opacity)
                    }
                }
            }
        };
    };
    
    var setFillOpacity = function (ref, opacity) {
        return {
            command: "set",
            descriptor: {
                "null": ref,
                "to": {
                    "obj": "to",
                    "value": {
                        "fillOpacity": inUnits.percent(opacity)
                    }
                }
            }
        };
    };
    
    var setBlendMode = function (ref, mode) {
        return {
            command: "set",
            descriptor: {
                "null": ref,
                "to": {
                    "obj": "layer",
                    "value": mode
                }
            }
        };
    };
    
    var deleteLayer =  function (ref) {
        return {
            command: "delete",
            descriptor: {
                "null": ref
            }
        };
    };
    
    // Left overs:
    // _offsetCommand
    // rename
    // setLock
    
    exports.reorder = reorder;
    exports.align = align;
    exports.distribute = distribute;
    exports.select = select;
    exports.deselectAll = deselectAll;
    exports.hide = hide;
    exports.show = show;
    exports.duplicate = duplicate;
    exports.flip = flip;
    exports.setHeight = setHeight;
    exports.setWidth = setWidth;
    exports.rotate = rotate;
    exports.setOpacity = setOpacity;
    exports.setFillOpacity = setFillOpacity;
    exports.setBlendMode = setBlendMode;
    exports.delete = deleteLayer;
});
