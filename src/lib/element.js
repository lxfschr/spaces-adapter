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
    
    var PlayObject = require("../playObject"),
        referenceLib = require("./reference"),
        referenceBy = referenceLib.wrapper("element");

    var assert = require("../util").assert,
        referenceOf = require("./reference").refersTo;
        
    /**
     * Possible element kind values from AGFDisplayListNodeType
     * @const
     */
    var elementKinds = Object.defineProperties({}, {
        ROOT: {
            writeable: false,
            enumerable: true,
            value: 0
        },
        TRANSFORM: {
            writeable: false,
            enumerable: true,
            value: 1
        },
        GROUP: {
            writeable: false,
            enumerable: true,
            value: 2
        },
        GEOMETRY: {
            writeable: false,
            enumerable: true,
            value: 3
        },
        LIGHT: {
            writeable: false,
            enumerable: true,
            value: 4
        },
        CAMERA: {
            writeable: false,
            enumerable: true,
            value: 5
        },
        CAMERATARGET: {
            writeable: false,
            enumerable: true,
            value: 6
        },
        LIGHTTARGET: {
            writeable: false,
            enumerable: true,
            value: 7
        },
        SWITCH: {
            writeable: false,
            enumerable: true,
            value: 8
        },
        LOD: {
            writeable: false,
            enumerable: true,
            value: 9
        },
        VISIBILITY: {
            writeable: false,
            enumerable: true,
            value: 10
        },
        RENDERSTATE: {
            writeable: false,
            enumerable: true,
            value: 11
        },
        MATERIAL: {
            writeable: false,
            enumerable: true,
            value: 12
        },
        GROUPEND: {
            writeable: false,
            enumerable: true,
            value: 13
        },
        SCENEEND: {
            writeable: false,
            enumerable: true,
            value: 14
        },
        MAP: {
            writeable: false,
            enumerable: true,
            value: 15
        }

    });

    /**
     * Possible light types from AGFLight
     * @const
     */
    var lightTypes = Object.defineProperties({}, {
        SPOT: {
            writeable: false,
            enumerable: true,
            value: 1
        },
        POINT: {
            writeable: false,
            enumerable: true,
            value: 2
        },
        INFINITE: {
            writeable: false,
            enumerable: true,
            value: 3
        },
        GLOBALAMBIENT: {
            writeable: false,
            enumerable: true,
            value: 4
        },
        IMAGEBASED: {
            writeable: false,
            enumerable: true,
            value: 5
        },
        INVALID: {
            writeable: false,
            enumerable: true,
            value: 6
        }
    });

    /**
     * Possible light types from AGFMESH
     * @const
     */
    var meshTypes = Object.defineProperties({}, {
        POLYGONS: {
            writeable: false,
            enumerable: true,
            value: 0
        },
        REPOUSSE: {
            writeable: false,
            enumerable: true,
            value: 1
        },
        DEPTH: {
            writeable: false,
            enumerable: true,
            value: 2
        },
        GROUNDPLANE: {
            writeable: false,
            enumerable: true,
            value: 3
        },
        ALL: {
            writeable: false,
            enumerable: true,
            value: 4
        },
        TEXT: {
            writeable: false,
            enumerable: true,
            value: 5
        }
    });

    /**
     * Possible group types from TSceneGroupNode->isSkeleton()
     * @const
     */
    var groupTypes = Object.defineProperties({}, {
        MESHFOLDER: {
            writeable: false,
            enumerable: true,
            value: 0
        },
        SKELETON: {
            writeable: false,
            enumerable: true,
            value: 1
        }
    });

    var mapTypeToString = function(type) {
        if(type === this.materialMapTypes.DIFFUSE) {
            return "diffuse";
        } else if(type === this.materialMapTypes.SPHEREENVIRONMENT) {
            return "sphere environment";
        } else if(type === this.materialMapTypes.BUMP) {
            return "bump";
        } else if(type === this.materialMapTypes.SPECULARCOLOR) {
            return "specular color";
        } else if(type === this.materialMapTypes.OPACITY) {
            return "opacity";
        } else if(type === this.materialMapTypes.SPECULAREXPONENT) {
            return "specular exponent";
        } else if(type === this.materialMapTypes.SELFILLUMINATION) {
            return "self illumination";
        } else if(type === this.materialMapTypes.REFLECTIVITY) {
            return "reflectivity";
        } else if(type === this.materialMapTypes.NORMAL) {
            return "normal";
        } else if(type === this.materialMapTypes.IMAGEDBASEDLIGHTING) {
            return "imaged based lighting";
        } else if(type === this.materialMapTypes.ROUGHNESS) {
            return "roughness";
        } else if(type === this.materialMapTypes.DEPTH) {
            return "depth";
        } else if(type === this.materialMapTypes.LIGHT) {
            return "light";
        } else {
            return "unknown";
        }
    }

    /**
     * Possible light types from AGFMESH
     * @const
     */
    var materialMapTypes = Object.defineProperties({}, {
        DIFFUSE: {
            writeable: false,
            enumerable: true,
            value: 0
        },
        SPHEREENVIRONMENT: {
            writeable: false,
            enumerable: true,
            value: 1
        },
        BUMP: {
            writeable: false,
            enumerable: true,
            value: 2
        },
        SPECULARCOLOR: {
            writeable: false,
            enumerable: true,
            value: 3
        },
        OPACITY: {
            writeable: false,
            enumerable: true,
            value: 4
        },
        SPECULAREXPONENT: {
            writeable: false,
            enumerable: true,
            value: 5
        },
        SELFILLUMINATION: {
            writeable: false,
            enumerable: true,
            value: 6
        },
        REFLECTIVITY: {
            writeable: false,
            enumerable: true,
            value: 7
        },
        NORMAL: {
            writeable: false,
            enumerable: true,
            value: 8
        },
        IMAGEDBASEDLIGHTING: {
            writeable: false,
            enumerable: true,
            value: 9
        },
        ROUGHNESS: {
            writeable: false,
            enumerable: true,
            value: 10
        },
        DEPTH: {
            writeable: false,
            enumerable: true,
            value: 11
        },
        LIGHT: {
            writeable: false,
            enumerable: true,
            value: 12
        },
        UNKNOWN3: {
            writeable: false,
            enumerable: true,
            value: 13
        },
        UNKNOWN4: {
            writeable: false,
            enumerable: true,
            value: 14
        },
        UNKNOWN5: {
            writeable: false,
            enumerable: true,
            value: 15
        },
        UNKNOWN6: {
            writeable: false,
            enumerable: true,
            value: 16
        },
        UNKNOWN7: {
            writeable: false,
            enumerable: true,
            value: 17
        },
        UNKNOWN8: {
            writeable: false,
            enumerable: true,
            value: 18
        },
        UNKNOWN9: {
            writeable: false,
            enumerable: true,
            value: 19
        },
        UNKNOWN10: {
            writeable: false,
            enumerable: true,
            value: 20
        },
        UNKNOWN11: {
            writeable: false,
            enumerable: true,
            value: 21
        },
        UNKNOWN12: {
            writeable: false,
            enumerable: true,
            value: 22
        },
        UNKNOWN13: {
            writeable: false,
            enumerable: true,
            value: 23
        },
        UNKNOWN14: {
            writeable: false,
            enumerable: true,
            value: 24
        },
        UNKNOWN15: {
            writeable: false,
            enumerable: true,
            value: 25
        },
        UNKNOWN16: {
            writeable: false,
            enumerable: true,
            value: 26
        },
        UNKNOWN17: {
            writeable: false,
            enumerable: true,
            value: 27
        },
        UNKNOWN18: {
            writeable: false,
            enumerable: true,
            value: 28
        },
        UNKNOWN19: {
            writeable: false,
            enumerable: true,
            value: 29
        },
        UNKNOWN20: {
            writeable: false,
            enumerable: true,
            value: 30
        },
        UNKNOWN21: {
            writeable: false,
            enumerable: true,
            value: 31
        }
    });

    /**
     * Set the border radius of a rectangle layer.
     *
     * @param {number} topLeft
     * @param {?number} topRight
     * @param {?number} bottomRight
     * @param {?number} bottomLeft
     * @return {PlayObject}
     */
    var setMaterialProperty = function (property, value) {
        return new PlayObject(property, {
            "value": value
        });
    };

    /**
     * @param {ActionDescriptor} ref - Reference of element(s) to select
     * @param {bool} makeVisible - Flag to hide/show the element
     * @param {string} modifier - Whether to select, add to selection, remove, or add upto
     * 
     * @returns {PlayObject}
     */
    var select = function (selectedNames, makeVisible, modifier) {
        return new PlayObject(
            "key3DObjectSelect",
            {
                "key3DNameList": selectedNames
            }
        );
    };

    /**
     * @param {ActionDescriptor} ref - Reference of element to rename
     * @param {string} name - What to rename the element to
     *
     * @returns {PlayObject}
     */
    var renameElement = function (ref, name) {
        assert(referenceOf(ref) === "element", "renameElement is passed a non-element reference");
        return new PlayObject(
            "set",
            {
                "null": ref,
                "to": {
                    "_obj": "element",
                    "_value": {
                        "name": name
                    }
                }
            }
        );
    };

    exports.referenceBy = referenceBy;
    exports.elementKinds = elementKinds;
    exports.lightTypes = lightTypes;
    exports.meshTypes = meshTypes;
    exports.groupTypes = groupTypes;
    exports.materialMapTypes = materialMapTypes;
    exports.mapTypeToString = mapTypeToString;
    exports.select = select;
    exports.rename = renameElement;
    exports.setMaterialProperty = setMaterialProperty;
});
