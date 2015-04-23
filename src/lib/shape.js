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

"use strict";

var colorObject = require("./color").colorObject,
    unitsIn = require("./unit");

/**
 * Creates a fill contents object
 *
 * @param {string} type The type of shape fill content. "solidColorLayer" or "patternLayer"
 * @param {array} value
 *      The array of RGB color [red,green,blue] for "solidColorLayer". 0 to 255
 *      The array of Pattern ID and name for "patternLayer".
 *
 * @return {ActionDescriptor} Fill content object
 */
var fillContentsObject = function (type, value) {
    if (type === "solidColorLayer") {
        return {
            "obj": "solidColorLayer",
            "value": {
                "color": colorObject(value)
            }
        };
    } else if (type === "patternLayer") {
        return {
            "obj": "patternLayer",
            "value": {
                "pattern": {
                    "obj": "pattern",
                    "value": {
                        "ID": value[0],
                        "name": value[1]
                    }
                }
            }
        };
    }
    // TODO: Add a warning in this case
};

/**
 * Creates the action descriptor for enabling/disabling fill
 *
 * @param {boolean} enabled Whether the shape fill is enabled.
 *
 * @return {ActionDescriptor} Style that toggles fill
 */
var shapeFillObject = function (enabled) {
    return {
        "obj": "strokeStyle",
        "value": {
            "fillEnabled": enabled,
            "strokeStyleVersion": 2
        }
    };
};

/**
 * Creates the action descriptor for enabling/disabling stroke
 *
 * @param {boolean} enabled Whether the shape stroke is enabled.
 *
 * @return {ActionDescriptor} Style that toggles stroke
 */
var shapeStrokeObject = function (enabled) {
    return {
        "obj": "strokeStyle",
        "value": {
            "strokeEnabled": enabled,
            "strokeStyleVersion": 2
        }
    };
};

/**
 * Creates a shape object as an Action Descriptor
 *
 * @param {string} shape The kind of shape.
 * @param {Array<number>} values The array of shape values.
 *                  Rectangle or Rounded Rectangle: top,bottom,left,right,topleft,topright,bottomleft,bottomright
 *                  Ellipse: top,bottom,left,right
 *                  top,bottom,left,right: The location of shape 
 *                  topleft,topright,bottomleft,bottomright: The shape corner radius values
 *
 * @return {ActionDescriptor} The defined shape
 * Examples:
 * getShapeObject("rectangle",[300,500,250,600,-1,-1,-1,-1]); //rectangle
 * getShapeObject("rectangle",[300,500,250,600,10,10,10,10]); //rounded rectanglg
 * getShapeObject("ellipse",[700,200,500,550]); //ellipse
 */
var shapeObject = function (shape, values) {
    var shapeVal;
    
    if (shape === "rectangle") {
        shapeVal =  {
            "top": unitsIn.pixels(values[0]),
            "bottom": unitsIn.pixels(values[1]),
            "left": unitsIn.pixels(values[2]),
            "right": unitsIn.pixels(values[3]),
            "topLeft": unitsIn.pixels(values[4]),
            "topRight": unitsIn.pixels(values[5]),
            "bottomLeft": unitsIn.pixels(values[6]),
            "bottomRight": unitsIn.pixels(values[7]),
            "unitValueQuadVersion": 1
        };
    } else if (shape === "ellipse") {
        shapeVal = {
            "top": unitsIn.pixels(values[0]),
            "bottom": unitsIn.pixels(values[1]),
            "left": unitsIn.pixels(values[2]),
            "right": unitsIn.pixels(values[3]),
            "unitValueQuadVersion": 1
        };
    }

    return {
        obj: shape,
        "value": shapeVal
    };
};

exports.shapeObject = shapeObject;
exports.fillContentsObject = fillContentsObject;
exports.shapeFillObject = shapeFillObject;
exports.shapeStrokeObject = shapeStrokeObject;
