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

    var PlayObject = require("../playobject"),
        appReference = require("./reference").wrapper("application"),
        layerLib = require("./layer");

    /**
     * Sends a notification to Photoshop with the created element path
     *
     * @param {number} documentID Owner document ID
     * @param {Array.<number>} layerIDs Affected layer IDs
     * @param {AdobeLibraryElement} element Created element object
     * @param {string} path Location of the file in local storage cache
     *
     * @return {PlayObject}
     */
    var createElement = function (documentID, layerIDs, element, path) {
        var eventData = JSON.stringify({
            "elementRef": element.getReference(),
            "name": element.name,
            "libraryName": element.library.name,
            "modifiedTime": element.modified,
            "creationTime": element.created,
            "data": [path],
            "documentId": documentID,
            "layerIds": layerIDs
        });

        return new PlayObject(
            "spacesLibraryElementCreated",
            {
                "null": appReference.current,
                "json": eventData
            }
        );
    };

    /**
     * Sends a notification to Photoshop with the chosen element path
     *
     * @param {number} requestRef Reference to initial request sent
     *                            by Photoshop for relinking
     * @param {AdobeLibraryElement} element Chosen element object
     * @param {string} path Location of the file in local storage cache
     * @param {{id: number, license: boolean}} stockData License information on Adobe Stock images
     *
     * @return {PlayObject}
     */
    var chooseElement = function (requestRef, element, path, stockData) {
        var eventData = JSON.stringify({
            "requestRef": requestRef,
            "elementRef": element.getReference(),
            "name": element.name,
            "libraryName": element.library.name,
            "modifiedTime": element.modified,
            "creationTime": element.created,
            "data": [path]
        });

        if (stockData) {
            eventData.adobeStock = stockData;
        }

        return new PlayObject(
            "spacesLibraryElementChosen",
            {
                "null": appReference.current,
                "json": eventData
            }
        );
    };

    /**
     * Sends a notification to Photoshop with the licensed element path
     *
     * @param {AdobeLibraryElement} element Licensed element object
     * @param {string} path Location of the file in local storage cache
     * @param {{id: number, license: boolean}} stockData License information on Adobe Stock images
     *
     * @return {PlayObject}
     */
    var licenseElement = function (element, path, stockData) {
        var eventData = JSON.stringify({
            "elementRef": element.getReference(),
            "name": element.name,
            "libraryName": element.library.name,
            "modifiedTime": element.modified,
            "creationTime": element.created,
            "data": [path],
            "adobeStock": stockData
        });

        return new PlayObject(
            "spacesLibraryElementLicensed",
            {
                "null": appReference.current,
                "json": eventData
            }
        );
    };

    /**
     * Sends a place command to Photoshop for the given library asset
     *
     * @param {ActionDescriptor} docRef Reference to document to place in
     * @param {AdobeLibraryElement} element
     * @param {string} path File location of the asset in local storage service
     * @param {{x: number, y: number}} location Place in document coordinates to place the asset
     *
     * @return {PlayObject}
     */
    var placeElement = function (docRef, element, path, location) {
        var eventData = JSON.stringify({
            "source": "com.adobe.designlibrary",
            "version": "2.0.20",
            "assetList": [{
                "name": element.name,
                "libraryName": element.library.name,
                "type": "image",
                "elementRef": element.getReference(),
                "modifiedTime": element.modified,
                "creationTime": element.created,
                "data": [path]
            }]
        });

        return new PlayObject(
            "spacesLibraryPlaceElement",
            {
                "null": docRef,
                "json": eventData,
                "location": {
                    "_obj": "paint",
                    "horizontal": location.x,
                    "vertical": location.y
                }
            });
    };

    /**
     * Sends an export command to Photoshop to save the selected layers
     * in a new file
     *
     * @param {string} path Location to save the file into
     * @param {string} previewPath Location to save the preview of the file
     * @param {string} name File name
     * @param {{w: number, h: number}} previewSize Object describing preview size
     *
     * @return {PlayObject}
     */
    var exportLayer = function (path, previewPath, name, previewSize) {
        return new PlayObject(
            "export",
            {
                "null": layerLib.referenceBy.current,
                "using": {
                    "_class": "saveForCCLibrariesElement"
                },
                "representation": {
                    "in": {
                        "_path": path
                    },
                    "name": name
                },
                "externalPreviewParams": {
                    "in": {
                        "_path": previewPath
                    },
                    "pixelWidth": previewSize.w,
                    "pixelHeight": previewSize.h
                }
            });
    };

    exports.createElement = createElement;
    exports.chooseElement = chooseElement;
    exports.licenseElement = licenseElement;
    exports.exportLayer = exportLayer;
    exports.placeElement = placeElement;
});
