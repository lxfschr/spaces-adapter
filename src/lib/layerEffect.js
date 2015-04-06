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
     * @param {boolean=} multi value that allows function to return the Multi Layer Effect friendly descriptor 
     *
     * @return {PlayObject}
     */
    var _layerEffectDescriptor = function (ref, layerEffectType, layerEffectValue, multi) {
        var val = {};

        if (multi) {
            val[layerEffectType] = layerEffectValue;
        } else {
            val[layerEffectType] = {
                obj: layerEffectType,
                value: layerEffectValue
            };
        }

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
     * Generically build an PlayObject for a layerEffect which uses the useExtendedReference option
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
    
    var _extendedLayerEffectDescriptor = function (ref, layerEffectType, layerEffectValue) {

        return new PlayObject(
            "set",
            {
                "null": {
                    "ref": [
                        {
                            ref: null,
                            "property": layerEffectType
                        },
                        {
                            "property": "layerEffects",
                            "ref": "property"
                        },
                        ref
                    ]
                },
                "to": layerEffectValue
            },
            {
                useExtendedReference: true
            }
        );
    };
    /**
     * Parse Shadow JS properties and assign units to make them acceptable to PS 
     * 
     * The expected format of the properties object is like:
     * {enabled: true, color: {r: 255, g: 0, b: 0}, blur: 20}
     * Distance/positions values in pixels
     * Angles in degrees
     * Opacity percentage [0,100]
     * 
     * @private
     * @param {object} properties intermediate object format using Photoshop names, but without units
     *
     * @return {object} PS friendly Properties 
     */
    var _shadowProperties = function (properties) {
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
        return layerEffectPsProperties;
    };

    /**
     * Return drop shadow descriptor for the given properties
     * 
     * The expected format of the properties object is like:
     * {enabled: true, color: {r: 255, g: 0, b: 0}, blur: 20}
     * Distance/positions values in pixels
     * Angles in degrees
     * Opacity percentage [0,100]
     *
     * @private
     * @param {object} properties intermediate object format using Photoshop names, but without units
     *
     * @return {Descriptor}
     */

    var  _dropShadowDescriptor = function (properties) {
        return {
            "obj": "dropShadow",
            "value": _shadowProperties(properties)
        };
    };

    /**
     * Return inner shadow descriptor for the given properties
     * 
     * The expected format of the properties object is like:
     * {enabled: true, color: {r: 255, g: 0, b: 0}, blur: 20}
     * Distance/positions values in pixels
     * Angles in degrees
     * Opacity percentage [0,100]
     *
     * @private
     * @param {object} properties intermediate object format using Photoshop names, but without units
     *
     * @return {Descriptor}
     */

    var  _innerShadowDescriptor = function (properties) {
        return {
            "obj": "innerShadow",
            "value": _shadowProperties(properties)
        };
    };
    /**
     * Update multiple drop shadow layer effect properties for the given layer(s)
     *
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of DropShadow properties 
     *
     * @return {PlayObject}
     */
    var _setDropShadows = function (ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "setDropShadow is passed a non-layer reference");
        
        var descriptorArray = propertyArray.map(function (properties) {
            return _dropShadowDescriptor(properties);
        });

        return _layerEffectDescriptor(ref, "dropShadowMulti", descriptorArray, true);
    };

    /**
     * Update multiple drop shadow layer effect properties for the given layer(s) without changing the 
     * parent layer effect
     *
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of DropShadow properties 
     *
     * @return {PlayObject}
     */
    var _setExtendedDropShadows = function (ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "setDropShadow is passed a non-layer reference");
        
        var descriptorArray = propertyArray.map(function (properties) {
            return _dropShadowDescriptor(properties);
        });

        return _extendedLayerEffectDescriptor(ref, "dropShadowMulti", descriptorArray, true);
    };

    /**
     * Update multiple inner shadow layer effect properties for the given layer(s)
     *
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of InnerShadow properties 
     *
     * @return {PlayObject}
     */
    var _setInnerShadows = function (ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "setInnnerShadow is passed a non-layer reference");
        
        var descriptorArray = propertyArray.map(function (properties) {
            return _innerShadowDescriptor(properties);
        });

        return _layerEffectDescriptor(ref, "innerShadowMulti", descriptorArray, true);
    };

    /**
     * Update multiple drop shadow layer effect properties for the given layer(s) without changing the 
     * parent layer effect
     *
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of InnerShadow properties 
     *
     * @return {PlayObject}
     */
    var _setExtendedInnerShadows = function (ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "setInnnerShadow is passed a non-layer reference");
        
        var descriptorArray = propertyArray.map(function (properties) {
            return _innerShadowDescriptor(properties);
        });

        return _extendedLayerEffectDescriptor(ref, "innerShadowMulti", descriptorArray, true);
    };

    var setLayerEffect = function (type, ref, propertyArray) {
        if (type === "innerShadow") {
            return _setInnerShadows(ref, propertyArray);
        } else if (type === "dropShadow") {
            return _setDropShadows(ref, propertyArray);
        }
    };

    var setExtendedLayerEffect = function (type, ref, propertyArray) {
        if (type === "innerShadow") {
            return _setExtendedInnerShadows(ref, propertyArray);
        } else if (type === "dropShadow") {
            return _setExtendedDropShadows(ref, propertyArray);
        }
    };

    exports.referenceBy = referenceBy;

    exports.setLayerEffect = setLayerEffect;
    exports.setExtendedLayerEffect = setExtendedLayerEffect;
});
