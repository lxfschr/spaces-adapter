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

    var _ = require("lodash");

    var PlayObject = require("../playobject"),
        referenceBy = require("./reference").wrapper("layer"),
        referenceOf = require("./reference").refersTo,
        inUnits = require("./unit"),
        color = require("./color"),
        assert = require("../util").assert;

    /**
     * Generically build a PlayObject for a layerEffect
     * The layerEffectValue parameter should be a fully constructed object that can be supplied to the "to.value"
     * property of the descriptor.
     *
     * @private
     * @param {ActionDescriptor} ref layer(s) reference
     * @param {string} layerEffectType type of layerEffect (example: dropShadow)
     * @param {object} layerEffectValue object that can be supplied for "to.value" in the descriptor
     *
     * @return {PlayObject}
     */
    var _layerEffectDescriptor = function (ref, layerEffectType, layerEffectValue) {
        var val = {};

        //TODO future: validate the layerEffectType against a list.  Only supporting drop shadow for now
        val[layerEffectType] = {
            obj: layerEffectType,
            value: layerEffectValue
        };

        return new PlayObject(
            "set",
            {
                "null": {
                    "ref": [
                        {
                            "property": "layerEffects",
                            "ref": "property"
                        },
                        ref
                    ]
                },
                "to": {
                    "obj": "layerEffects",
                    "value": val
                }
            }
        );
    };

    /**
     * Update drop shadow layer effect properties for the given layer(s)
     * 
     * The expected format of the properties object is like:
     * {enabled: true, color: {r: 255, g: 0, b: 0}, blur: 20}
     * Distance/positions values in pixels
     * Angles in degrees
     * Opacity percentage [0,100]
     *
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {object} properties intermediate object format using photoshop names, but without units
     *
     * @return {PlayObject}
     */
    var setDropShadow = function (ref, properties) {
        assert(referenceOf(ref) === "layer", "setDropShadow is passed a non-layer reference");

        var layerEffectPsProperties = {
            enabled: properties.enabled === undefined ? true : properties.enabled,
            useGlobalAngle: properties.useGlobalAngle === undefined ? true : properties.useGlobalAngle
        };

        if (_.isObject(properties.color)) {
            layerEffectPsProperties.color = color.colorObject(properties.color);
        }
        if (_.isNumber(properties.opacity)) {
            layerEffectPsProperties.opacity = inUnits.percent(properties.opacity);
        }
        if (_.isNumber(properties.chokeMatte)) {
            layerEffectPsProperties.chokeMatte = inUnits.pixels(properties.chokeMatte);
        }
        if (_.isNumber(properties.blur)) {
            layerEffectPsProperties.blur = inUnits.pixels(properties.blur);
        }
        if (_.isNumber(properties.localLightingAngle)) {
            layerEffectPsProperties.localLightingAngle = inUnits.degrees(properties.localLightingAngle);
        }
        if (_.isNumber(properties.distance)) {
            layerEffectPsProperties.distance = inUnits.pixels(properties.distance);
        }

        return _layerEffectDescriptor(ref, "dropShadow", layerEffectPsProperties);
    };

    exports.referenceBy = referenceBy;

    exports.setDropShadow = setDropShadow;
});
