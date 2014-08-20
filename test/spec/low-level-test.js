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

/*jslint devel: true*/
/* global module, test, asyncTest, ok, _playground, expect, start, equal */

define(function () {
    "use strict";

    module("low-level");

    // VALIDATION HELPERS
    // ------------------

    /**
     * Validates that the returned result-value is a success code
     * 
     * @private
     * @param {Error=} err
     */
    var _validateNotifierResult = function (err) {
        // Acceptable success codes are: undefined, or an object with a
        // number property that has the value 0
        var testPasses = (err === undefined);
        if (!testPasses && err !== null) {
            testPasses = (err.number !== undefined && err.number === 0);
        }

        ok(testPasses, "result is success");

        if (!testPasses) {
            console.log("validateNotifierResult failed for err:");
            console.log(err);
        }
    };

    /** 
     * Validates that the returned result-value is an error object containing
     * number and message properties. Other properties are possible too.
     * 
     * @private
     * @param {Error=} err
     * @param {number=} expectedError
     */
    var _validateNotifierResultError = function (err, expectedError) {

        var testPasses = false;
        do {
            if (err === undefined) {
                break;
            }

            // FIXME: restore this check once we always return Error objects
            // if (!(err instanceof Error)) {
            //     break;
            // }
            if (err.number === undefined) {
                break;
            }
            if (err.message === undefined) {
                break;
            }

            testPasses = true;
        } while (false);

        if (!testPasses) {
            console.log("Invalid form of an error resultValue:");
            console.log(err);
        } else {
            // test the returned error code
            // REVISIT: Replace the hard coded number with an enumeration
            // when that becomes available
            testPasses = (err.number === expectedError);

            if (!testPasses) {
                console.log("resultValue did not have the expected error code:" +
                    expectedError + " Actual error is: " + err.number);
            }
        }
        ok(testPasses, "error resultValue validation");
    };

    // TESTS  
    // -----

    test("_playground object exists", function () {
        expect(1);
        ok(!!_playground, "_playground object exists");
    });

    test("_playground.errorCodes constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING errorCode PROPERTIES!
        var expectedSize = 7;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.errorCodes).length;
        try {
            ok(typeof _playground.errorCodes === "object", "_playground.errorCodes is defined");
            equal(actualSize, expectedSize, "_playground.errorCodes size");
            // constants
            ok(typeof _playground.errorCodes.NO_ERROR === "number",
               "_playground.errorCodes.NO_ERROR");
            ok(typeof _playground.errorCodes.UNKNOWN_ERROR === "number",
               "_playground.errorCodes.UNKNOWN_ERROR");
            ok(typeof _playground.errorCodes.CANT_DISPATCH_MESSAGE_TO_HOST === "number",
               "_playground.errorCodes.CANT_DISPATCH_MESSAGE_TO_HOST");
            ok(typeof _playground.errorCodes.ARGUMENT_ERROR === "number",
               "_playground.errorCodes.ARGUMENT_ERROR");
            ok(typeof _playground.errorCodes.MISSING_NOTIFIER === "number",
               "_playground.errorCodes.MISSING_NOTIFIER");
            ok(typeof _playground.errorCodes.CONVERSION_ERROR === "number",
               "_playground.errorCodes.CONVERSION_ERROR");
            ok(typeof _playground.errorCodes.REENTRANCY_ERROR === "number",
               "_playground.errorCodes.REENTRANCY_ERROR");
        } catch (err) {
            console.error("_playground.errorCodes constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.ps property exists", function () {
        expect(1);
        ok(!!_playground.ps, "_playground.ps property exists");
    });

    test("_playground.ps.descriptor property exists", function () {
        expect(1);
        ok(!!_playground.ps.descriptor, "_playground.ps.descriptor property exists");
    });

    test("_playground.ps.descriptor.interactionMode constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING interactionMode PROPERTIES!
        var expectedSize = 3;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.ps.descriptor.interactionMode).length;
        try {
            ok(typeof _playground.ps.descriptor.interactionMode === "object",
               "_playground.ps.descriptor.interactionMode is defined");
            equal(actualSize, expectedSize, "_playground.ps.descriptor.interactionMode size");
            // constants
            ok(typeof _playground.ps.descriptor.interactionMode.DONT_DISPLAY === "number",
               "_playground.ps.descriptor.interactionMode.DONT_DISPLAY");
            ok(typeof _playground.ps.descriptor.interactionMode.DISPLAY === "number",
               "_playground.ps.descriptor.interactionMode.DISPLAY");
            ok(typeof _playground.ps.descriptor.interactionMode.SILENT === "number",
               "_playground.ps.descriptor.interactionMode.SILENT");
        } catch (err) {
            console.error("_playground.ps.descriptor.interactionMode constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.ps.ui property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui, "_playground.ps.ui property exists");
    });

    test("_playground.ps.ui.widgetTypes constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING widgetTypes PROPERTIES!
        var expectedSize = 7;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.widgetTypes).length;
        try {
            ok(typeof _playground.ps.ui.widgetTypes === "object",
               "_playground.ps.ui.widgetTypes is defined");
            equal(actualSize, expectedSize, "_playground.ps.ui.widgetTypes size");
            // constants
            ok(typeof _playground.ps.ui.widgetTypes.TOOLBAR === "number",
               "_playground.ps.ui.widgetTypes.TOOLBAR");
            ok(typeof _playground.ps.ui.widgetTypes.CONTROLBAR === "number",
               "_playground.ps.ui.widgetTypes.CONTROLBAR");
            ok(typeof _playground.ps.ui.widgetTypes.PALETTE === "number",
               "_playground.ps.ui.widgetTypes.PALETTE");
            ok(typeof _playground.ps.ui.widgetTypes.DOCUMENT === "number",
               "_playground.ps.ui.widgetTypes.DOCUMENT");
            ok(typeof _playground.ps.ui.widgetTypes.APPLICATIONBAR === "number",
               "_playground.ps.ui.widgetTypes.APPLICATIONBAR");
            ok(typeof _playground.ps.ui.widgetTypes.DOCUMENT_TABS === "number",
               "_playground.ps.ui.widgetTypes.DOCUMENT_TABS");
            ok(typeof _playground.ps.ui.widgetTypes.ALL === "number",
               "_playground.ps.ui.widgetTypes.ALL");
        } catch (err) {
            console.error("_playground.ps.ui.widgetTypes constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.ps.ui.pointerPropagationMode constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING pointerPropagationMode PROPERTIES!
        var expectedSize = 3;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.pointerPropagationMode).length;
        try {
            ok(typeof _playground.ps.ui.pointerPropagationMode === "object",
               "_playground.ps.ui.pointerPropagationMode is defined");
            equal(actualSize, expectedSize, "_playground.ps.ui.pointerPropagationMode size");
            // constants
            ok(typeof _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE === "number",
               "_playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE");
            ok(typeof _playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE === "number",
               "_playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE");
            ok(typeof _playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE === "number",
               "_playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE");
        } catch (err) {
            console.error("_playground.ps.ui.pointerPropagationMode constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    if (navigator.platform === "MacIntel") {
        test("_playground.ps.ui.PolicyAction constants object", function () {
            // CHANGE THIS VALUE WHEN ADDING OR REMOVING PolicyAction PROPERTIES!
            var expectedSize = 3;
            expect(2 + expectedSize); // 2 + # of constants

            var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.PolicyAction).length;
            try {
                ok(typeof _playground.ps.ui.PolicyAction === "object",
                   "_playground.ps.ui.PolicyAction is defined");
                equal(actualSize, expectedSize, "_playground.ps.ui.PolicyAction size");
                // constants
                ok(typeof _playground.ps.ui.PolicyAction.ALPHA_PROPAGATE === "number",
                   "_playground.ps.ui.PolicyAction.ALPHA_PROPAGATE");
                ok(typeof _playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE === "number",
                   "_playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE");
                ok(typeof _playground.ps.ui.PolicyAction.NEVER_PROPAGATE === "number",
                   "_playground.ps.ui.PolicyAction.NEVER_PROPAGATE");
            } catch (err) {
                console.error("_playground.ps.ui.PolicyAction constants object test, unexpected exception: ",
                              typeof err);
            }
        });
    }

    test("_playground.ps.ui.keyboardPropagationMode constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING keyboardPropagationMode PROPERTIES!
        var expectedSize = 2;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.keyboardPropagationMode).length;
        try {
            ok(typeof _playground.ps.ui.keyboardPropagationMode === "object",
               "_playground.ps.ui.keyboardPropagationMode is defined");
            equal(actualSize, expectedSize, "_playground.ps.ui.keyboardPropagationMode size");
            // constants
            ok(typeof _playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE === "number",
               "_playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE");
            ok(typeof _playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE === "number",
               "_playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE");
        } catch (err) {
            console.error("_playground.ps.ui.keyboardPropagationMode constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.ps.ui.overscrollMode constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 3;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.overscrollMode).length;
        try {
            ok(typeof _playground.ps.ui.overscrollMode === "object",
               "_playground.ps.ui.overscrollMode is defined");
            equal(actualSize, expectedSize, "_playground.ps.ui.overscrollMode size");
            // constants
            ok(typeof _playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL === "number",
               "_playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL");
            ok(typeof _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL === "number",
               "_playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL");
            ok(typeof _playground.ps.ui.overscrollMode.NEVER_OVERSCROLL === "number",
               "_playground.ps.ui.overscrollMode.NEVER_OVERSCROLL");
        } catch (err) {
            console.error("_playground.ps.ui.overscrollMode constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    // _playground.os
    test("_playground.os property exists", function () {
        expect(1);
        ok(!!_playground.ps, "_playground.os property exists");
    });

    test("_playground.os.eventKind constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 3;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.os.eventKind).length;
        try {
            ok(typeof _playground.os.eventKind === "object",
               "_playground.os.eventKind is defined");
            equal(actualSize, expectedSize, "_playground.os.eventKind size");
            // constants
            ok(typeof _playground.os.eventKind.LEFT_MOUSE_DOWN === "number",
               "_playground.os.eventKind.LEFT_MOUSE_DOWN");
            ok(typeof _playground.os.eventKind.KEY_DOWN === "number",
               "_playground.os.eventKind.KEY_DOWN");
            ok(typeof _playground.os.eventKind.KEY_UP === "number",
               "_playground.os.eventKind.KEY_UP");
        } catch (err) {
            console.error("_playground.os.eventKind constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.os.eventModifiers constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 5;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.os.eventModifiers).length;
        try {
            ok(typeof _playground.os.eventModifiers === "object",
               "_playground.os.eventModifiers is defined");
            equal(actualSize, expectedSize, "_playground.os.eventModifiers size");
            // constants
            ok(typeof _playground.os.eventModifiers.NONE === "number",
               "_playground.os.eventModifiers.NONE");
            ok(typeof _playground.os.eventModifiers.SHIFT === "number",
               "_playground.os.eventModifiers.SHIFT");
            ok(typeof _playground.os.eventModifiers.CONTROL === "number",
               "_playground.os.eventModifiers.CONTROL");
            ok(typeof _playground.os.eventModifiers.ALT === "number",
               "_playground.os.eventModifiers.ALT");
            ok(typeof _playground.os.eventModifiers.COMMAND === "number",
               "_playground.os.eventModifiers.COMMAND");
        } catch (err) {
            console.error("_playground.os.eventModifiers constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground.os.eventTypes constants object", function () {
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING eventTypes PROPERTIES!
        var expectedSize = 5;
        expect(2 + expectedSize); // 2 + # of constants

        var actualSize = Object.getOwnPropertyNames(_playground.os.eventTypes).length;
        try {
            ok(typeof _playground.os.eventTypes === "object",
               "_playground.os.eventTypes is defined");
            equal(actualSize, expectedSize, "_playground.os.eventTypes size");
            // constants
            ok(typeof _playground.os.eventTypes.MOUSE_CAPTURE_LOST === "string",
               "_playground.os.eventTypes.MOUSE_CAPTURE_LOST");
            ok(typeof _playground.os.eventTypes.ACTIVATION_CHANGED === "string",
               "_playground.os.eventTypes.ACTIVATION_CHANGED");
            ok(typeof _playground.os.eventTypes.KEYBOARDFOCUS_CHANGED === "string",
               "_playground.os.eventTypes.KEYBOARDFOCUS_CHANGED");
            ok(typeof _playground.os.eventTypes.EXTERNAL_MOUSE_DOWN === "string",
               "_playground.os.eventTypes.EXTERNAL_MOUSE_DOWN");
            ok(typeof _playground.os.eventTypes.TOUCH === "string",
               "_playground.os.eventTypes.TOUCH");
        } catch (err) {
            console.error("_playground.os.eventTypes constants object test, unexpected exception: ",
                          typeof err);
        }
    });

    test("_playground._debug property exists", function () {
        expect(1);
        ok(!!_playground._debug, "_playground.debug property exists");
    });

    // Basic test for obtaining a value with no arguments
    asyncTest("_playground.ps.ui.getScaleFactor property", function () {
        expect(2);

        _playground.ps.ui.getScaleFactor(function (err, scaleFactor) {
            _validateNotifierResult(err);

            var scaleFactorValidation = (scaleFactor === 1 || scaleFactor === 2);
            ok(scaleFactorValidation, "scale factor validation");

            if (!scaleFactorValidation) {
                console.log("scale factor not the expected value. returned value is: " + scaleFactor);
            }

            start();
        });
    });

    // Negative test: Invoke a host method without providing a notifier
    test("_playground.ps.ui.getScaleFactor property (negative)", function () {
        expect(1);

        var result;
        try {
            _playground.ps.ui.getScaleFactor("some value");
        } catch (err) {
            result = err;
        }

        ok(result !== undefined, "missing notifier exception");
    });

    // Negative test. Invoke a host method with an incorrect number/typs of arguments
    asyncTest("_playground._debug.forcePlayArgumentFailure", function () {
        expect(1);

        _playground._debug.forcePlayArgumentFailure(function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);

            start();
        });
    });

    // _playground.ps.ui.setPointerPropagationMode
    test("_playground.ps.ui.setPointerPropagationMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setPointerPropagationMode,
            "_playground.ps.ui.setPointerPropagationMode property exists");
    });

    // _playground.ps.ui.getPointerPropagationMode
    test("_playground.ps.ui.getPointerPropagationMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.getPointerPropagationMode,
            "_playground.ps.ui.getPointerPropagationMode property exists");
    });

    asyncTest("_playground.ps.ui.getPointerPropagationMode property", function () {
        expect(2);

        _playground.ps.ui.getPointerPropagationMode(function (err, mode) {
            _validateNotifierResult(err);

            var modeValidation = (mode === _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE ||
                mode === _playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE ||
                mode === _playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE);

            ok(modeValidation, "mode factor validation");
            if (!modeValidation) {
                console.log("mode not the expected value. returned value is: " + mode);
            }

            start();
        });
    });

    asyncTest("_playground.ps.ui.setPointerPropagationMode property", function () {
        expect(1);

        var options = {
            defaultMode: _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE
        };

        _playground.ps.ui.setPointerPropagationMode(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    // _playground.ps.ui.setOverscrollMode
    test("_playground.ps.ui.setOverscrollMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setOverscrollMode,
            "_playground.ps.ui.setOverscrollMode property exists");
    });

    // _playground.ps.ui.getOverscrollMode
    test("_playground.ps.ui.getOverscrollMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.getOverscrollMode,
            "_playground.ps.ui.getOverscrollMode property exists");
    });

    asyncTest("_playground.ps.ui.getOverscrollMode property", function () {
        expect(2);

        _playground.ps.ui.getOverscrollMode(function (err, mode) {
            _validateNotifierResult(err);

            var modeValidation = (mode === _playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL ||
                mode === _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL ||
                mode === _playground.ps.ui.overscrollMode.NEVER_OVERSCROLL);

            ok(modeValidation, "mode factor validation");
            if (!modeValidation) {
                console.log("mode not the expected value. returned value is: " + mode);
            }

            start();
        });
    });

    asyncTest("_playground.ps.ui.setOverscrollMode property", function () {
        expect(1);

        var options = {
            mode: _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL
        };

        _playground.ps.ui.setOverscrollMode(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.get: success", function () {
        expect(5);

        var reference = {
            ref: [
                {
                    ref: "property",
                    property: "hostName"
                },
                {
                    ref: "application",
                    enum: "ordinal",
                    value: "targetEnum"
                }
            ]
        };

        _playground.ps.descriptor.get(reference, function (err, descriptor) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            
            equal(typeof descriptor, "object", "Result is a descriptor");
            ok(descriptor.hasOwnProperty("hostName"), "Descriptor has the hostName property");

            var expected = null;
            if (navigator.platform === "Win32") {
                expected = "Photoshop";
            } else {
                expected = "Adobe Photoshop CC";
            }
            var actual = descriptor.hostName;
            ok(actual.indexOf(expected) === 0, "descriptor hostName property");
            start();
        });
    });

    asyncTest("_playground.ps.descriptor.get: semantic failure", function () {
        expect(2);

        var reference = {
            "ref": "xxx-ref-does-not-exist-xxx",
            "enum": "$Ordn",
            "value": "$Trgt"
        };

        _playground.ps.descriptor.get(reference, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.UNKNOWN_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.get: argument failure", function () {
        expect(2);

        _playground.ps.descriptor.get("xxx-ref-does-not-exist-xxx", function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.play: success", function () {
        expect(4);

        _playground.ps.descriptor.play("jsonAction", {}, {}, function (err, descriptor) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            
            equal(typeof descriptor, "object", "Result is a descriptor");
            equal(Object.keys(descriptor), 0, "Result object is empty");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.play: argument failure", function () {
        expect(2);

        _playground.ps.descriptor.play("jsonAction", 123, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.play: argument conversion failure", function () {
        expect(2);

        _playground.ps.descriptor.play("jsonAction", { ref: NaN }, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.play: semantic failure", function () {
        expect(2);

        _playground.ps.descriptor.play("xxx-ref-does-not-exist-xxx", {}, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.UNKNOWN_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.batchPlay: success", function () {
        expect(13);

        var commands = [
            {
                name: "jsonAction",
                descriptor: {}
            },
            {
                name: "jsonAction",
                descriptor: {}
            },
            {
                name: "jsonAction",
                descriptor: {}
            }
        ];

        _playground.ps.descriptor.batchPlay(commands, {}, {}, function (err, descriptors, errors) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            
            equal(descriptors.length, 3, "Received three possible results");
            equal(errors.length, 3, "Received three possible errors");

            equal(typeof descriptors[0], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[0]), 0, "Result object is empty");
            _validateNotifierResult(errors[0]);

            equal(typeof descriptors[1], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[1]), 0, "Result object is empty");
            _validateNotifierResult(errors[1]);

            equal(typeof descriptors[2], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[2]), 0, "Result object is empty");
            _validateNotifierResult(errors[2]);

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.batchPlay: partial semantic failure", function () {
        expect(9);

        var commands = [
            {
                name: "jsonAction",
                descriptor: {}
            },
            {
                name: "xxx-no-such-descriptor-xxx",
                descriptor: {}
            },
            {
                name: "jsonAction",
                descriptor: {}
            }
        ];

        _playground.ps.descriptor.batchPlay(commands, {}, {}, function (err, descriptors, errors) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            
            equal(descriptors.length, 2, "Received three possible results");
            equal(errors.length, 2, "Received three possible errors");

            equal(typeof descriptors[0], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[0]), 0, "Result object is empty");
            ok(!errors[0], "Error is falsy");
            
            ok(!descriptors[1], "Result is falsy");
            _validateNotifierResultError(errors[1], _playground.errorCodes.UNKNOWN_ERROR);

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.batchPlay: partial argument failure", function () {
        expect(3);

        var commands = [
            {
                name: "jsonAction",
                descriptor: {}
            },
            {
                "xxx-bad-property-name-xxx": "jsonAction",
                descriptor: {}
            },
            {
                name: "jsonAction",
                descriptor: {}
            }
        ];

        _playground.ps.descriptor.batchPlay(commands, {}, {}, function (err, descriptors, errors) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            ok(descriptors === undefined, "Call failed");
            ok(errors === undefined, "Call failed");

            start();
        });
    });

    asyncTest("_playground.ps.descriptor.batchPlay with continueOnError: partial semantic failure", function () {
        expect(12);

        var commands = [
            {
                name: "jsonAction",
                descriptor: {}
            },
            {
                name: "xxx-no-such-descriptor-xxx",
                descriptor: {}
            },
            {
                name: "jsonAction",
                descriptor: {}
            }
        ];

        var batchOptions = {
            continueOnError: true
        };

        _playground.ps.descriptor.batchPlay(commands, {}, batchOptions, function (err, descriptors, errors) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            
            equal(descriptors.length, 3, "Received three possible results");
            equal(errors.length, 3, "Received three possible errors");

            equal(typeof descriptors[0], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[0]), 0, "Result object is empty");
            ok(!errors[0], "Error is falsy");
            
            ok(!descriptors[1], "Result is falsy");
            _validateNotifierResultError(errors[1], _playground.errorCodes.UNKNOWN_ERROR);

            equal(typeof descriptors[2], "object", "Result is a descriptor");
            equal(Object.keys(descriptors[2]), 0, "Result object is empty");
            ok(!errors[2], "Error is falsy");

            start();
        });
    });

    test("_playground.ps.ui.setPointerEventPropagationPolicy object exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setPointerEventPropagationPolicy,
		   "_playground.ps.ui.setPointerEventPropagationPolicy object exists");
    });

    asyncTest("_playground.ps.ui.setPointerEventPropagationPolicy with empty options", function () {
        expect(1);

        var options = {};
        _playground.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err, _playground.errorCodes.UNKNOWN_ERROR);

            start();
        });
    });

    asyncTest("_playground.ps.ui.setPointerEventPropagationPolicy with empty policy", function () {
        expect(1);

        var options = { policyList: [] };
        _playground.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    // --------------------- Scrollbar tests ---------------------

    test("_playground.ps.ui.setSuppressScrollbars property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setSuppressScrollbars,
            "_playground.ps.ui.setSuppressScrollbars property exists");
    });

    test("_playground.ps.ui.getSuppressScrollbars property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.getSuppressScrollbars,
            "_playground.ps.ui.getSuppressScrollbars property exists");
    });

    /* Get the scrollbar mode. While it is initialized to false, at this point we cannot
    make assumptions about its value.
    Value validation is also an issue as we are invoking setter tests asynchronously
    */
    asyncTest("_playground.ps.ui.getSuppressScrollbars property", function () {
        expect(2);

        _playground.ps.ui.getSuppressScrollbars(function (err, value) {
            _validateNotifierResult(err);
            
            equal(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    /* Set the scrollbar mode. When set the old value is returned.
    The First value sets the scrollbar to true, the second to false
    */
    asyncTest("_playground.ps.ui.setSuppressScrollbars property", function () {
        expect(2);

        _playground.ps.ui.setSuppressScrollbars(true, function (err, previousValue) {
            _validateNotifierResult(err);
            
            equal(typeof previousValue, "boolean", "Result is a boolean");

            // reset the scrollbar value
            _playground.ps.ui.setSuppressScrollbars(previousValue, function () { });

            start();
        });
    });

});
