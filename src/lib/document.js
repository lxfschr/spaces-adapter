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

    var referenceBy = require("./reference").wrapper("document"),
        unitsIn = require("./unit");

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
        var fileType,
            strIndex = sourceRef.path.lastIndexOf(".");
        if (strIndex !== -1) {
            strIndex++;
            fileType = sourceRef.path.substring(strIndex);
        }
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
    var saveDocument = function (path, jpgQuality) {
        var strIndex = path.lastIndexOf("."),
            pathIndex = path.lastIndexOf("/"),
            fileType,
            fileName,
            filePath,
            saveAs = {};
        if (strIndex !== -1) {
            strIndex++;
            fileType = path.substring(strIndex);
        }
        if (pathIndex !== -1) {
            pathIndex++;
            fileName = path.substring(pathIndex);
        }
        filePath = path.replace(fileName, "");

        if (fileType === "psd") {
            saveAs = {
                "obj": "photoshop35Format",
                "value": {}
            };
            return {
                command: "save",
                descriptor: {
                    "as": saveAs,
                    "in": {
                        "path": path
                    }
                }
            };
        } else if (fileType === "jpg") {
            saveAs = {
                "obj": "JPEG",
                "value": {
                    "extendedQuality": jpgQuality,
                    "matteColor": {
                        "enum": "matteColor",
                        "value": "none"
                    }
                }
            };
            return {
                command: "save",
                descriptor: {
                    "as": saveAs,
                    "in": {
                        "path": path
                    }
                }
            };
        } else if (fileType === "gif") {
            return {
                command: "export",
                descriptor: {
                    "using": {
                        "obj": "SaveForWeb",
                        "value": {
                            "$AuRd": false,
                            "$DCUI": 0,
                            "$DChS": 0,
                            "$DChT": false,
                            "$DChV": false,
                            "$DIDr": true,
                            "$LCUI": 100,
                            "$LChS": 0,
                            "$LChT": false,
                            "$LChV": false,
                            "$Loss": 0,
                            "$Mtt": true,
                            "$MttB": 255,
                            "$MttG": 255,
                            "$MttR": 255,
                            "$NCol": 128,
                            "$Op": {
                                "enum": "$SWOp",
                                "value": "$OpSa"
                            },
                            "$RChT": false,
                            "$RChV": false,
                            "$RedA": {
                                "enum": "$IRRd",
                                "value": "$Sltv"
                            },
                            "$SHTM": false,
                            "$SImg": true,
                            "$SWch": {
                                "enum": "$STch",
                                "value": "$CHsR"
                            },
                            "$SWmd": {
                                "enum": "$STmd",
                                "value": "$MDCC"
                            },
                            "$SWsl": {
                                "enum": "$STsl",
                                "value": "$SLAl"
                            },
                            "$TDtA": 100,
                            "$TDth": {
                                "enum": "$IRDt",
                                "value": "none"
                            },
                            "$WebS": 0,
                            "$obCS": {
                                "enum": "$STcs",
                                "value": "$CS01"
                            },
                            "$obIA": false,
                            "$obIP": "",
                            "$ohAA": true,
                            "$ohAC": {
                                "enum": "$SToc",
                                "value": "$OC03"
                            },
                            "$ohCA": false,
                            "$ohEn": {
                                "enum": "$STen",
                                "value": "$EN00"
                            },
                            "$ohIC": true,
                            "$ohIZ": true,
                            "$ohIn": -1,
                            "$ohLE": {
                                "enum": "$STle",
                                "value": "$LE03"
                            },
                            "$ohQA": true,
                            "$ohTC": {
                                "enum": "$SToc",
                                "value": "$OC03"
                            },
                            "$ohXH": false,
                            "$olCS": false,
                            "$olEC": {
                                "enum": "$STst",
                                "value": "$ST00"
                            },
                            "$olNC": [
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC00"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC19"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC28"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                }
                            ],
                            "$olSH": {
                                "enum": "$STsp",
                                "value": "$SP04"
                            },
                            "$olSV": {
                                "enum": "$STsp",
                                "value": "$SP04"
                            },
                            "$olWH": {
                                "enum": "$STwh",
                                "value": "$WH01"
                            },
                            "$ovCB": true,
                            "$ovCM": false,
                            "$ovCU": true,
                            "$ovCW": false,
                            "$ovFN": fileName,
                            "$ovNC": [
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC01"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC20"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC02"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC19"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC06"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC22"
                                        }
                                    }
                                }
                            ],
                            "$ovSF": true,
                            "$ovSN": "images",
                            "dither": {
                                "enum": "$IRDt",
                                "value": "diffusion"
                            },
                            "ditherAmount": 88,
                            "format": {
                                "enum": "$IRFm",
                                "value": "$GIFf"
                            },
                            "in": {
                                "path": filePath
                            },
                            "interfaceIconFrameDimmed": false,
                            "transparency": true
                        }
                    }
                }
            };
        } else if (fileType === "png") {
            return {
                command: "export",
                descriptor: {
                    "using": {
                        "obj": "SaveForWeb",
                        "value": {
                            "$AuRd": false,
                            "$DCUI": 0,
                            "$DChS": 0,
                            "$DChT": false,
                            "$DChV": false,
                            "$DIDr": true,
                            "$EICC": false,
                            "$Mtt": true,
                            "$MttB": 255,
                            "$MttG": 255,
                            "$MttR": 255,
                            "$NCol": 128,
                            "$Op": {
                                "enum": "$SWOp",
                                "value": "$OpSa"
                            },
                            "$RChT": false,
                            "$RChV": false,
                            "$RedA": {
                                "enum": "$IRRd",
                                "value": "$Sltv"
                            },
                            "$SHTM": false,
                            "$SImg": true,
                            "$SWch": {
                                "enum": "$STch",
                                "value": "$CHsR"
                            },
                            "$SWmd": {
                                "enum": "$STmd",
                                "value": "$MDCC"
                            },
                            "$SWsl": {
                                "enum": "$STsl",
                                "value": "$SLAl"
                            },
                            "$TDtA": 100,
                            "$TDth": {
                                "enum": "$IRDt",
                                "value": "none"
                            },
                            "$WebS": 0,
                            "$obCS": {
                                "enum": "$STcs",
                                "value": "$CS01"
                            },
                            "$obIA": false,
                            "$obIP": "",
                            "$ohAA": true,
                            "$ohAC": {
                                "enum": "$SToc",
                                "value": "$OC03"
                            },
                            "$ohCA": false,
                            "$ohEn": {
                                "enum": "$STen",
                                "value": "$EN00"
                            },
                            "$ohIC": true,
                            "$ohIZ": true,
                            "$ohIn": -1,
                            "$ohLE": {
                                "enum": "$STle",
                                "value": "$LE03"
                            },
                            "$ohQA": true,
                            "$ohTC": {
                                "enum": "$SToc",
                                "value": "$OC03"
                            },
                            "$ohXH": false,
                            "$olCS": false,
                            "$olEC": {
                                "enum": "$STst",
                                "value": "$ST00"
                            },
                            "$olNC": [
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC00"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC19"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC28"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                }
                            ],
                            "$olSH": {
                                "enum": "$STsp",
                                "value": "$SP04"
                            },
                            "$olSV": {
                                "enum": "$STsp",
                                "value": "$SP04"
                            },
                            "$olWH": {
                                "enum": "$STwh",
                                "value": "$WH01"
                            },
                            "$ovCB": true,
                            "$ovCM": false,
                            "$ovCU": true,
                            "$ovCW": false,
                            "$ovFN": fileName,
                            "$ovNC": [
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC01"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC20"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC02"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC19"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC06"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC24"
                                        }
                                    }
                                },
                                {
                                    "obj": "$SCnc",
                                    "value": {
                                        "$ncTp": {
                                            "enum": "$STnc",
                                            "value": "$NC22"
                                        }
                                    }
                                }
                            ],
                            "$ovSF": true,
                            "$ovSN": "images",
                            "dither": {
                                "enum": "$IRDt",
                                "value": "diffusion"
                            },
                            "ditherAmount": 88,
                            "format": {
                                "enum": "$IRFm",
                                "value": "$PNG8"
                            },
                            "in": {
                                "path": filePath
                            },
                            "interfaceIconFrameDimmed": false,
                            "transparency": true
                        }
                    }
                }
            };
        }
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
