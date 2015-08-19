/*
 * Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
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
     * _ref object for the generator status property
     *
     * @private
     * @type {object}
     */
    var _generatorStatusRef = {
        _ref: [
            { _ref: "property", _property: "generatorStatus" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
        ]
    };

    /**
     * _ref object for the generator "pluginPicker" property
     *
     * @private
     * @type {object}
     */
    var _pluginPickerRef = {
        _ref: [
            { _ref: "property", _property: "pluginPicker" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
        ]
    };

    /**
     * Build a PlayObject that will query the current status of Generator
     *
     * The resolved response can be tested for an "enabled" status as:
     * `status.generatorStatus.generatorStatus === 1`
     *
     * @return {PlayObject}
     */
    var getGeneratorStatus = function () {
        var desc = {
            "null": _generatorStatusRef
        };
        return new PlayObject("get", desc);
    };

    /**
     * Build a play object that will attempt to set generator to enabled/disabled
     *
     * @param {boolean} desiredStatus If truthy, enabled generator. Otherwise disable generator.
     * @return {PlayObject}
     */
    var setGeneratorStatus = function (desiredStatus) {
        var desc = {
            null: _pluginPickerRef,
            to: {
                _obj: "pluginPicker",
                _value: {
                    generatorEnabled: desiredStatus,
                    generatorDisabled: !desiredStatus
                }
            }
        };

        return new PlayObject("set", desc);
    };

    exports.getGeneratorStatus = getGeneratorStatus;
    exports.setGeneratorStatus = setGeneratorStatus;
});
