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
 
 /*jshint bitwise: false*/

define(function (require, exports) {
    "use strict";
    
    var PlayObject = require("../playobject");
        
    /**
     * Converts the given color to Photoshop acceptable color object
     *
     * @param {number|Array<number>|Object} rgb - Input color
     *
     * @returns {ActionDescriptor} RGBColor object for Photoshop
     */
    var colorObject = function (rgb) {
        var r, g, b;
        
        if (Array.isArray(rgb)) {
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];
        } else if (typeof rgb === "object") {
            if (rgb.hasOwnProperty("obj") && rgb.hasOwnProperty("value")) {
                return rgb; //Identity, as we don't need to change it
            } else if (rgb.hasOwnProperty("grain")) {
                r = rgb.red;
                g = rgb.grain;
                b = rgb.blue;
            } else if (rgb.hasOwnProperty("_r")) {
                r = rgb._r;
                g = rgb._g;
                b = rgb._b;
            } else {
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
            }
        } else if (typeof rgb === "number") {
            r = (rgb >> 16) & 255;
            g = (rgb >> 8) & 255;
            b = rgb & 255;
        }

        var color = {
            "red": r,
            "green": g,
            "blue": b
        };
        
        return {
            obj: "RGBColor",
            value: color
        };
    };
    
    /**
     * Set foreground color
     *
     * @param {array} rgb Acceptable form of color, see colorObject
     *
     * @returns {PlayObject}
     */
    var setForegroundColor = function (rgb) {
        return new PlayObject(
            "set",
            {
                "null": {
                    "ref": "color",
                    "property": "foregroundColor"
                },
                "to": colorObject(rgb)
            }
        );
    };

    /**
     * Set background color
     *
     * @param {array} rgb Acceptable form of color, see colorObject
     *
     * @returns {PlayObject}
     */
    var setBackgroundColor = function (rgb) {
        return new PlayObject(
            "set",
            {
                "null": {
                    "ref": "color",
                    "property": "backgroundColor"
                },
                "to": colorObject(rgb)
            }
        );
    };

    exports.colorObject = colorObject;
    exports.setForegroundColor = setForegroundColor;
    exports.setBackgroundColor = setBackgroundColor;
});
