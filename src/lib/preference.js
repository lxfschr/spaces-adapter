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
     * _ref object for photoshop custom settings
     *
     * @private
     * @type {Object}
     */
    var _customPrefRef = {
        _ref: [
            { _ref: "property", _property: "customPreference" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
        ]
    };

    /**
     * Build a play object that will fetch a Photoshop custom preference at the given key
     *
     * @param {string} key
     * @return {PlayObject}
     */
    var getCustomPreference = function (key) {
        var desc = {
            null: _customPrefRef,
            keyword: key
        };
        return new PlayObject("get", desc);
    };

    /**
     * Build a play object that will set a Photoshop custom preference key value pair
     *
     * The value is expected to be a simple object
     *
     * @param {string} key
     * @param {object} value
     * @param {boolean=} persistent Optional, defaults to true
     * @return {PlayObject}
     */
    var setCustomPreference = function (key, value, persistent) {
        var desc = {
                null: _customPrefRef,
                keyword: key,
                persistent: persistent === undefined ? true : !!persistent
            },
            obj = {
                _obj: "object",
                _value: value
            };

        desc[key] = obj;
        return new PlayObject("set", desc);
    };

    exports.getCustomPreference = getCustomPreference;
    exports.setCustomPreference = setCustomPreference;
});
