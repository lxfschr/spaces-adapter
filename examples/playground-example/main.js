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

/* global require, console */

require.config({
    baseUrl: "../../",
    packages : [{ name: "adapter", location: "src" }],
    paths: {
        "bluebird" : "bower_components/bluebird/js/browser/bluebird",
        "eventEmitter": "bower_components/eventEmitter/EventEmitter"
    }
});

define(function (require) {
    "use strict";

    var adapter = require("adapter"),
        descriptor = require("adapter/ps/descriptor"),
        os = require("adapter/os"),
        layerManager = require("adapter/lib/layers");

    var _setup = function () {
        console.log("Version: " + adapter.version);
        
        // set up new layer button handler
        var buttonNewLayer = document.getElementsByClassName("button-new-layer")[0];
        if (buttonNewLayer) {
            buttonNewLayer.onclick = function () {
                layerManager.createNewLayer();
            };
        }

        var buttonDupeLayer = document.getElementsByClassName("button-dupe-layer")[0];
        var newLayerNameField = document.getElementsByName("new-layer-name")[0];
        if (buttonDupeLayer) {
            buttonDupeLayer.onclick = function () {
                var newLayerName = null;
                if (newLayerNameField.value !== "") {
                    newLayerName = newLayerNameField.value;
                }
                layerManager.duplicateLayer(null, newLayerName);
            };
        }

        var textOutput = document.getElementsByName("get-output")[0];

        var buttonAdapterGet = document.getElementsByClassName("button-adapter-get")[0];
        var textGetInput = document.getElementsByName("get-input")[0];
        if (buttonAdapterGet) {
            buttonAdapterGet.onclick = function () {
                var getInput = "$Dcmn";
                if (textGetInput.value !== "") {
                    getInput = textGetInput.value;
                }
                descriptor.get(getInput).done(function (value) {
                    textOutput.value = JSON.stringify(value, null, "  ");
                });
            };
        }

        var textGetPropertyInput = document.getElementsByName("get-property-input")[0];
        var textGetPropertyRef = document.getElementsByName("get-property-ref")[0];
        var buttonGetProperty = document.getElementsByClassName("button-adapter-get-property")[0];
        if (buttonGetProperty) {
            buttonGetProperty.onclick = function () {
                var getPropertyRef = "document";
                if (textGetPropertyRef.value !== "") {
                    getPropertyRef = textGetPropertyRef.value;
                }
                var getPropertyInput = "numberOfLayers";
                if (textGetPropertyInput.value !== "") {
                    getPropertyInput = textGetPropertyInput.value;
                }
                descriptor.getProperty(getPropertyRef, getPropertyInput).done(function (value) {
                    textOutput.value = JSON.stringify(value, null, "  ");
                });
            };
        }


        // register for selection changed events to update layer display
        layerManager.on("selectionChanged", function (selection) {
            var layerNameText = document.getElementsByClassName("layer-name-text")[0];
            if (layerNameText) {
                layerNameText.innerText = selection.join();
            }
        });

        var inputs = document.body.querySelectorAll("input"),
            textareas = document.body.querySelectorAll("textarea");

        inputs = Array.prototype.slice.call(inputs);
        textareas = Array.prototype.slice.call(textareas);

        inputs = inputs.concat(textareas);
        inputs.forEach(function (input) {
            input.addEventListener("mousedown", function () {
                os.acquireKeyboardFocus().catch(function (err) {
                    console.error("Failed to acquire keyboard focus", err);
                });
            });
        });

    };

    if (document.readyState === "complete") {
        _setup();
    } else {
        window.addEventListener("load", _setup);
    }

});
