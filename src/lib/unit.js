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
 
 // This is a wrapper to create unit descriptors

define(function (require, exports)
{
    "use strict";

    /** 
     * Private function to create the Action Descriptor for the given unit
     */
    var _unit = function (kind, val) {
        return {
            unit: kind + "Unit",
            value: val
        };
    };

    // TODO: Later on we need a better translation method here
    // var _toInches = {
    //     rulerInches: 1,
    //     pointsUnit: 1 / 72,
    //     millimetersUnit: 1 / 25.4,
    //     rulerCm: 1 / 2.54
    // };
    // 
    // var toPixels = function (unitValue, resolution) {
    //     var rawValue = unitValue.value;
    //     var unit = unitValue.unit;
    // 
    //     var factor = unit === "pixelsUnit" ? 1 : resolution * _toInches[unit];
    // 
    //     return rawValue * factor;
    // };


    exports.density = _unit.bind(null, "density");
    exports.pixels = exports.px = _unit.bind(null, "pixels");
    exports.percent = _unit.bind(null, "percent");
    exports.angle = _unit.bind(null, "angle");
    
    exports.inches = exports.in = _unit.bind(null, "inches");
    exports.centimeters = exports.cm = _unit.bind(null, "centimeters");
    exports.picas = _unit.bind(null, "picas");
    exports.degrees = _unit.bind(null, "degrees");
    
    exports.number = _unit.bind(null, "number");
    exports.seconds = _unit.bind(null, "seconds");
    
    //Type uses these
    exports.points = exports.pt = _unit.bind(null, "points");
    exports.millimeters = exports.mm = _unit.bind(null, "millimeters");
    
    //Guides use this
    exports.distance = _unit.bind(null, "distance");

    // exports.toPixels = toPixels;

});
