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

    var referenceBy = require("src/lib/reference").wrapper("document"),
        unitsIn = require("src/lib/unit");

    /**
     * Open a document (psd, png, jpg, ai, gif)
     * 
     * @param {ActionDescriptor} sourceRef document reference
     * @param {string} pdfSelection "page" or "image"
     * @param {number} pageNumber The number of the page
     * @param {boolean} suppressWarnings true or false
     * @param {string} name The name of the Document.
     * @param {number} bitDepth The bit depth. 8 or 16
     * @param {string} box Box to crop to. See openDocument.cropTo vals 
     * @param {boolean} bAntiAlias true or false
     * @param {boolean} bConstrainProportions true or false
     * @param {number} width The width of the image size.
     * @param {number} height The height of the image size
     * @param {string} colorSpace The color space of the image mode.  See openDocument.mode vals
     * @param {number} resolution The resolution value
     *
     * @return {PlayObject}
     *
     */
    var openDocument = function (sourceRef, pdfSelection, pageNumber, suppressWarnings, name, bitDepth, box, bAntiAlias,
        bConstrainProportions, width, height, colorSpace, resolution) {
        var fileType = sourceRef.path.lastIndexOf(".");
        if ((fileType === "psd") || (fileType === "jpg") || (fileType === "png")) {
            return {
                command: "open",
                descriptor: {
                    "null": sourceRef
                }
            };
        } else if (fileType === "ai") {
            if (pdfSelection === "page") {
                return {
                    command: "open",
                    descriptor: {
                        "null": sourceRef,
                        "as": {
                            "obj": "PDFGenericFormat",
                            "value": {
                                "antiAlias": bAntiAlias,
                                "constrainProportions": bConstrainProportions,
                                "crop": {
                                    "enum": "cropTo",
                                    "value": openDocument.cropTo[box]
                                },
                                "depth": bitDepth,
                                "width":  unitsIn.pixels(width),
                                "height": unitsIn.pixels(height),
                                "mode": {
                                    "enum": "colorSpace",
                                    "value": openDocument.mode[colorSpace]
                                },
                                "name": name,
                                "pageNumber": pageNumber,
                                "resolution": unitsIn.density(resolution),
                                "suppressWarnings": suppressWarnings,
                                "selection": {
                                    "enum": "pdfSelection",
                                    "value": pdfSelection
                                }
                            }
                        }
                    }
                };
            } else if (pdfSelection === "image") {
                return {
                    command: "open",
                    descriptor: {
                        "null": sourceRef,
                        "as": {
                            "obj": "PDFGenericFormat",
                            "value": {
                                "pageNumber": pageNumber,
                                "selection": {
                                    "enum": "pdfSelection",
                                    "value": pdfSelection
                                },
                                "suppressWarnings": suppressWarnings
                            }
                        }
                    }
                };
            }
        }
    };

    openDocument.cropTo = {
        bounding: "boundingBox",
        media: "mediaBox",
        crop: "cropBox",
        bleed: "bleedBox",
        trim: "trimBox",
        art: "artBox"
    };

    openDocument.mode = {
        rgb: "RGBColor",
        gray: "grayscaleMode",
        cmyk: "CMYKColorEnum",
        lab: "labColor"
    };

    /**
     * Close a document without saving
     * 
     * @param {string} save Whether the document should be saved. "yes", "no"
     *
     * @return {PlayObject}
     *
     * Preconditions:
     * The document should be saved previously and have fileReference path value for saving.
     */
    var closeDocument = function (save) {
        return {
            command: "close",
            "saving": {
                "enum": "yesNo",
                "value": save
            }
        };
    };

    /**
     * Save a document
     * 
     *
     */
    var saveDocument = function () {
        //console.log("not implemented.");
    };

    /**
     * Select a document
     * 
     * @param {ActionDescriptor} sourceRef document reference
     *
     * @return {PlayObject}
     *
     */
    var selectDocument = function (sourceRef) {
        return {
            command: "select",
            descriptor: {
                "null": sourceRef
            }
        };
    };

    /**
     * Return a document path to be used for opening or saving a document.
     * 
     * @param {string} path document path
     *
     * @return {PlayObject}
     *
     */
    referenceBy.path = function (path) {
        return {
            descriptor: {
                "null": path
            }
        };
    };

    exports.referenceBy = referenceBy;
    
    exports.open = openDocument;
    exports.close = closeDocument;
    exports.save = saveDocument;
    exports.select = selectDocument;

});
