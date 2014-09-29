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

    var PlayObject = require("../playObject"),
        unitsIn = require("./unit");
    
    var assert = require("../util").assert,
        referenceOf = require("./reference").refersTo;

    /**
     * @param {ActionDescriptor} sourceRef Guide reference
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Have guide(s) in the active document.
     */
    var getGuide = function (sourceRef) {
        assert(referenceOf(sourceRef) === "guide", "getGuide is passed a non-guide reference");
        return new PlayObject(
            "get",
            {
                "null": sourceRef
            }
        );
    };
    
    /**
     * Create a new guide
     *
     * @param {string} orientation The orientation of guide. "horizontal", "vertical"
     * @param {string} unit Units for position of guide
     * @param {number} position The position of guide.
     *      -300000.000 px to 300000.000 px
     *      -4166.667 in to 4166.667 in
     *      -10583.333 cm to 10583.333 cm
     *      -105833.333 mm to 105833.333 mm
     *      -300000.000 pt to 300000.000 pt
     *      -25000.000 pica to 25000.000 pica
     *      -50000.000 % to 50000.000 %
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * Create or open a document.
     */
    var createGuide = function (orientation, unit, position) {
        return new PlayObject(
            "make",
            {
                "new": {
                    "obj": "guide",
                    "value": {
                        "orientation": {
                            "enum": "orientation",
                            "value": orientation
                        },
                        "position": unitsIn[unit](position)
                    }
                }
            }
        );
    };

    /**
     * Delete guide(s)
     * 
     * @param {ActionDescriptor} sourceRef guide reference
     * 
     * @return {PlayObject}
     * 
     * Preconditions:
     * Create or open a document for deleting all guides.
     * Have guide(s) in the active document to delete by guide index.
     */
    var deleteGuide = function (sourceRef) {
        return new PlayObject(
            "delete",
            {
                "null": sourceRef
            }
        );
    };

    /**
     * Get the count of guide(s)
     *
     * @param {ActionDescriptor} sourceRef Document reference
     * 
     * @return {PlayObject}
     *
     * Preconditions:
     * Create or open a document.
     */
    var getGuideCount = function (sourceRef) {
        return new PlayObject(
            "getProperty",
            {
                "null": sourceRef,
                "property": "count"
            }
        );
    };



    exports.getGuide = getGuide;
    exports.createGuide = createGuide;
    exports.deleteGuide = deleteGuide;
    exports.getGuideCount = getGuideCount;
    
});
