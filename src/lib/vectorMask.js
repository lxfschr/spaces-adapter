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
    
    var PlayObject = require("../playObject");

    /**
     * creates a rectangular work path with the given bounds descriptor 
     *
     * below each unit is a object of type {_value: number, _unit: type}
     * @param {{top: unit, bottom: unit, left: unit, right: unit}} bounds the bounds object 
     * @return {PlayObject}
     */
    var makeBoundsWorkPath = function (bounds) {
        return new PlayObject("set", {
            "null": {
                "_ref": [{
                    "_ref": "path",
                    "_property": "workPath"
                }]
            },
            "to": {
                "_obj": "rectangle",
                "_value": bounds
            }
        });
    };

    /**
     * Turn the workpath into a vector mask for the current layer
     * 
     * @return {PlayObject}
     */
    var makeVectorMaskFromWorkPath = function () {
        var maskRef = {
            "_ref": [{
                "_ref": "path",
                "_enum": "path",
                "_value": "vectorMask"
            }]
        },
            pathRef = {
                "_ref": [{
                    "_ref": "path",
                    "_enum": "ordinal",
                    "_value": "targetEnum"
                }]
            };

        return new PlayObject("make", {
            "null": {
                "_ref": [{
                    "_ref": "path"
                }
            ] },
            "at": maskRef,
            "using": pathRef
        });
    };

    /**
     * Delete the current work path
     * 
     * @return {PlayObject}
     */
    var deleteWorkPath = function () {
        return new PlayObject("delete", {
            "null": {
                "_ref": [{
                    "_ref": "path",
                    "_property": "workPath"
                }]
            }
        });
    };


    /**
     * Target the vector mask of the current layer
     * 
     * @return {PlayObject}
     */
    var editVectorMask = function () {
        var vectMaskRef = {
            "_ref": "path",
            "_enum": "path",
            "_value": "vectorMask"
        },
            layerMaskRef = {
                "_ref": "layer",
                "_enum": "ordinal",
                "_value": "targetEnum"
            };
        return new PlayObject("select", {
            "null": {
                "_ref": [vectMaskRef, layerMaskRef]
            }
        });
    };

    /**
     * activate the knots of the targeted vector mask
     * 
     * @return {PlayObject}
     */
    var activateVectorMaskEditing = function () {
        return new PlayObject("activateVectorMaskEditing", {
            "null": {
                "_ref": [{
                    "_ref": "layer",
                    "_enum": "ordinal",
                    "_value": "targetEnum"
                }]
            }
        });
    };
    
    exports.editVectorMask = editVectorMask;
    exports.activateVectorMaskEditing = activateVectorMaskEditing;
    exports.makeBoundsWorkPath = makeBoundsWorkPath;
    exports.editVectorMask = editVectorMask;
    exports.deleteWorkPath = deleteWorkPath;
    exports.makeVectorMaskFromWorkPath = makeVectorMaskFromWorkPath;
});
