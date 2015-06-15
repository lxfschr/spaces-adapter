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
     * Will return layer IDs under the given point of the active document
     * The point is (x,y) where (0,0) is the top left of the document and 
     * x is horizontal vs y is vertical
     * 
     * @param {object} documentRef Target document
     * @param {number} px X coordinate - horizontal
     * @param {number} py Y coordinate - vertical
     * @return {PlayObject}
     *
     */
    var layerIDsAtPoint = function (documentRef, px, py) {
        return new PlayObject(
            "hitTest",
            {
                "null": documentRef,
                "x": px,
                "y": py
            }
        );
    };

    /**
     * Will return the color data under the given pixels
     * using current Eye dropper tool settings
     * colorSampler is available when sampleData is true
     *
     * @param {object} documentRef Target document
     * @param {number} px X coordinate - horizontal
     * @param {[type]} py Y coordinate - vertical
     *
     * @return {{sampleData: <boolean>, colorSampler: <object>}} [description]
     */
    var colorSampleAtPoint = function (documentRef, px, py) {
        return new PlayObject(
            "colorSampler",
            {
                "null": documentRef,
                "samplePoint": {
                    "_obj": "samplePoint",
                    "_value": {
                        "horizontal": {
                            "_unit": "distanceUnit",
                            "_value": px
                        },
                        "vertical": {
                            "_unit": "distanceUnit",
                            "_value": py
                        }
                    }
                }
            }
        );
    };
    
    exports.layerIDsAtPoint = layerIDsAtPoint;
    exports.colorSampleAtPoint = colorSampleAtPoint;
});
