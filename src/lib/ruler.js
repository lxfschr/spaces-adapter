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
     * Set Photoshop to use the ruler unit preference of our choice
     *
     * @param {string} type -  ruler unit type ie "rulerPixels"
     * @returns {PlayObject} 
     */
    var setRulerUnits = function (type) {
        return new PlayObject("set", {
            "null": {
                "_ref": [
                    {
                        "_property": "unitsPrefs",
                        "_ref": "property"
                    },
                    {
                        "_enum": "ordinal",
                        "_ref": "application",
                        "_value": "targetEnum"
                    }
                ]
            },
            "to": {
                "_obj": "unitsPrefs",
                "rulerUnits": {
                    "_enum": "rulerUnits",
                    "_value": type
                }
            }
        });
    };

    var setRulerVisibility = function (visible) {
        return new PlayObject("set", {
            "null": {
                "_ref": [
                    {
                        "_ref": null,
                        "_property": "toggleRulers"
                    },
                    {
                        "_ref": "document",
                        "_enum": "ordinal",
                        "_value": "targetEnum"
                    }
                ]
            },
            "visible": visible
        });
    };

    exports.setRulerUnits = setRulerUnits;
    exports.setRulerVisibility = setRulerVisibility;
});
