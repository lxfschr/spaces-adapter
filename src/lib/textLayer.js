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

    var unitsIn = require("./unit"),
        colorObject = require("./color").colorObject;
    
    /**
     * Create a text layer
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {string} strTextKey The text string. 
     * @param {array} numClickPointH The horizontal text click point.
     * @param {array} numClickPointV The vertical text click point.
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Open or create a document
     *
     * Examples:
     * createText("Photoshop Playground",20,20);
     */
    var createText = function (sourceRef, strTextKey, numClickPointH, numClickPointV) {
        return {
            command: "make",
            descriptor: {
                "null": sourceRef,
                "using": {
                    "obj": "textLayer",
                    "value": {
                        "textKey": strTextKey,
                        "textClickPoint": {
                            "obj": "paint",
                            "value": {
                                "horizontal": unitsIn.percent(numClickPointH),
                                "vertical": unitsIn.percent(numClickPointV)
                            }
                        },
                        "textStyleRange": [
                        ]
                    }
                }
            }
        };
    };

    /**
     * Set the font face
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {string} face The string of font family name
     * @param {string} weight The string of font style name
     *
     * @returns {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setFace("Helvetica","Light");
     */
    var setFace = function (sourceRef, face, weight) {
        return {
            command: "set",
            descriptor: {
                "null": sourceRef,
                "to": {
                    fontName: face,
                    fontStyleName: weight
                }
            }
        };
    };

    /**
     * Set the font size
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {number} val The size of the font.
     *      Points: 0.01pt to 1296.00pt
     *      Pixels: 0.01px to 1296.00px
     *      Millimeters: 0.00mm to 457.19mm
     * @param {string} unit The unit of the type.  "pt","px", or "mm"
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setSize(14, "pt");
     */
    var setSize = function (sourceRef, val, unit) {
        return {
            command: "set",
            descriptor: {
                "null": sourceRef,
                "to": {
                    "obj": "textStyle",
                    "value": {
                        "size": unitsIn[unit](val)
                    }
                }
            }
        };
    };

    /**
     * Set the font alignment
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {string} orient The alignment of the type.  "right", "center", "left", "justifyAll"
     *
     * @return {PlayObject} The action descriptor of the paragraph style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setAlignment("center");
     */
    var setAlignment = function (sourceRef, orient) {
        return {
            command: "set",
            desciptor: {
                "null": sourceRef,
                "to": {
                    "value": {
                        "align": {
                            "enum": "alignmentType",
                            "value": orient
                        }
                    }
                }
            }
        };
    };

    /**
     * Set the text leading
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {boolean} auto Whether the auto leading is enabled.
     * @param {number} val The leading of the text.
     *      Points: 0.01pt to 5000.00pt
     *      Pixels: 0.01px to 5000.00px
     *      Millimeters: 0.00mm to 1763.88mm
     * @param {string} unit The unit of the type.  "pointsUnit","pixelsUnit", or "millimetersUnit"
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setLeading(true);
     * setLeading(false,14,"pt");
     * setLeading(false,14);
     */
    var setLeading = function (sourceRef, auto, val, unit) {
        if (auto === false) {
            return {
                command: "set",
                desciptor: {
                    "null": sourceRef,
                    "to": {
                        "obj": "textStyle",
                        "value": {
                            "autoLeading": auto,
                            "leading": unitsIn[unit](val)
                        }
                    }
                }
            };
        } else {
            return {
                command: "set",
                desciptor: {
                    "null": sourceRef,
                    "to": {
                        "obj": "textStyle",
                        "value": {
                            "autoLeading": auto
                        }
                    }
                }
            };
        }
    };

    /**
     * Set the text tracking
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {number} val The amount of space between a range of letters or characters. -1000 to 10000
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setLeading(10);
     */
    var setTracking = function (sourceRef, val) {
        return {
            command: "set",
            desciptor: {
                "null": sourceRef,
                "to": {
                    "obj": "textStyle",
                    "value": {
                        "tracking": val
                    }
                }
            }
        };
    };

    /**
     * Set the text color
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {array} arrayTextColor The array of RGB color [red,green,blue]. 0 to 255
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setColor([100,200,100]);
     */
    var setColor = function (sourceRef, arrayTextColor) {
        return {
            command: "set",
            desciptor: {
                "null": sourceRef,
                "to": {
                    "obj": "textStyle",
                    "value": {
                        "color": colorObject(arrayTextColor)
                    }
                }
            }
        };
    };

    /**
     * Set the text orientation
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {string} strTextOrientation The text orientation. "horizontal" or "vertical"
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setOrientation("vertical");
     */
    var setOrientation = function (sourceRef, strTextOrientation) {
        return {
            command: "set",
            descriptor: {
                "null": sourceRef,
                "to": {
                    "enum": "orientation",
                    "value": strTextOrientation
                }
            }
        };
    };

    /**
     * Set the text anti alias
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {string} strAntiAliasType The anti alias type. "none","sharp","crisp","strong","smooth","macLcd", or "mac"
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setAntiAlias("smooth");
     */
    var setAntiAlias = function (sourceRef, strAntiAliasType) {
        return {
            command: "set",
            desciptor: {
                "null": sourceRef,
                "to": {
                    "enum": "antiAliasType",
                    "value": _antiAlias[strAntiAliasType]
                }
            }
        };
    };

    var _antiAlias = {
        none: "antiAliasNone",
        sharp: "antiAliasSharp",
        crisp: "antiAliasCrisp",
        strong: "antiAliasStrong",
        smooth: "antiAliasSmooth",
        macLcd: "antiAliasPlatformLCD",
        mac: "antiAliasPlatformGray"
    };

    /**
     * Set range and change text style
     *
     * @param {ActionDescriptor} sourceRef Layer reference
     * @param {number} from The index of string to set the range from
     * @param {number} to The index of string to set the range to
     * @param {string} face The string of font family name
     * @param {string} weight The string of font style name
     * @param {string} unit The unit of the type.  "pt","px", or "mm"
     * @param {number} size The size of the font.
     *      Points: 0.01pt to 1296.00pt
     *      Pixels: 0.01px to 1296.00px
     *      Millimeters: 0.00mm to 457.19mm
     * @param {array} arrayTextColor The array of RGB color [red,green,blue]. 0 to 255
     *
     * @return {PlayObject} The action descriptor of the text style.
     *
     * Preconditions:
     * Select a text layer
     *
     * Examples:
     * setRangeAndChangeTextStyle(0,1,"Helvetica","Bold","pt",60,[200,100,150]);
     * setRangeAndChangeTextStyle(0,3,"","","pt",20,[200,100,150]);
     */
    var setRangeAndChangeTextStyle = function (sourceRef, from, to, face, weight, unit, size, arrayTextColor) {
        return {
            command: "set",
            desciptor: {
                "null": sourceRef,
                "to": {
                    "obj": "textLayer",
                    "value": {
                        "textStyleRange": [
                            {
                                "obj": "textStyleRange",
                                "value": {
                                    "from": from,
                                    "to": to,
                                    "textStyle": {
                                        "obj": "textStyle",
                                        "value": {
                                            "fontName" : face,
                                            "fontStyleName" : weight,
                                            "size": unitsIn[unit](size),
                                            "color": colorObject(arrayTextColor)
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        };
    };

    exports.createText = createText;
    exports.setFace = setFace;
    exports.setSize = setSize;
    exports.setAlignment = setAlignment;
    exports.setLeading = setLeading;
    exports.setTracking = setTracking;
    exports.setColor = setColor;
    exports.createText = createText;
    exports.setOrientation = setOrientation;
    exports.setAntiAlias = setAntiAlias;

    exports.setRangeAndChangeTextStyle = setRangeAndChangeTextStyle;

});
