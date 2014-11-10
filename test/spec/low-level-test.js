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

/* global _playground, module, console */
/* global test, asyncTest, expect, start, ok, equal, strictEqual, deepEqual */

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

    // -------------------------------------------------------------------------
    // TESTS
    // -------------------------------------------------------------------------

    // --------------------------- _playground ---------------------------------

    /* _playground object
     * Validates: defined, type
     */
    test("_playground object defined, type", function () {
        ok(!!_playground, "_playground defined");
        ok(typeof _playground === "object", "_playground type");
    });

    /* _playground.errorCodes constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.errorCodes constants object", function () {
        ok(typeof _playground.errorCodes === "object", "_playground.errorCodes defined");
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

    /* _playground.getExecutionMode() function
     * Includes type validation of return object latentVisibility and suspended
     * properties.
     */
    asyncTest("_playground.getExecutionMode() function", function () {
        expect(5);
        ok(typeof _playground.getExecutionMode === "function",
            "_playground.getExecutionMode() function defined");
        _playground.getExecutionMode(function (err, startValue) {
            _validateNotifierResult(err);
            strictEqual(typeof startValue, "object", "getExecutionMode() startValue");
            strictEqual(typeof startValue.latentVisibility, "boolean",
                      "getExecutionMode() startValue.latentVisibility property type");
            strictEqual(typeof startValue.suspended, "boolean",
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
            "_playground.setExecutionMode function defined");

        // Initial get of startValue
        _playground.getExecutionMode(function (err, startValue) {
            _validateNotifierResult(err);

            // Invert startValue.latentVisibility state and set, then compare to previousValue
            var invertedStart = {latentVisibility: !startValue.latentVisibility,
                                 suspended: startValue.suspended};
            _playground.setExecutionMode(invertedStart, function (err, previousValue) {
                _validateNotifierResult(err);
                strictEqual(typeof previousValue, "object", "previousValue type");
                strictEqual(previousValue.latentVisibility, startValue.latentVisibility,
                          "previousValue.latentVisibility returned by set(1) should equal pre-set value");
                strictEqual(previousValue.suspended, startValue.suspended,
                          ".suspended should not have changed");
                // get to confirm set
                _playground.getExecutionMode(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(typeof newValue, "object", "newValue type");
                    strictEqual(newValue.latentVisibility, invertedStart.latentVisibility,
                              "newValue.latentVisibility returned by get should equal set value");
                    strictEqual(newValue.suspended, startValue.suspended,
                              ".suspended should not have changed");

                    // set back to the initial (startValue) state
                    _playground.setExecutionMode(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue.latentVisibility, newValue.latentVisibility,
                                  "previousValue.latentVisibility returned by set(2) should equal prior set value");
                        strictEqual(previousValue.suspended, startValue.suspended,
                                  ".suspended should not have changed");

                        // one final get and compare to start
                        _playground.getExecutionMode(function (err, endValue) {
                            _validateNotifierResult(err);
                            strictEqual(typeof endValue, "object", "newValue type");
                            strictEqual(endValue.latentVisibility, startValue.latentVisibility,
                                      "endValue.latentVisibility returned by set should equal restored start value");
                            strictEqual(endValue.suspended, startValue.suspended,
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
                strictEqual(typeof previousValue, "object", "previousValue type");
                strictEqual(previousValue.suspended, startValue.suspended,
                          "previousValue.suspended returned by set(1) should equal pre-set value");
                strictEqual(previousValue.latentVisibility, startValue.latentVisibility,
                          ".latentVisibility should not have changed");
                // get to confirm set
                _playground.getExecutionMode(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(typeof newValue, "object", "newValue type");
                    strictEqual(newValue.suspended, invertedStart.suspended,
                              "newValue.suspended returned by get should equal set value");
                    strictEqual(newValue.latentVisibility, startValue.latentVisibility,
                              ".latentVisibility should not have changed");

                    // set back to the initial (startValue) state
                    _playground.setExecutionMode(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue.suspended, newValue.suspended,
                                  "previousValue.suspended returned by set(2) should equal prior set value");
                        strictEqual(previousValue.latentVisibility, startValue.latentVisibility,
                                  ".latentVisibility should not have changed");

                        // one final get and compare to start
                        _playground.getExecutionMode(function (err, finalValue) {
                            _validateNotifierResult(err);
                            strictEqual(typeof finalValue, "object", "newValue type");
                            strictEqual(finalValue.suspended, startValue.suspended,
                                      "finalValue.suspended returned by set should equal restored start value");
                            strictEqual(finalValue.latentVisibility, startValue.latentVisibility,
                                      ".latentVisibility should not have changed");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _playground.notifierGroup constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.notifierGroup constants object", function () {
        ok(typeof _playground.notifierGroup === "object", "_playground.notifierGroup defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING notifierGroup PROPERTIES!
        var expectedSize = 5;
        var actualSize = Object.getOwnPropertyNames(_playground.notifierGroup).length;
        strictEqual(actualSize, expectedSize, "_playground.notifierGroup size");
        // constants
        ok(typeof _playground.notifierGroup.PHOTOSHOP === "string",
            "_playground.notifierGroup.PHOTOSHOP");
        ok(typeof _playground.notifierGroup.OS === "string",
            "_playground.notifierGroup.OS");
        ok(typeof _playground.notifierGroup.MENU === "string",
            "_playground.notifierGroup.MENU");
        ok(typeof _playground.notifierGroup.INTERACTION === "string",
            "_playground.notifierGroup.INTERACTION");
        ok(typeof _playground.notifierGroup.TOUCH === "string",
            "_playground.notifierGroup.TOUCH");
    });

    /* _playground.setNotifier() function
     * Validates: defined, type
     */
    test("_playground.setNotifier function defined", function () {
        ok(typeof _playground.setNotifier === "function",
            "_playground.setNotifier function defined");
    });

    /* _playground.notifierOptions.interaction constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.notifierOptions.interaction constants object", function () {
        ok(typeof _playground.notifierOptions.interaction === "object", "_playground.notifierOptions.interaction defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING interaction PROPERTIES!
        var expectedSize = 2;
        var actualSize = Object.getOwnPropertyNames(_playground.notifierOptions.interaction).length;
        equal(actualSize, expectedSize, "_playground.notifierOptions.interaction size");
        // constants
        ok(typeof _playground.notifierOptions.interaction.PROGRESS === "number",
            "_playground.notifierOptions.interaction.PROGRESS");
        ok(typeof _playground.notifierOptions.interaction.ERROR === "number",
            "_playground.notifierOptions.interaction.ERROR");
    });

    // ---------------------- _playground._debug ------------------------------

    /* _playground._debug
     * Validates: defined, type
     */
    test("_playground._debug defined, type", function () {
        ok(typeof _playground._debug === "object",
            "_playground._debug object property defined, type");
    });

    test("_playground._debug.getRemoteDebuggingPort()", function () {
        ok(typeof _playground._debug.getRemoteDebuggingPort === "function",
            "_playground._debug.getRemoteDebuggingPort function defined");
        var port = _playground._debug.getRemoteDebuggingPort();
        strictEqual(typeof port, "number", "_playground._debug.getRemoteDebuggingPort() retval");
    });

    /* _playground._debug.logMessage() function
     *
     */
    test("_playground._debug.logMessage()", function () {
        ok(typeof _playground._debug.logMessage === "function",
            "_playground._debug.logMessage function defined");
        _playground._debug.logMessage("_playground._debug.logMessage function test");
    });

    /* _playground._debug_showHideDevTools()
     * function only tested for existence because the initial state can't be
     * determined to be able to reset it as found.
     */
    test("_playground._debug_showHideDevTools() defined", function () {
        ok(typeof _playground._debug.showHideDevTools === "function",
            "_playground._debug.showHideDevTools() defined");
    });

    /* _playground._debug.forcePlayArgumentFailure()
     * Negative: invoke a host method with an incorrect number/typs of arguments
     */
    asyncTest("_playground._debug.forcePlayArgumentFailure()", function () {
        expect(1);

        _playground._debug.forcePlayArgumentFailure(function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);

            start();
        });
    });

    /* _playground._debug.descriptorIdentity() function
     * tests for defined and a single round-trip C++<=>JS with empty
     * descriptor objects 
     */
    test("_playground._debug.descriptorIdentity() defined", function () {
        ok(typeof _playground._debug.descriptorIdentity === "function",
            "_playground._debug.descriptorIdentity() defined");
    });

    asyncTest("_playground._debug.descriptorIdentity(): timing test (single)", function () {
        expect(2);
        var warn_max_rt_time = 5; // ms
        var error_max_rt_time = 10; // ms
        var start_time = performance.now();
        _playground._debug.descriptorIdentity({}, {}, function (err, descriptor, reference) {
            var elapsed = performance.now() - start_time;
            _validateNotifierResult(err);
            if (elapsed > warn_max_rt_time && elapsed <= error_max_rt_time) {
                console.warn("Single round trip time (", elapsed.toFixed(2),
                             "ms) exceeds WARN threshold (", warn_max_rt_time, "ms)");
            }
            ok(elapsed <= error_max_rt_time,
               "Single round trip time (" + elapsed.toFixed(2)
               + "ms): should not exceed ERROR threshold (" + error_max_rt_time + "ms)");
            start();
        });
    });

    /* _playground._debug.descriptorIdentity(): timing test, multiple iterations averaged
     */
    asyncTest("_playground._debug.descriptorIdentity(): timing test, multiple iterations averaged", function () {
        expect(1);
        var callback = function (err, descriptor, reference) {
            callbacks_received++;
            if (callbacks_received < iterations) {
                _playground._debug.descriptorIdentity({}, {}, callback);
            }
            else
            {
                var elapsed = performance.now() - start_time;
                var avg_rt_time = elapsed / iterations;
                if (avg_rt_time > warn_max_avg_rt_time) {
                    console.warn("Average round trip time (ms) exceeds expected. EXP:", warn_max_avg_rt_time,
                                 "; ACTUAL:", avg_rt_time.toFixed(2));
                }
                ok(avg_rt_time <= error_max_avg_rt_time, "Average round trip time (" + avg_rt_time.toFixed(2)
                   + "ms) should not exceed " + error_max_avg_rt_time + "ms");
                start();
            }
        };
        var iterations = 100;
        var warn_max_avg_rt_time = 5; // ms
        var error_max_avg_rt_time = 10; // ms
        var callbacks_received = 0;
        var start_time = performance.now();
        _playground._debug.descriptorIdentity({}, {}, callback);
    });

    /* _playground._debug_testNativeDispatcherException() function
     */
    test("_playground._debug_testNativeDispatcherException()", function () {
        ok(typeof _playground._debug.testNativeDispatcherException === "function",
            "_playground._debug.testNativeDispatcherException function defined");
        var exceptionThrown = false;
        try {
            _playground._debug.testNativeDispatcherException();
        } catch (err) {
            exceptionThrown = true;
            ok(err instanceof Error, "Caught exception expected to be an instanceof Error");
            ok(err.hasOwnProperty("message"), "Error object should have a 'message' property");
            strictEqual("string", typeof err.message, "Error object 'message' prop type should be 'string'");
        }
        ok(exceptionThrown, "Expect native Javascript exception to be thrown");
    });

    /* _playground._debug_enableDebugContextMenu() function only tested for
     * existence because the initial state can't be determined to be able to
     * reset it as found.
     */
    test("_playground._debug_enableDebugContextMenu() defined", function () {
        ok(typeof _playground._debug.enableDebugContextMenu === "function",
            "_playground._debug.enableDebugContextMenu function defined");
    });

    /* _playground._debug_adHoc()
     * TODO: Add functional test with simple, non-"destructive" command
     * Probably a good blackbox test candidate
     */
    test("_playground._debug_adHoc() defined", function () {
        ok(typeof _playground._debug.adHoc === "function",
            "_playground._debug.adHoc function defined");
    });


    // ------------------------- _playground.ps -------------------------------

    /* _playground.ps property/object
     * Validates: defined, type
     */
    test("_playground.ps property defined, type", function () {
        ok(!!_playground.ps, "_playground.ps property defined");
        ok(typeof _playground.ps === "object", "_playground.ps property type");
    });

    /* _playground.ps.endModalToolState()
     * Validates: defined, type
     * See blackbox-tests.js for interactive testing control
     */
    test("_playground.ps.endModalToolState function defined", function () {
        ok(typeof _playground.ps.endModalToolState === "function",
            "_playground.ps.endModalToolState function defined");
    });

    /* _playground.ps.performMenuCommand()
     * Validates: defined, type
     * TODO: Functional validation needed
     */
    test("_playground.ps.performMenuCommand function", function () {
        ok(typeof _playground.ps.performMenuCommand === "function",
            "_playground.ps.performMenuCommand function defined");
    });

    /* _playground.ps.getActiveTool()
     * Validates: defined, type
     * functional: makes valid requiest for the active tool and checks that the returned value has expected keys
     */
    asyncTest("_playground.ps.getActiveTool() functional (valid request)", function () {
        expect(6);

        ok(typeof _playground.ps.getActiveTool === "function",
            "_playground.ps.getActiveTool() function defined");

        _playground.ps.getActiveTool(function (err, info) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");

            ok(typeof info.title === "string",
                "_playground.ps.getActiveTool. info result.title");

            ok(typeof info.isModal === "boolean",
                "_playground.ps.getActiveTool. info result.isModal");

            ok(typeof info.key === "string",
                "_playground.ps.getActiveTool. info result.key");

            start();
        });
    });

    /* _playground.ps.requestImage() function
     * Validates: defined, type
     */
    test("_playground.ps.requestImage() defined", function () {
        ok(typeof _playground.ps.requestImage === "function",
            "_playground.ps.requestImage() function defined");
    });

    // ------------------- _playground.ps.descriptor --------------------------

    /* _playground.ps.descriptor property
     * Validates: defined, type
     */
    test("_playground.ps.descriptor property defined, type", function () {
        ok(!!_playground.ps.descriptor, "_playground.ps.descriptor property defined");
        ok(typeof _playground.ps.descriptor === "object", "_playground.ps.descriptor type");
    });

    /* _playground.ps.descriptor.interactionMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.ps.descriptor.interactionMode constants object", function () {
        ok(typeof _playground.ps.descriptor.interactionMode === "object",
            "_playground.ps.descriptor.interactionMode defined, type");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING interactionMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.descriptor.interactionMode).length;
        strictEqual(actualSize, expectedSize, "_playground.ps.descriptor.interactionMode size");
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

    /* _playground.ps.descriptor.get()
     * Validates: defined, type
     * functional: makes valid requiest for PS property "hostName"
     */
    asyncTest("_playground.ps.descriptor.get() functional (valid request)", function () {
        expect(6);

        ok(typeof _playground.ps.descriptor.get === "function",
            "_playground.ps.descriptor.get() function defined");

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

            strictEqual(typeof descriptor, "object", "Result is a descriptor");
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

    /* _playground.ps.descriptor.get()
     * functional (negative: semantic failure)
     */
    asyncTest("_playground.ps.descriptor.get(): semantic failure", function () {
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

    /* _playground.ps.descriptor.get()
     * functional (negative: argument failure)
     */
    asyncTest("_playground.ps.descriptor.get(): argument failure", function () {
        expect(2);

        _playground.ps.descriptor.get("xxx-ref-does-not-exist-xxx", function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _playground.ps.descriptor.play()
     * functional (positive/valid input)
     */
    asyncTest("_playground.ps.descriptor.play(): (positive/valid input)", function () {
        expect(5);

        ok(typeof _playground.ps.descriptor.play === "function",
            "_playground.ps.descriptor.play() function defined");
        _playground.ps.descriptor.play("jsonAction", {}, {}, function (err, descriptor) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            strictEqual(typeof descriptor, "object", "Result is a descriptor");
            deepEqual(descriptor, {}, "Result object is empty");

            start();
        });
    });

    /* _playground.ps.descriptor.play()
     * functional (negative: argument failure)
     */
    asyncTest("_playground.ps.descriptor.play(): argument failure", function () {
        expect(2);

        _playground.ps.descriptor.play("jsonAction", 123, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _playground.ps.descriptor.play()
     * functional (negative: argument conversion failure)
     */
    asyncTest("_playground.ps.descriptor.play(): (negative: argument conversion failure)", function () {
        expect(2);

        _playground.ps.descriptor.play("jsonAction", { ref: NaN }, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _playground.ps.descriptor.play()
     * functional (negative: semantic failure)
     */
    asyncTest("_playground.ps.descriptor.play(): (negative: semantic failure)", function () {
        expect(2);

        _playground.ps.descriptor.play("xxx-ref-does-not-exist-xxx", {}, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _playground.errorCodes.SUITEPEA_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _playground.ps.descriptor.batchPlay()
     * functional (positive/valid input)
     */
    asyncTest("_playground.ps.descriptor.batchPlay(): (positive/valid input)", function () {
        expect(14);

        ok(typeof _playground.ps.descriptor.batchPlay === "function",
            "_playground.ps.descriptor.batchPlay() function defined");

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

            strictEqual(descriptors.length, 3, "Received three possible results");
            strictEqual(errors.length, 3, "Received three possible errors");

            strictEqual(typeof descriptors[0], "object", "Result is a descriptor");
            deepEqual(descriptors[0], {}, "Result object descriptors[0] is empty");
            _validateNotifierResult(errors[0]);

            strictEqual(typeof descriptors[1], "object", "Result is a descriptor");
            deepEqual(descriptors[1], {}, "Result object descriptors[1] is empty");
            _validateNotifierResult(errors[1]);

            strictEqual(typeof descriptors[2], "object", "Result is a descriptor");
            deepEqual(descriptors[2], {}, "Result object descriptors[2] is empty");
            _validateNotifierResult(errors[2]);

            start();
        });
    });

    /* _playground.ps.descriptor.batchPlay()
     * functional (negative: partial semantic failure)
     */
    asyncTest("_playground.ps.descriptor.batchPlay(): (negative: partial semantic failure)", function () {
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

            strictEqual(descriptors.length, 2, "Received three possible results");
            strictEqual(errors.length, 2, "Received three possible errors");

            strictEqual(typeof descriptors[0], "object", "Result is a descriptor");
            deepEqual(descriptors[0], {}, "Result object is empty");
            ok(!errors[0], "Error is falsy");

            ok(!descriptors[1], "Result is falsy");
            _validateNotifierResultError(errors[1], _playground.errorCodes.UNKNOWN_ERROR);

            start();
        });
    });

    /* _playground.ps.descriptor.batchPlay()
     * functional (negative: partial argument failure)
     */
    asyncTest("_playground.ps.descriptor.batchPlay(): (negative: partial argument failure)", function () {
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

    /* _playground.ps.descriptor.batchPlay()
     * functional (negative: with continueOnError: partial argument failure)
     */
    asyncTest("_playground.ps.descriptor.batchPlay(): with continueOnError/partial semantic failure", function () {
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

            strictEqual(descriptors.length, 3, "Received three possible results");
            strictEqual(errors.length, 3, "Received three possible errors");

            strictEqual(typeof descriptors[0], "object", "Result is a descriptor");
            deepEqual(descriptors[0], {}, "Result object is empty");
            ok(!errors[0], "Error is falsy");

            ok(!descriptors[1], "descriptors[1] is falsy");
            _validateNotifierResultError(errors[1], _playground.errorCodes.UNKNOWN_ERROR);

            strictEqual(typeof descriptors[2], "object", "Result is a descriptor");
            deepEqual(descriptors[2], {}, "Result object descriptors[2] is empty");
            ok(!errors[2], "Error is falsy");

            start();
        });
    });


    // ------------------------- _playground.ps.ui ----------------------------

    /* _playground.ps property/object
     * Validates: defined, type
     */
    test("_playground.ps.ui property defined, type", function () {
        ok(!!_playground.ps.ui, "_playground.ps.ui property defined");
        ok(typeof _playground.ps.ui === "object", "_playground.ps.ui property type");
    });

    /* _playground.ps.ui.getScaleFactor()
     * Functional: Basic test for obtaining a value with no arguments
     */
    asyncTest("_playground.ps.ui.getScaleFactor() functional", function () {
        expect(3);

        ok(typeof _playground.ps.ui.getScaleFactor === "function",
            "_playground.ps.ui.getScaleFactor function defined");

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

    /* _playground.ps.ui.getScaleFactor()
     * Functional: (negative: invoke a host method without providing a notifier)
     */
    test("_playground.ps.ui.getScaleFactor() (negative)", function () {
        var result;
        try {
            _playground.ps.ui.getScaleFactor("some value");
        } catch (err) {
            result = err;
        }

        ok(result !== undefined, "missing notifier exception");
    });

    /* _playground.ps.ui.widgetTypes constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.ps.ui.widgetTypes constants object", function () {
        ok(typeof _playground.ps.ui.widgetTypes === "object",
            "_playground.ps.ui.widgetTypes defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING widgetTypes PROPERTIES!
        var expectedSize = 7;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.widgetTypes).length;
        strictEqual(actualSize, expectedSize, "_playground.ps.ui.widgetTypes size");
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

    /* _playground.ps.ui.setWidgetTypeVisibility()
     * Validates: defined, type
     * See blackbox-tests.js for interactive testing control
     */
    test("_playground.ps.ui.setWidgetTypeVisibility() function defined", function () {
        ok(typeof _playground.ps.ui.setWidgetTypeVisibility === "function",
            "_playground.ps.ui.setWidgetTypeVisibility function defined");
    });

    /* _playground.ps.ui.pointerPropagationMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.ps.ui.pointerPropagationMode constants object", function () {
        ok(typeof _playground.ps.ui.pointerPropagationMode === "object",
            "_playground.ps.ui.pointerPropagationMode defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING pointerPropagationMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.pointerPropagationMode).length;
        strictEqual(actualSize, expectedSize, "_playground.ps.ui.pointerPropagationMode size");
        // constants
        ok(typeof _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE === "number",
            "_playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE");
        ok(typeof _playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE === "number",
            "_playground.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE === "number",
            "_playground.ps.ui.pointerPropagationMode.NEVER_PROPAGATE");
    });

    /* _playground.ps.ui.getPointerPropagationMode()
     * Validates: Functional: simple call, and return value.
     * Does not assert what the value should specifically be, only that it be
     * among a range of possible values.
     */
    asyncTest("_playground.ps.ui.getPointerPropagationMode() functional", function () {
        expect(3);

        ok(typeof _playground.ps.ui.getPointerPropagationMode === "function",
            "_playground.ps.ui.getPointerPropagationMode() function defined");

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

    /* _playground.ps.ui.setPointerPropagationMode()
     * Validates: Functional: simple set call, err result.
     * TODO: Could be improved by getting initial/set to new/get of that/set back
     */
    asyncTest("_playground.ps.ui.setPointerPropagationMode() functional", function () {
        expect(2);

        ok(typeof _playground.ps.ui.setPointerPropagationMode === "function",
            "_playground.ps.ui.setPointerPropagationMode() function defined");

        var options = {
            defaultMode: _playground.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE
        };

        _playground.ps.ui.setPointerPropagationMode(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    /* _playground.ps.ui.PolicyAction constants object
     * Only valid for Mac
     * Validates: defined, type, number of elements, their type, ref by name
     */
    if (navigator.platform === "MacIntel") {
        test("_playground.ps.ui.PolicyAction constants object", function () {
            ok(typeof _playground.ps.ui.PolicyAction === "object",
                "_playground.ps.ui.PolicyAction defined");
            // CHANGE THIS VALUE WHEN ADDING OR REMOVING PolicyAction PROPERTIES!
            var expectedSize = 3;
            var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.PolicyAction).length;
            strictEqual(actualSize, expectedSize, "_playground.ps.ui.PolicyAction size");
            // constants
            ok(typeof _playground.ps.ui.PolicyAction.ALPHA_PROPAGATE === "number",
                "_playground.ps.ui.PolicyAction.ALPHA_PROPAGATE");
            ok(typeof _playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE === "number",
                "_playground.ps.ui.PolicyAction.ALWAYS_PROPAGATE");
            ok(typeof _playground.ps.ui.PolicyAction.NEVER_PROPAGATE === "number",
                "_playground.ps.ui.PolicyAction.NEVER_PROPAGATE");
        });
    }

    /* _playground.ps.ui.keyboardPropagationMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.ps.ui.keyboardPropagationMode constants object", function () {
        ok(typeof _playground.ps.ui.keyboardPropagationMode === "object",
            "_playground.ps.ui.keyboardPropagationMode defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING keyboardPropagationMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.keyboardPropagationMode).length;
        strictEqual(actualSize, expectedSize, "_playground.ps.ui.keyboardPropagationMode size");
        // constants
        ok(typeof _playground.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE === "number",
            "_playground.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE");
        ok(typeof _playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE === "number",
            "_playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE === "number",
            "_playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE");
    });

    /* _playground.ps.ui.setKeyboardPropagationMode()
     * Validates: defined, type
     */
    test("_playground.ps.ui.setKeyboardPropagationMode() function defined", function () {
        ok(typeof _playground.ps.ui.setKeyboardPropagationMode === "function",
            "_playground.ps.ui.setKeyboardPropagationMode() function defined");
    });

    /* _playground.ps.ui.getKeyboardPropagationMode()
     * Validates: defined, type
     */
    test("_playground.ps.ui.getKeyboardPropagationMode() function defined", function () {
        ok(typeof _playground.ps.ui.getKeyboardPropagationMode === "function",
            "_playground.ps.ui.getKeyboardPropagationMode() function defined");
    });

    /* _playground.ps.ui.setKeyboardEventPropagationPolicy()
     * Validates: defined, type
     */
    test("_playground.ps.ui.setKeyboardEventPropagationPolicy() function defined", function () {
        ok(typeof _playground.ps.ui.setKeyboardEventPropagationPolicy === "function",
            "_playground.ps.ui.setKeyboardEventPropagationPolicy() function defined");
    });

    /* _playground.ps.ui.getKeyboardEventPropagationPolicy()
     * Validates: defined, type
     * NOT YET DEFINED (COMMENTED OUT IN PlaygroundExtension.js)
     * UNCOMMENT WHEN IT IS.
     */
    // test("_playground.ps.ui.getKeyboardEventPropagationPolicy() function defined", function () {
    //     ok(typeof _playground.ps.ui.getKeyboardEventPropagationPolicy === "function",
    //        "_playground.ps.ui.getKeyboardEventPropagationPolicy() function defined");
    // });

    /* _playground.ps.ui.setKeyboardEventPropagationPolicy()
     * Functional: negative, empty options
     */
    asyncTest("_playground.ps.ui.setPointerEventPropagationPolicy(): negative:  with empty options", function () {
        expect(1);

        var options = {};
        _playground.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err, _playground.errorCodes.UNKNOWN_ERROR);

            start();
        });
    });

    /* _playground.ps.ui.setKeyboardEventPropagationPolicy()
     * Functional: negative, empty policy
     */
    asyncTest("_playground.ps.ui.setPointerEventPropagationPolicy(): negative, empty policy", function () {
        expect(1);

        var options = { policyList: [] };
        _playground.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    /* _playground.ps.ui.overscrollMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.ps.ui.overscrollMode constants object", function () {
        ok(typeof _playground.ps.ui.overscrollMode === "object",
            "_playground.ps.ui.overscrollMode defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING overscrollMode PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.ps.ui.overscrollMode).length;
        strictEqual(actualSize, expectedSize, "_playground.ps.ui.overscrollMode size");
        // constants
        ok(typeof _playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL === "number",
            "_playground.ps.ui.overscrollMode.NORMAL_OVERSCROLL");
        ok(typeof _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL === "number",
            "_playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL");
        ok(typeof _playground.ps.ui.overscrollMode.NEVER_OVERSCROLL === "number",
            "_playground.ps.ui.overscrollMode.NEVER_OVERSCROLL");
    });

    /* _playground.ps.ui.getOverscrollMode(), simple functional
     * Validates: Functional: simple call, and return value.
     */
    asyncTest("_playground.ps.ui.getOverscrollMode() functional", function () {
        expect(3);

        ok(typeof _playground.ps.ui.getOverscrollMode === "function",
             "_playground.ps.ui.getOverscrollMode() function defined");

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

    /* _playground.ps.ui.setOverscrollMode(), simple functional
     * Validates: Functional: simple call, and return value.
     * TODO: Could be expanded to do get (initial)/set (new)/get (validate)/set (init)
     */
    asyncTest("_playground.ps.ui.setOverscrollMode() functional", function () {
        expect(2);

        ok(typeof _playground.ps.ui.setOverscrollMode === "function",
             "_playground.ps.ui.setOverscrollMode() function defined");

        var options = {
            mode: _playground.ps.ui.overscrollMode.ALWAYS_OVERSCROLL
        };

        _playground.ps.ui.setOverscrollMode(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    // --------------------- Scrollbar tests ---------------------

    /* _playground.ps.ui.getSuppressScrollbars()
     * Functional: Get the scrollbar mode. While it is initialized to false, at this
     * point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_playground.ps.ui.getSuppressScrollbars() functional", function () {
        expect(3);

        ok(typeof _playground.ps.ui.getSuppressScrollbars === "function",
             "_playground.ps.ui.getSuppressScrollbars() function defined");

        _playground.ps.ui.getSuppressScrollbars(function (err, value) {
            _validateNotifierResult(err);

            strictEqual(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    /* _playground.ps.ui.setSuppressScrollbars()
     * Functional: Set the scrollbar mode. When set the old value is returned.
     * The First value sets the scrollbar to true, the second to false
     */
    asyncTest("_playground.ps.ui.setSuppressScrollbars() functional", function () {
        expect(3);

        ok(typeof _playground.ps.ui.setSuppressScrollbars === "function",
             "_playground.ps.ui.setSuppressScrollbars() function defined");

        _playground.ps.ui.setSuppressScrollbars(true, function (err, previousValue) {
            _validateNotifierResult(err);

            strictEqual(typeof previousValue, "boolean", "Result is a boolean");

            // reset the scrollbar value
            _playground.ps.ui.setSuppressScrollbars(previousValue, function () { });

            start();
        });
    });

    /* Get/set the scrollbar mode. Confirms the "symmetry" of get/set.
     * While it is initialized to false, at this point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_playground.ps.ui.setSuppressScrollbars() get/set", function () {
        expect(11);

        // Initial get of startValue
        _playground.ps.ui.getSuppressScrollbars(function (err, startValue) {
            _validateNotifierResult(err);
            strictEqual(typeof startValue, "boolean", "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _playground.ps.ui.setSuppressScrollbars(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                strictEqual(typeof previousValue, "boolean", "Result is a boolean");
                strictEqual(previousValue, startValue, "previousValue returned by set should equal prior get value");

                // get to confirm set
                _playground.ps.ui.getSuppressScrollbars(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(newValue, !startValue, "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _playground.ps.ui.setSuppressScrollbars(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue, !startValue,
                                    "previousValue returned by set should equal prior get value");

                        // get to confirm set
                        _playground.ps.ui.getSuppressScrollbars(function (err, endValue) {
                            _validateNotifierResult(err);
                            strictEqual(endValue, startValue, "endValue (on get) should equal the startValue");

                            start();
                        });
                    });
                });
            });
        });
    });

    // --------------------- Menu tests ---------------------

    /* _playground.ps.ui.installMenu()
     * Validates: defined, type
     */
    test("_playground.ps.ui.installMenu() function defined", function () {
        ok(typeof _playground.ps.ui.installMenu === "function",
             "_playground.ps.ui.installMenu() function defined");
    });


    // -------------------------- _playground.os ------------------------------

    /* _playground.os property/object
     * Validates: defined, type
     */
    test("_playground.os property defined, type", function () {
        ok(!!_playground.os, "_playground.os property defined");
        ok(typeof _playground.os === "object", "_playground.os property type");
    });

    /* _playground.os.eventKind constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.os.eventKind constants object", function () {
        ok(typeof _playground.os.eventKind === "object",
            "_playground.os.eventKind defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING eventKind PROPERTIES!
        var expectedSize = 3;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventKind).length;
        strictEqual(actualSize, expectedSize, "_playground.os.eventKind size");
        // constants
        ok(typeof _playground.os.eventKind.LEFT_MOUSE_DOWN === "number",
            "_playground.os.eventKind.LEFT_MOUSE_DOWN");
        ok(typeof _playground.os.eventKind.KEY_DOWN === "number",
            "_playground.os.eventKind.KEY_DOWN");
        ok(typeof _playground.os.eventKind.KEY_UP === "number",
            "_playground.os.eventKind.KEY_UP");
    });

    /* _playground.os.eventModifiers constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.os.eventModifiers constants object", function () {
        ok(typeof _playground.os.eventModifiers === "object",
            "_playground.os.eventModifiers defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING eventModifiers PROPERTIES!
        var expectedSize = 5;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventModifiers).length;
        strictEqual(actualSize, expectedSize, "_playground.os.eventModifiers size");
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

    /* _playground.os.eventKeyCode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.os.eventKeyCode constants object", function () {
        ok(typeof _playground.os.eventKeyCode === "object",
            "_playground.os.eventKeyCode defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING eventKeyCode PROPERTIES!
        var expectedSize = 31;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventKeyCode).length;
        strictEqual(actualSize, expectedSize, "_playground.os.eventKeyCode size");
        // constants
        ok(typeof _playground.os.eventKeyCode.NONE === "number",
            "_playground.os.eventKeyCode.NONE");
        ok(typeof _playground.os.eventKeyCode.BACKSPACE === "number",
            "_playground.os.eventKeyCode.BACKSPACE");
        ok(typeof _playground.os.eventKeyCode.TAB === "number",
            "_playground.os.eventKeyCode.TAB");
        ok(typeof _playground.os.eventKeyCode.ENTER === "number",
            "_playground.os.eventKeyCode.ENTER");
        ok(typeof _playground.os.eventKeyCode.ESCAPE === "number",
            "_playground.os.eventKeyCode.ESCAPE");
        ok(typeof _playground.os.eventKeyCode.SPACE === "number",
            "_playground.os.eventKeyCode.SPACE");
        ok(typeof _playground.os.eventKeyCode.PAGE_UP === "number",
            "_playground.os.eventKeyCode.PAGE_UP");
        ok(typeof _playground.os.eventKeyCode.PAGE_DOWN === "number",
            "_playground.os.eventKeyCode.PAGE_DOWN");
        ok(typeof _playground.os.eventKeyCode.END === "number",
            "_playground.os.eventKeyCode.END");
        ok(typeof _playground.os.eventKeyCode.HOME === "number",
            "_playground.os.eventKeyCode.HOME");
        ok(typeof _playground.os.eventKeyCode.ARROW_LEFT === "number",
            "_playground.os.eventKeyCode.ARROW_LEFT");
        ok(typeof _playground.os.eventKeyCode.ARROW_UP === "number",
            "_playground.os.eventKeyCode.ARROW_UP");
        ok(typeof _playground.os.eventKeyCode.ARROW_RIGHT === "number",
            "_playground.os.eventKeyCode.ARROW_RIGHT");
        ok(typeof _playground.os.eventKeyCode.ARROW_DOWN === "number",
            "_playground.os.eventKeyCode.ARROW_DOWN");
        ok(typeof _playground.os.eventKeyCode.INSERT === "number",
            "_playground.os.eventKeyCode.INSERT");
        ok(typeof _playground.os.eventKeyCode.DELETE === "number",
            "_playground.os.eventKeyCode.DELETE");
        ok(typeof _playground.os.eventKeyCode.WIN_LEFT === "number",
            "_playground.os.eventKeyCode.WIN_LEFT");
        ok(typeof _playground.os.eventKeyCode.WIN_RIGHT === "number",
            "_playground.os.eventKeyCode.WIN_RIGHT");
        ok(typeof _playground.os.eventKeyCode.WIN_MENU === "number",
            "_playground.os.eventKeyCode.WIN_MENU");
        ok(typeof _playground.os.eventKeyCode.KEY_F1 === "number",
            "_playground.os.eventKeyCode.KEY_F1");
        ok(typeof _playground.os.eventKeyCode.KEY_F2 === "number",
            "_playground.os.eventKeyCode.KEY_F2");
        ok(typeof _playground.os.eventKeyCode.KEY_F3 === "number",
            "_playground.os.eventKeyCode.KEY_F3");
        ok(typeof _playground.os.eventKeyCode.KEY_F4 === "number",
            "_playground.os.eventKeyCode.KEY_F4");
        ok(typeof _playground.os.eventKeyCode.KEY_F5 === "number",
            "_playground.os.eventKeyCode.KEY_F5");
        ok(typeof _playground.os.eventKeyCode.KEY_F6 === "number",
            "_playground.os.eventKeyCode.KEY_F6");
        ok(typeof _playground.os.eventKeyCode.KEY_F7 === "number",
            "_playground.os.eventKeyCode.KEY_F7");
        ok(typeof _playground.os.eventKeyCode.KEY_F8 === "number",
            "_playground.os.eventKeyCode.KEY_F8");
        ok(typeof _playground.os.eventKeyCode.KEY_F9 === "number",
            "_playground.os.eventKeyCode.KEY_F9");
        ok(typeof _playground.os.eventKeyCode.KEY_F10 === "number",
            "_playground.os.eventKeyCode.KEY_F10");
        ok(typeof _playground.os.eventKeyCode.KEY_F11 === "number",
            "_playground.os.eventKeyCode.KEY_F11");
        ok(typeof _playground.os.eventKeyCode.KEY_F12 === "number",
            "_playground.os.eventKeyCode.KEY_F12");
    });

    /* _playground.os.notifierKind constants object
     * (renamed from DEPRECATED _playground.os.eventTypes)
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.os.notifierKind constants object", function () {
        ok(typeof _playground.os.notifierKind === "object",
            "_playground.os.notifierKind defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING notifierKind PROPERTIES!
        var expectedSize = 7;
        var actualSize = Object.getOwnPropertyNames(_playground.os.notifierKind).length;
        strictEqual(actualSize, expectedSize, "_playground.os.notifierKind size");
        // constants
        ok(typeof _playground.os.notifierKind.MOUSE_CAPTURE_LOST === "string",
            "_playground.os.notifierKind.MOUSE_CAPTURE_LOST");
        ok(typeof _playground.os.notifierKind.ACTIVATION_CHANGED === "string",
            "_playground.os.notifierKind.ACTIVATION_CHANGED");
        ok(typeof _playground.os.notifierKind.KEYBOARDFOCUS_CHANGED === "string",
            "_playground.os.notifierKind.KEYBOARDFOCUS_CHANGED");
        ok(typeof _playground.os.notifierKind.EXTERNAL_MOUSE_DOWN === "string",
            "_playground.os.notifierKind.EXTERNAL_MOUSE_DOWN");
        ok(typeof _playground.os.notifierKind.EXTERNAL_KEYEVENT === "string",
            "_playground.os.notifierKind.EXTERNAL_KEYEVENT");
        ok(typeof _playground.os.notifierKind.TOUCH === "string",
            "_playground.os.notifierKind.TOUCH");
        ok(typeof _playground.os.notifierKind.CONVERTIBLE_SLATE_MODE_CHANGED === "string",
            "_playground.os.notifierKind.CONVERTIBLE_SLATE_MODE_CHANGED");
    });

    /* _playground.os.registerEventListener()
     * Validates: defined, type
     */
    test("_playground.os.registerEventListener() defined", function () {
        ok(typeof _playground.os.registerEventListener === "function",
            "_playground.os.registerEventListener function defined");
    });

    /* _playground.os.registerEventListener()
     * Validates: defined, type
     */
    test("_playground.os.unRegisterEventListener() defined", function () {
        ok(typeof _playground.os.unRegisterEventListener === "function",
            "_playground.os.unRegisterEventListener function defined");
    });

    /* _playground.os.postEvent()
     * Validates: defined, type
     */
    test("_playground.os.postEvent() defined", function () {
        ok(typeof _playground.os.postEvent === "function",
            "_playground.os.postEvent function defined");
    });

    /* _playground.os.keyboardFocus property
     * Validates: defined, type
     */
    test("_playground.os.keyboardFocus defined", function () {
        ok(typeof _playground.os.keyboardFocus === "object",
            "_playground.os.keyboardFocus property defined");
    });

    /* _playground.os.keyboardFocus.acquire()
     * Validates: defined, type
     */
    test("_playground.os.keyboardFocus.acquire() defined", function () {
        ok(typeof _playground.os.keyboardFocus.acquire === "function",
            "_playground.os.keyboardFocus.acquire() function defined");
    });

    /* _playground.os.keyboardFocus.release()
     * Validates: defined, type
     */
    test("_playground.os.keyboardFocus.release() defined", function () {
        ok(typeof _playground.os.keyboardFocus.release === "function",
            "_playground.os.keyboardFocus.release() function defined");
    });

    /* _playground.os.keyboardFocus.isActive()
     * Validates: defined, type
     */
    test("_playground.os.keyboardFocus.isActive() defined", function () {
        ok(typeof _playground.os.keyboardFocus.isActive === "function",
            "_playground.os.keyboardFocus.isActive() function defined");
    });

    /* _playground.os.keyboardFocus.isActive()
     * Functional: Call, validate return value type, err check.
     */
    asyncTest("_playground.os.keyboardFocus.isActive() functional", function () {
        expect(2);
        // options param/arg is currently unused
        _playground.os.keyboardFocus.isActive({}, function (err, value) {
            _validateNotifierResult(err);
            strictEqual(typeof value, "boolean", "value type");
            console.info("_playground.os.keyboardFocus.isActive():", value);
            start();
        });
    });

    // --------------------- ConvertibleSlateMode tests ---------------------

    /* _playground.os.keyboardFocus.isConvertibleSlateMode()
     * Functional: Call, validate return value type, err check.
     */
    asyncTest("_playground.os.isConvertibleSlateMode() functional", function () {
        expect(3);

        ok(typeof _playground.os.isConvertibleSlateMode === "function",
            "_playground.os.isConvertibleSlateMode() function defined");

        _playground.os.isConvertibleSlateMode(function (err, value) {
            _validateNotifierResult(err);

            strictEqual(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    // no test for setting this property, it is read-only.
});
