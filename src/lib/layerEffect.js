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

    var PlayObject = require("../playObject"),
        referenceBy = require("./reference").wrapper("layer"),
        referenceOf = require("./reference").refersTo,
        inUnits = require("./unit"),
        color = require("./color"),
        assert = require("../util").assert;
        
    /**
     * List of singular layer effect types. Each of these types can have only one effect in classic PS.
     *
     * @private
     * @type {Set.<string>}
     */
    var _SINGULAR_EFFECT_TYPES = new Set([
        "bevelEmboss", // Bevel & Emboss
        "chromeFX", // Satin
        "innerGlow", // Inner Glow
        "outerGlow", // Outer Glow
        "patternFill" // Pattern Overlay
    ]);

    /**
     * Generically build a PlayObject for a layerEffect
     * The layerEffectValue parameter should be a fully constructed object that can be supplied to the "to._value"
     * property of the descriptor.
     *
     * @private
     * @param {ActionDescriptor} ref layer(s) reference
     * @param {string} layerEffectType type of layerEffect (example: dropShadow)
     * @param {object} layerEffectValue object that can be supplied for "to._value" in the descriptor
     * @return {PlayObject}
     */
    var _layerEffectDescriptor = function (ref, layerEffectType, layerEffectValue) {
        var val = {};

        val[layerEffectType] = layerEffectValue;

        return new PlayObject(
            "set",
            {
                "null": {
                    "_ref": [
                        {
                            "_property": "layerEffects",
                            "_ref": "property"
                        },
                        ref
                    ]
                },
                "to": {
                    "_obj": "layerEffects",
                    "_value": val
                }
            }
        );
    };

    /**
     * Generically build an PlayObject for a layerEffect which uses the useExtendedReference option
     * The layerEffectValue parameter should be a fully constructed object that can be supplied to the "to._value"
     * property of the descriptor.
     *
     * @private
     * @param {ActionDescriptor} ref layer(s) reference
     * @param {string} layerEffectType type of layerEffect (example: dropShadow)
     * @param {object} layerEffectValue object that can be supplied for "to._value" in the descriptor
     *
     * @return {PlayObject}
     */
    var _extendedLayerEffectDescriptor = function (ref, layerEffectType, layerEffectValue) {
        return new PlayObject(
            "set",
            {
                "null": {
                    "_ref": [
                        {
                            _ref: null,
                            "_property": layerEffectType
                        },
                        {
                            "_property": "layerEffects",
                            "_ref": "property"
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
     * Helper Function to set blend mode correctly. We should have a blend mode object in the future
     *
     * @param {string} mode the blend mode
     * @return {object} the PS friendly blend mode object
     */
    var _blendMode = function (mode) {
        return {
            _enum: "blendMode",
            _value: mode
        };
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
        if (_isHiddenLayerProperties(properties)) {
            return properties;
        }

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
        if (_.isString(properties.blendMode)) {
            layerEffectPsProperties.mode = _blendMode(properties.blendMode);
        }
        return layerEffectPsProperties;
    };

    var _isHiddenLayerProperties = function (properties) {
        return properties.enabled === false && properties.present === false;
    };

    /**
     * Return layer effect descriptor for the given properties
     *
     * The expected format of the properties object is like:
     * {enabled: true, color: {r: 255, g: 0, b: 0}, blur: 20}
     * Distance/positions values in pixels
     * Angles in degrees
     * Opacity percentage [0,100]
     *
     * @private
     * @param {string} effectType
     * @param {object} properties intermediate object format using Photoshop names, but without units
     *
     * @return {Descriptor}
     */
    var _effectDescriptor = function (effectType, properties) {
        var value = properties;
        
        if (effectType === "innerShadow" || effectType === "dropShadow") {
            value = _shadowProperties(properties);
        }
        
        return {
            "_obj": effectType,
            "_value": value
        };
    };

    /**
     * Update the given type of layer effect properties for the given layer(s)
     *
     * @param {string} effectType - type of layer effect. 
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of effect properties
     *
     * @return {PlayObject}
     */
    var setLayerEffect = function (effectType, ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "Adapter.setLayerEffect: ref is a non-layer reference");
        assert(propertyArray.length > 0, "Adapter.setLayerEffect: propertyArray cannot be empty");
        
        var descriptorArray = propertyArray.map(function (properties) {
                return _effectDescriptor(effectType, properties);
            }),
            descriptorValue = descriptorArray;
        
        if (_SINGULAR_EFFECT_TYPES.has(effectType)) {
            descriptorValue = descriptorArray[0];
        } else {
            effectType = effectType + "Multi";
        }

        return _layerEffectDescriptor(ref, effectType, descriptorValue, true);
    };


    /**
     * Representation of a hidden layer effect.
     *
     * @constant {object}
     */
    var HIDDEN_LAYER_EFFECT_PROPERTIES = { "enabled": false, "present": false };

    /**
     * Update the given type of layer effect properties for the given layer(s) without changing the
     * parent layer effect.
     *
     * @param {string} effectType - type of layer effect.
     * @param {ActionDescriptor} ref - Reference of layer(s) to update
     * @param {Array.<object>} propertyArray Array of effect properties. Passing an empty arrary
     * will remove all effects of the type.
     *
     * @return {PlayObject}
     */
    var setExtendedLayerEffect = function (effectType, ref, propertyArray) {
        assert(referenceOf(ref) === "layer", "Adapter.setExtendedLayerEffect: ref is a non-layer reference");
        
        if (propertyArray.length === 0) {
            // We cannot delete all layer effects of specific type by sending an emptry property array 
            // to Photoshop; this will break its layer effects feature. Instead, we replace the visible 
            // effect(s) with a hidden one, which is equivalent to deleting them.
            propertyArray.push(HIDDEN_LAYER_EFFECT_PROPERTIES);
        }
        
        var descriptorArray = propertyArray.map(function (properties) {
                return _effectDescriptor(effectType, properties);
            }),
            descriptorValue = descriptorArray;
            
        if (_SINGULAR_EFFECT_TYPES.has(effectType)) {
            descriptorValue = descriptorArray[0];
        } else {
            effectType = effectType + "Multi";
        }

        return _extendedLayerEffectDescriptor(ref, effectType, descriptorValue);
    };

    /**
     * Saves the given layer's effects in an .asl file with the thumbnail in a .png file
     * in given locations
     *
     * @param {ActionDescriptor} ref Layer being referenced
     * @param {string} filePath Where to save the temporary .asl file
     * @param {string} thumbnailPath Where to save the temporary .png thumbnail
     *
     * @return {PlayObject}
     */
    var saveLayerStyleFile = function (ref, filePath, thumbnailPath) {
        assert(referenceOf(ref) === "layer", "saveLayerStyle requires a layer reference");
        
        return new PlayObject(
            "saveStyleFile",
            {
                "null": ref,
                "to": {
                    "_path": filePath
                },
                "thumbnail": {
                    "_path": thumbnailPath
                }
            }
        );
    };

    /**
     * Applies the layer style at the given file path to 
     * currently active layers
     *
     * @param {ActionDescriptor} ref Layer being referenced
     * @param {string} filePath
     *
     * @return {PlayObject}
     */
    var applyLayerStyleFile = function (ref, filePath) {
        return new PlayObject(
            "applyStyleFile",
            {
                "null": ref,
                "from": {
                    "_path": filePath
                }
            }
        );
    };

    exports.referenceBy = referenceBy;

    exports.setLayerEffect = setLayerEffect;
    exports.setExtendedLayerEffect = setExtendedLayerEffect;

    exports.saveLayerStyleFile = saveLayerStyleFile;
    exports.applyLayerStyleFile = applyLayerStyleFile;
});
