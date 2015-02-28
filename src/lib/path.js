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
    
    var PlayObject = require("../playobject");
    
    /**
     * Combines the paths in the current layer using ADD/UNION
     *
     * @return {PlayObject}
     */
    var combinePathsUnion = function () {
        return new PlayObject(
            "changePathDetails",
            {
                "keyActionMode": 0,
                "keyOriginType": 3
            }
        );
    };

    /**
     * Combines the paths in the current layer using SUBTRACT
     *
     * @return {PlayObject}
     */
    var combinePathsSubtract = function () {
        return new PlayObject(
            "changePathDetails",
            {
                "keyActionMode": 1,
                "keyOriginType": 3
            }
        );
    };

    /**
     * Combines the paths in the current layer using INTERSECT
     *
     * @return {PlayObject}
     */
    var combinePathsIntersect = function () {
        return new PlayObject(
            "changePathDetails",
            {
                "keyActionMode": 2,
                "keyOriginType": 3
            }
        );
    };

    /**
     * Combines the paths in the current layer using DIFFERENCE/EXCLUDE
     *
     * @return {PlayObject}
     */
    var combinePathsDifference = function () {
        return new PlayObject(
            "changePathDetails",
            {
                "keyActionMode": 3,
                "keyOriginType": 3
            }
        );
    };

    /**
     * Combines the layers using ADD/UNION
     *
     * @return {PlayObject}
     */
    var combineLayersUnion = function () {
        return new PlayObject(
            "mergeLayersNew",
            {
                "shapeOperation": {
                    "enum": "shapeOperation",
                    "value": "add"
                }
            }
        );
    };

    /**
     * Combines the layers using SUBTRACT
     *
     * @return {PlayObject}
     */
    var combineLayersSubtract = function () {
        return new PlayObject(
            "mergeLayersNew",
            {
                "shapeOperation": {
                    "enum": "shapeOperation",
                    "value": "subtract"
                }
            }
        );
    };

    /**
     * Combines the layers using INTERSECT
     *
     * @return {PlayObject}
     */
    var combineLayersIntersect = function () {
        return new PlayObject(
            "mergeLayersNew",
            {
                "shapeOperation": {
                    "enum": "shapeOperation",
                    "value": "interfaceIconFrameDimmed"
                }
            }
        );
    };

    /**
     * Combines the layers using DIFFERENCE/EXCLUDE
     *
     * @return {PlayObject}
     */
    var combineLayersDifference = function () {
        return new PlayObject(
            "mergeLayersNew",
            {
                "shapeOperation": {
                    "enum": "shapeOperation",
                    "value": "xor"
                }
            }
        );
    };

    exports.combinePathsUnion = combinePathsUnion;
    exports.combinePathsSubtract = combinePathsSubtract;
    exports.combinePathsIntersect = combinePathsIntersect;
    exports.combinePathsDifference = combinePathsDifference;
    exports.combineLayersUnion = combineLayersUnion;
    exports.combineLayersSubtract = combineLayersSubtract;
    exports.combineLayersIntersect = combineLayersIntersect;
    exports.combineLayersDifference = combineLayersDifference;

});
