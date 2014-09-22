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
/* global module, test, asyncTest, ok, _playground, expect, start, equal, deepEqual */

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
       
        var testPasses = false;
        if (err === undefined) {
            testPasses = true;
        } else if (err === null) {
            console.log("validateNotifierResult encountered a 'null' object");
            testPasses = false;
        } else if (err.number !== undefined && err.number === 0) {
            testPasses = true;
        } else {
            console.log("validateNotifierResult a malformed err object: " + err);
            testPasses = false;
        }

        ok(testPasses, "result is success");
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

            if (!(err instanceof Error)) {
                console.log("err object is not an instance of the Error object" + err);
                break;
            }
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

    // ------------------- _playground, _playground.ps -------------------------

    test("_playground object exists", function () {
        expect(1);
        ok(!!_playground, "_playground object exists");
    });

    test("_playground.errorCodes constants object", function () {
        ok(typeof _playground.errorCodes === "object", "_playground.errorCodes is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING errorCode PROPERTIES!
        var expectedSize = 9;
        var actualSize = Object.getOwnPropertyNames(_playground.errorCodes).length;
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
        ok(typeof _playground.errorCodes.UNKNOWN_FUNCTION_ERROR === "number",
           "_playground.errorCodes.UNKNOWN_FUNCTION_ERROR");
        ok(typeof _playground.errorCodes.SUITEPEA_ERROR === "number",
           "_playground.errorCodes.SUITEPEA_ERROR");
        ok(typeof _playground.errorCodes.REENTRANCY_ERROR === "number",
           "_playground.errorCodes.REENTRANCY_ERROR");
    });

    test("_playground.ps property exists", function () {
        expect(1);
        ok(!!_playground.ps, "_playground.ps property exists");
    });

    /* _playground.ps.endModalToolState() function
     * TODO: Functional validation needed, probably blackbox
     */
    test("_playground.ps.endModalToolState function", function () {
        ok(typeof _playground.ps.endModalToolState === "function",
           "_playground.ps.endModalToolState function is defined");
    });

    /* _playground.ps.performMenuCommand() function
     * TODO: Functional validation needed
     */
    test("_playground.ps.performMenuCommand function", function () {
        ok(typeof _playground.ps.performMenuCommand === "function",
           "_playground.ps.performMenuCommand function is defined");
    });

    /* _playground.getExecutionMode() function
     * Includes type validation of return object latentVisibility and suspended
     * properties.
     */
    asyncTest("_playground.getExecutionMode function", function () {
        expect(5);
        ok(typeof _playground.getExecutionMode === "function",
           "_playground.getExecutionMode function is defined");
        _playground.getExecutionMode(function (err, startValue) {
            _validateNotifierResult(err);
            deepEqual(typeof startValue, "object", "getExecutionMode() startValue");
            deepEqual(typeof startValue.latentVisibility, "boolean",
                      "getExecutionMode() startValue.latentVisibility property type");
            deepEqual(typeof startValue.suspended, "boolean",
                      "getExecutionMode() startValue.suspended property type");
            start();
        });
    });

    /* _playground.setExecutionMode() / getExecutionMode() set/get functional
     * toggle latentVisibility
     */
    asyncTest("_playground.setExecutionMode()/getExecutionMode(): toggle latentVisibility", function () {
        expect(17);

        ok(typeof _playground.setExecutionMode === "function",
           "_playground.setExecutionMode function is defined");

        // Initial get of startValue
        _playground.getExecutionMode(function (err, startValue) {
            _validateNotifierResult(err);

            // Invert startValue.latentVisibility state and set, then compare to previousValue
            var invertedStart = {latentVisibility: !startValue.latentVisibility,
                                 suspended: startValue.suspended};
            _playground.setExecutionMode(invertedStart, function (err, previousValue) {
                _validateNotifierResult(err);
                deepEqual(typeof previousValue, "object", "previousValue type");
                deepEqual(previousValue.latentVisibility, startValue.latentVisibility,
                          "previousValue.latentVisibility returned by set(1) should equal pre-set value");
                deepEqual(previousValue.suspended, startValue.suspended,
                          ".suspended should not have changed");
                // get to confirm set
                _playground.getExecutionMode(function (err, newValue) {
                    _validateNotifierResult(err);
                    deepEqual(typeof newValue, "object", "newValue type");
                    deepEqual(newValue.latentVisibility, invertedStart.latentVisibility,
                              "newValue.latentVisibility returned by get should equal set value");
                    deepEqual(newValue.suspended, startValue.suspended,
                              ".suspended should not have changed");

                    // set back to the initial (startValue) state
                    _playground.setExecutionMode(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        deepEqual(previousValue.latentVisibility, newValue.latentVisibility,
                                  "previousValue.latentVisibility returned by set(2) should equal prior set value");
                        deepEqual(previousValue.suspended, startValue.suspended,
                                  ".suspended should not have changed");

                        // one final get and compare to start
                        _playground.getExecutionMode(function (err, endValue) {
                            _validateNotifierResult(err);
                            deepEqual(typeof endValue, "object", "newValue type");
                            deepEqual(endValue.latentVisibility, startValue.latentVisibility,
                                      "endValue.latentVisibility returned by set should equal restored start value");
                            deepEqual(endValue.suspended, startValue.suspended,
                                      ".suspended should not have changed");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _playground.setExecutionMode() / getExecutionMode() set/get functional
     * toggle suspended
     */
    asyncTest("_playground.setExecutionMode()/getExecutionMode(): toggle suspended", function () {
        expect(16);

        // Initial get of startValue
        _playground.getExecutionMode(function (err, startValue) {
            _validateNotifierResult(err);

            // Invert startValue.suspended state and set, then compare to previousValue
            var invertedStart = {latentVisibility: startValue.latentVisibility,
                                 suspended: !startValue.suspended};
            _playground.setExecutionMode(invertedStart, function (err, previousValue) {
                _validateNotifierResult(err);
                deepEqual(typeof previousValue, "object", "previousValue type");
                deepEqual(previousValue.suspended, startValue.suspended,
                          "previousValue.suspended returned by set(1) should equal pre-set value");
                deepEqual(previousValue.latentVisibility, startValue.latentVisibility,
                          ".latentVisibility should not have changed");
                // get to confirm set
                _playground.getExecutionMode(function (err, newValue) {
                    _validateNotifierResult(err);
                    deepEqual(typeof newValue, "object", "newValue type");
                    deepEqual(newValue.suspended, invertedStart.suspended,
                              "newValue.suspended returned by get should equal set value");
                    deepEqual(newValue.latentVisibility, startValue.latentVisibility,
                              ".latentVisibility should not have changed");

                    // set back to the initial (startValue) state
                    _playground.setExecutionMode(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        deepEqual(previousValue.suspended, newValue.suspended,
                                  "previousValue.suspended returned by set(2) should equal prior set value");
                        deepEqual(previousValue.latentVisibility, startValue.latentVisibility,
                                  ".latentVisibility should not have changed");

                        // one final get and compare to start
                        _playground.getExecutionMode(function (err, finalValue) {
                            _validateNotifierResult(err);
                            deepEqual(typeof finalValue, "object", "newValue type");
                            deepEqual(finalValue.suspended, startValue.suspended,
                                      "finalValue.suspended returned by set should equal restored start value");
                            deepEqual(finalValue.latentVisibility, startValue.latentVisibility,
                                      ".latentVisibility should not have changed");
                            start();
                        });
                    });
                });
            });
        });
    });


    // ---------------------- _playground._debug ------------------------------

    test("_playground._debug property exists", function () {
        expect(1);
        ok(!!_playground._debug, "_playground.debug property exists");
    });

    test("_playground._debug.getRemoteDebuggingPort function", function () {
        ok(typeof _playground._debug.getRemoteDebuggingPort === "function",
           "_playground._debug.getRemoteDebuggingPort function is defined");
        var port = _playground._debug.getRemoteDebuggingPort();
        deepEqual(typeof port, "number", "_playground._debug.getRemoteDebuggingPort() retval");
    });

    /* _playground._debug.logMessage() function
     * 
     */
    test("_playground._debug.logMessage function", function () {
        ok(typeof _playground._debug.logMessage === "function",
           "_playground._debug.logMessage function is defined");
        _playground._debug.logMessage("_playground._debug.logMessage function test");
    });

    /* _playground._debug_showHideDevTools() function only tested for existence
     * because the initial state can't be determined to be able to reset it as
     * found.
     */
    test("_playground._debug_showHideDevTools function is defined", function () {
        ok(typeof _playground._debug.showHideDevTools === "function",
           "_playground._debug.showHideDevTools function is defined");
    });

    /* Negative test. Invoke a host method with an incorrect number/typs of arguments
     *
     */
    asyncTest("_playground._debug.forcePlayArgumentFailure", function () {
        expect(1);

        _playground._debug.forcePlayArgumentFailure(function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);

            start();
        });
    });

    /* _playground._debug_descriptorIdentity() function
     * TODO: tburbage (2014/08/22): Need functional test case(s)
     */
    test("_playground._debug_descriptorIdentity function is defined", function () {
        ok(typeof _playground._debug.descriptorIdentity === "function",
           "_playground._debug.descriptorIdentity function is defined");
    });

    /* _playground._debug_testRoundtrip() function
     * TODO: NOT YET IMPLEMENTED
     */
    // asyncTest("_playground._debug.testRoundtrip function", function () {
    //  expect(1);
        
    //     ok(typeof _playground._debug.testRoundtrip === "function",
    //     "_playground._debug.testRoundtrip function is defined");
    //  // var retval = _playground._debug.testRoundtrip(function () {
    //  //  console.log("testRoundtrip retval: ", retval);
    //  //  start();
    //  // });
    // });

    /* _playground._debug_testNativeDispatcherException() function
     * tburbage (2014/08/22): Should we assert anything else about the Javascript
     * thrown Error object? Standard properties e.g. name and message?
     */
    test("_playground._debug_testNativeDispatcherException function", function () {
        ok(typeof _playground._debug.testNativeDispatcherException === "function",
           "_playground._debug.testNativeDispatcherException function is defined");
        var exceptionThrown = false;
        try {
            _playground._debug.testNativeDispatcherException();
        } catch (err) {
            exceptionThrown = true;
            ok(err instanceof Error, "Caught exception expected to be an instanceof Error");
        }
        ok(exceptionThrown, "Expect native Javascript exception to be thrown");
    });

    /* _playground._debug_enableDebugContextMenu() function only tested for
     * existence because the initial state can't be determined to be able to
     * reset it as found.
     */
    test("_playground._debug_enableDebugContextMenu function is defined", function () {
        ok(typeof _playground._debug.enableDebugContextMenu === "function",
           "_playground._debug.enableDebugContextMenu function is defined");
    });

    /* _playground._debug_adHoc()
     * TODO: Add functional test with simple, non-"destructive" command
     */
    test("_playground._debug_adHoc function is defined", function () {
        ok(typeof _playground._debug.adHoc === "function",
           "_playground._debug.adHoc function is defined");
    });


    // ------------------- _playground.ps.descriptor --------------------------

    test("_playground.ps.descriptor property exists", function () {
        expect(1);
        ok(!!_playground.ps.descriptor, "_playground.ps.descriptor property exists");
    });

    test("_playground.ps.descriptor.interactionMode constants object", function () {
        ok(typeof _playground.ps.descriptor.interactionMode === "object",
           "_playground.ps.descriptor.interactionMode is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING interactionMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.descriptor.interactionMode).length;
        equal(actualSize, expectedSize, "_playground.ps.descriptor.interactionMode size");
        // constants
        ok(typeof _playground.ps.descriptor.interactionMode.DONT_DISPLAY === "number",
           "_playground.ps.descriptor.interactionMode.DONT_DISPLAY");
        ok(typeof _playground.ps.descriptor.interactionMode.DISPLAY === "number",
           "_playground.ps.descriptor.interactionMode.DISPLAY");
        ok(typeof _playground.ps.descriptor.interactionMode.SILENT === "number",
           "_playground.ps.descriptor.interactionMode.SILENT");
    });

    /* SKIPPING THESE FUNCTIONS FOR NOW DUE TO NOTE IN PlaygroundExtension.js
     * that these functions will all be changing:
     * _playground.ps.descriptor.registerEventListener()
     * _playground.ps.descriptor.unRegisterEventListener()
     * _playground.ps.descriptor.addEvent()
     * _playground.ps.descriptor.removeEvent()
     */

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
            _validateNotifierResultError(err, _playground.errorCodes.SUITEPEA_ERROR);
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
            _validateNotifierResultError(err, _playground.errorCodes.SUITEPEA_ERROR);
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


    // ------------------------- _playground.ps.ui ----------------------------

    test("_playground.ps.ui property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui, "_playground.ps.ui property exists");
    });

    test("_playground.ps.ui.widgetTypes constants object", function () {
        ok(typeof _playground.ps.ui.widgetTypes === "object",
           "_playground.ps.ui.widgetTypes is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING widgetTypes PROPERTIES!
        var expectedSize = 7;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.widgetTypes).length;
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
    });

    test("_playground.ps.ui.pointerPropagationMode constants object", function () {
        ok(typeof _playground.ps.ui.pointerPropagationMode === "object",
           "_playground.ps.ui.pointerPropagationMode is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING pointerPropagationMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.pointerPropagationMode).length;
        equal(actualSize, expectedSize, "_playground.ps.ui.pointerPropagationMode size");
        // constants
        ok(typeof _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE === "number",
           "_playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE");
        ok(typeof _playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE === "number",
           "_playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE === "number",
           "_playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE");
    });

    if (navigator.platform === "MacIntel") {
        test("_playground.ps.ui.PolicyAction constants object", function () {
            ok(typeof _playground.ps.ui.PolicyAction === "object",
               "_playground.ps.ui.PolicyAction is defined");
            // CHANGE THIS VALUE WHEN ADDING OR REMOVING PolicyAction PROPERTIES!
            var expectedSize = 3;
            var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.PolicyAction).length;
            equal(actualSize, expectedSize, "_playground.ps.ui.PolicyAction size");
            // constants
            ok(typeof _playground.ps.ui.PolicyAction.ALPHA_PROPAGATE === "number",
               "_playground.ps.ui.PolicyAction.ALPHA_PROPAGATE");
            ok(typeof _playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE === "number",
               "_playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE");
            ok(typeof _playground.ps.ui.PolicyAction.NEVER_PROPAGATE === "number",
               "_playground.ps.ui.PolicyAction.NEVER_PROPAGATE");
        });
    }

    test("_playground.ps.ui.keyboardPropagationMode constants object", function () {
        ok(typeof _playground.ps.ui.keyboardPropagationMode === "object",
           "_playground.ps.ui.keyboardPropagationMode is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING keyboardPropagationMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.keyboardPropagationMode).length;
        equal(actualSize, expectedSize, "_playground.ps.ui.keyboardPropagationMode size");
        // constants
        ok(typeof _playground.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE === "number",
           "_playground.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE");
        ok(typeof _playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE === "number",
           "_playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE === "number",
           "_playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE");
    });

    test("_playground.ps.ui.overscrollMode constants object", function () {
        ok(typeof _playground.ps.ui.overscrollMode === "object",
           "_playground.ps.ui.overscrollMode is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.overscrollMode).length;
        equal(actualSize, expectedSize, "_playground.ps.ui.overscrollMode size");
        // constants
        ok(typeof _playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL === "number",
           "_playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL");
        ok(typeof _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL === "number",
           "_playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL");
        ok(typeof _playground.ps.ui.overscrollMode.NEVER_OVERSCROLL === "number",
           "_playground.ps.ui.overscrollMode.NEVER_OVERSCROLL");
    });

    /* Basic test for obtaining a value with no arguments
     *
     */
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

    /* Negative test: Invoke a host method without providing a notifier
     *
     */
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

    /* _playground.ps.ui.setPointerPropagationMode
     *
     */
    test("_playground.ps.ui.setPointerPropagationMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setPointerPropagationMode,
            "_playground.ps.ui.setPointerPropagationMode property exists");
    });

    /* _playground.ps.ui.getPointerPropagationMode
     *
     */
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

    /* _playground.ps.ui.setOverscrollMode
     *
     */
    test("_playground.ps.ui.setOverscrollMode property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setOverscrollMode,
            "_playground.ps.ui.setOverscrollMode property exists");
    });

    /* _playground.ps.ui.getOverscrollMode
     *
     */
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
     * make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
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
     * The First value sets the scrollbar to true, the second to false
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

    /* Get/set the scrollbar mode. Confirms the "symmetry" of get/set.
     * While it is initialized to false, at this point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_playground.ps.ui.setSuppressScrollbars property get/set", function () {
        expect(11);

        // Initial get of startValue
        _playground.ps.ui.getSuppressScrollbars(function (err, startValue) {
            _validateNotifierResult(err);
            deepEqual(typeof startValue,
                      "boolean",
                      "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _playground.ps.ui.setSuppressScrollbars(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                deepEqual(typeof previousValue,
                          "boolean",
                          "Result is a boolean");
                deepEqual(previousValue,
                          startValue,
                          "previousValue returned by set should equal prior get value");

                // get to confirm set
                _playground.ps.ui.getSuppressScrollbars(function (err, newValue) {
                    _validateNotifierResult(err);
                    deepEqual(newValue,
                              !startValue,
                              "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _playground.ps.ui.setSuppressScrollbars(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        deepEqual(previousValue,
                                  !startValue,
                                  "previousValue returned by set should equal prior get value");
                        
                        // get to confirm set
                        _playground.ps.ui.getSuppressScrollbars(function (err, endValue) {
                            _validateNotifierResult(err);
                            deepEqual(endValue,
                                      startValue,
                                      "endValue (on get) should equal the startValue");

                            start();
                        });
                    });
                });
            });
        });
    });

    // --------------------- Dialog tests ---------------------

    test("_playground.ps.ui.setSuppressDialogs property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.setSuppressDialogs,
            "_playground.ps.ui.setSuppressDialogs property exists");
    });

    test("_playground.ps.ui.getSuppressDialogs property exists", function () {
        expect(1);
        ok(!!_playground.ps.ui.getSuppressDialogs,
            "_playground.ps.ui.getSuppressDialogs property exists");
    });

    /* Get the dialog mode. While it is initialized to false, at this point we cannot
     * make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_playground.ps.ui.getSuppressDialogs property", function () {
        expect(2);

        _playground.ps.ui.getSuppressDialogs(function (err, value) {
            _validateNotifierResult(err);
            
            equal(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    /* Set the dialog mode. When set the old value is returned.
     * The First value sets the dialog to true, the second to false
     */
    asyncTest("_playground.ps.ui.setSuppressDialogs property", function () {
        expect(2);

        _playground.ps.ui.setSuppressDialogs(true, function (err, previousValue) {
            _validateNotifierResult(err);
            
            equal(typeof previousValue, "boolean", "Result is a boolean");

            // reset the dialog value
            _playground.ps.ui.setSuppressDialogs(previousValue, function () { });

            start();
        });
    });

    /* Get/set the dialog mode. Confirms the "symmetry" of get/set.
     * While it is initialized to false, at this point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_playground.ps.ui.setSuppressDialogs property get/set", function () {
        expect(11);

        // Initial get of startValue
        _playground.ps.ui.getSuppressDialogs(function (err, startValue) {
            _validateNotifierResult(err);
            deepEqual(typeof startValue,
                      "boolean",
                      "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _playground.ps.ui.setSuppressDialogs(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                deepEqual(typeof previousValue,
                          "boolean",
                          "Result is a boolean");
                deepEqual(previousValue,
                          startValue,
                          "previousValue returned by set should equal prior get value");

                // get to confirm set
                _playground.ps.ui.getSuppressDialogs(function (err, newValue) {
                    _validateNotifierResult(err);
                    deepEqual(newValue,
                              !startValue,
                              "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _playground.ps.ui.setSuppressDialogs(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        deepEqual(previousValue,
                                  !startValue,
                                  "previousValue returned by set should equal prior get value");
                        
                        // get to confirm set
                        _playground.ps.ui.getSuppressDialogs(function (err, endValue) {
                            _validateNotifierResult(err);
                            deepEqual(endValue,
                                      startValue,
                                      "endValue (on get) should equal the startValue");

                            start();
                        });
                    });
                });
            });
        });
    });


    // -------------------------- _playground.os ------------------------------

    test("_playground.os property exists", function () {
        expect(1);
        ok(!!_playground.ps, "_playground.os property exists");
    });

    test("_playground.os.eventKind constants object", function () {
        ok(typeof _playground.os.eventKind === "object",
           "_playground.os.eventKind is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventKind).length;
        equal(actualSize, expectedSize, "_playground.os.eventKind size");
        // constants
        ok(typeof _playground.os.eventKind.LEFT_MOUSE_DOWN === "number",
           "_playground.os.eventKind.LEFT_MOUSE_DOWN");
        ok(typeof _playground.os.eventKind.KEY_DOWN === "number",
           "_playground.os.eventKind.KEY_DOWN");
        ok(typeof _playground.os.eventKind.KEY_UP === "number",
           "_playground.os.eventKind.KEY_UP");
    });

    test("_playground.os.eventModifiers constants object", function () {
        ok(typeof _playground.os.eventModifiers === "object",
           "_playground.os.eventModifiers is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 5;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventModifiers).length;
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
    });

    test("_playground.os.eventTypes constants object", function () {
        ok(typeof _playground.os.eventTypes === "object",
           "_playground.os.eventTypes is defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING eventTypes PROPERTIES!
        var expectedSize = 6;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventTypes).length;
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
        ok(typeof _playground.os.eventTypes.CONVERTIBLE_SLATE_MODE_CHANGED === "string",
           "_playground.os.eventTypes.CONVERTIBLE_SLATE_MODE_CHANGED");
    });

    /* _playground.os.registerEventListener() function
     * 
     */
    test("_playground.os.registerEventListener function", function () {
        ok(typeof _playground.os.registerEventListener === "function",
           "_playground.os.registerEventListener function is defined");
    });

    /* _playground.os.registerEventListener() function
     * 
     */
    test("_playground.os.unRegisterEventListener function", function () {
        ok(typeof _playground.os.unRegisterEventListener === "function",
           "_playground.os.unRegisterEventListener function is defined");
    });

    /* _playground.os.postEvent() function
     * 
     */
    test("_playground.os.postEvent function", function () {
        ok(typeof _playground.os.postEvent === "function",
           "_playground.os.postEvent function is defined");
    });

    /* _playground.os.keyboardFocus property
     * 
     */
    test("_playground.os.keyboardFocus property", function () {
        ok(typeof _playground.os.keyboardFocus === "object",
           "_playground.os.keyboardFocus property is defined");
    });

    /* _playground.os.keyboardFocus.acquire function
     * 
     */
    test("_playground.os.keyboardFocus.acquire() function", function () {
        ok(typeof _playground.os.keyboardFocus.acquire === "function",
           "_playground.os.keyboardFocus.acquire() function is defined");
    });

    /* _playground.os.keyboardFocus.release function
     * 
     */
    test("_playground.os.keyboardFocus.release() function", function () {
        ok(typeof _playground.os.keyboardFocus.release === "function",
           "_playground.os.keyboardFocus.release() function is defined");
    });

    /* _playground.os.keyboardFocus.isActive function
     * 
     */
    test("_playground.os.keyboardFocus.isActive() function", function () {
        ok(typeof _playground.os.keyboardFocus.isActive === "function",
           "_playground.os.keyboardFocus.isActive() function is defined");
    });


    // --------------------- ConvertibleSlateMode tests ---------------------

    test("_playground.os.isConvertibleSlateMode property exists", function () {
        expect(1);
        ok(!!_playground.os.isConvertibleSlateMode,
            "_playground.os.isConvertibleSlateMode property exists");
    });

    /* Get the ConvertibleSlateMode.
    */
    asyncTest("_playground.os.isConvertibleSlateMode property", function () {
        expect(2);

        _playground.os.isConvertibleSlateMode(function (err, value) {
            _validateNotifierResult(err);
            
            equal(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    // no test for setting this property, it is read-only.  
});
