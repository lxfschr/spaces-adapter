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
    
    var PlayObject = require("../playobject");

    /**
     * Sets the current tool to given tool
     *
     * @param {string} tool
     * @return {PlayObject}
     */
    var setTool = function (tool) {
        return new PlayObject(
            "select",
            {
                "null": {
                    "_ref": tool
                }
            }
        );
    };
    
    /**
     * Sets the tool options. Preconditions: tool is currently selected.
     * 
     * @param {string} tool
     * @param {Object} options
     *
     * @return {PlayObject}
     */
    var setToolOptions = function (tool, options) {
        return new PlayObject(
            "set",
            {
                "null": {
                    _ref: tool
                },
                "to": {
                    _obj: "currentToolOptions",
                    _value: options
                }
            }
        );
    };

    /**
     * Sets the global preference of whether vector tools modify layer selection or not
     * This translates to the Select: [Active Layers vs All Layers] option in the toolbar.
     * 
     * @param {boolean} allLayers If true, will set the Select mode to All Layers, false for Active Layers
     * 
     * @return {PlayObject}
     */
    var setDirectSelectOptionForAllLayers = function (allLayers) {
        return new PlayObject(
            "set",
            {
                "null": {
                    _ref: [
                        {
                            "_property": "generalPreferences",
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
                    _obj: "generalPreferences",
                    _value: {
                        "legacyPathDrag": true,
                        "vectorSelectionModifiesLayerSelection": allLayers
                    }
                }
            }
        );
    };


    /**
     * Resets the mode of shape tools back to "shape" from "path" or "pixel".
     * 
     * @return {PlayObject}
     */
    var resetShapeTool = function () {
        return new PlayObject(
            "reset",
            {
                null: {
                    _ref: [
                        {
                            _ref: null,
                            _property: "vectorToolMode"
                        },
                        {
                            _ref: "application",
                            _enum: "ordinal",
                            _value: "targetEnum"
                        }
                    ]
                }
            }
        );
    };


    /**
     * Resets the mode of shape tools back to "shape" from "path" or "pixel".
     * 
     * @return {PlayObject}
     */
    var defaultShapeTool = function () {
        return new PlayObject(
            "set",
            {
                null: {
                    _ref: [
                        {
                            _ref: "property",
                            _property: "baseShapeStyle"
                        },
                        {
                            _ref: "document",
                            _enum: "ordinal",
                            _value: "targetEnum"
                        }
                    ]
                },
                "to": {
                    _obj: "baseShapeStyle",
                    _value: { "strokeStyle": {
                        _obj: "strokeStyle",
                        _value: {
                            _strokeStyleLineDashSet: [
                                { _unit: "noneUnit",
                                _value: 1 }],
                            _strokeStyleContent: {
                                _obj: "solidColorLayer",
                                _value: {
                                    _color: {
                                        _obj: "RGBColor",
                                        _value: { "red": 217, "green": 217, "blue": 217 }
                                    }
                                }
                            },
                            _strokeStyleLineWidth: {
                                _unit: "pixelsUnit",
                                _value: 2 },
                            _strokeStyleVersion: 2,
                            _strokeStyleLineAlignment: "strokeStyleAlignInside",
                            _strokeEnabled: true }
                    },
                        _fillContents: {
                            _obj: "solidColorLayer",
                            _value: {
                                _color: {
                                    _obj: "RGBColor",
                                    _value: { "red": 157, "green": 157, "blue": 157 }
                                }
                            }
                        }
                    }
                }
            }
        );
    };
    
    /**
     * Resets the mode of type tools back to a default font
     * 
     * @return {PlayObject}
     */
    var resetTypeTool = function () {
        return new PlayObject(
            "set",
            {
                "null": {
                    _ref: {
                            "_ref": "typeCreateOrEditTool"
                        }
                },
                "to": {
                    _obj: "null",
                    _value: {
                        "textToolCharacterOptions": {
                            "obj": "null",
                            "value": {
                                "textStyle": {
                                    "obj": "null",
                                    "value": {
                                        "fontName": "Myriad Pro",
                                        "size": {
                                            "unit": "pointsUnit",
                                            "value": 16
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                canExecuteWhileModal: true
            }

        );
    };

    exports.setTool = setTool;
    exports.setToolOptions = setToolOptions;
    exports.setDirectSelectOptionForAllLayers = setDirectSelectOptionForAllLayers;
    exports.resetShapeTool = resetShapeTool;
    exports.defaultShapeTool = defaultShapeTool;
    exports.resetTypeTool = resetTypeTool;
});
