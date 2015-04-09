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

/* global _spaces, module, console, performance, define */
/* global test, asyncTest, expect, start, ok, strictEqual, deepEqual */
/* jshint unused:false */

define(function () {
    "use strict";

    module("low-level");

    // VALIDATION HELPERS
    // ------------------

    /**
     * Validates the returned err/result value returned in an API function callback
     * This validator should not be used where an error is expected (e.g. in a negative test)
     * because a test failure is triggered on a failing result.
     *
     * NOTE: A single QUnit validation is always executed here. Be sure to
     * account for that in your 'expected' validation count in asyncTests.
     *
     * @private
     * @param {Error=} err
     */
    var _validateNotifierResult = function (err) {
        // Acceptable success codes are: undefined, or an object with a
        // number property that has the value 0

        var fPass = false;
        var logstr;
        do {
            if (err === undefined) {
                fPass = true;
                logstr = "err === undefined: OK / succeeded";
                break;
            }
            if (err === null) {
                logstr = "err is null";
                break;
            }
            if (! err instanceof Error) {
                logstr = "err is not a proper Error object";
                break;
            }
            if (err.number === undefined) {
                logstr = "malformed Error object: has no 'number' property";
                break;
            }
            if (err.number === 0) {
                fPass = true;
                logstr = "err.number == 0: OK / succeeded";
                break;
            }
            if (err.message !== undefined)
            {
                logstr = "err.message: '" + err.message + "'";
            } else {
                logstr = "NO ERROR MESSAGE PROVIDED";
            }
        } while (0);
        if (! fPass) {
            console.error("_validateNotifierResult FAIL:", logstr);
        }
        ok(fPass, logstr);
    };

    /**
     * Validates that the returned result-value is an Error object containing
     * number and message properties. Other properties are possible too. This
     * is used in negative tests to confirm an error with the proper/expected
     * form is returned. Note there is no specific validation of the error's
     * 'message' property, only its (errorCode) value. Validate the 'message'
     * value as needed in the test case code.
     *
     * NOTE: A single QUnit validation is always executed here. Be sure to
     * account for that in your 'expected' validation count in asyncTests.
     *
     * @private
     * @param {Error=} err
     * @param {number=} expectedErrorCode
     */
    var _validateNotifierResultError = function (err, expectedErrorCode) {

        var fValidForm = false;
        var logstr;
        do {
            if (err === undefined) {
                logstr = "err should not be undefined when an error is expected";
                break;
            }
            if (! (err instanceof Error)) {
                logstr = "err object is not an instance of the Error object" + err;
                break;
            }
            if (err.number === undefined) {
                logstr = "err.number is not defined";
                break;
            }
            if (typeof err.number !== "number") {
                logstr = "err.number is not a numeric value";
                break;
            }
            if (err.message === undefined) {
                logstr = "err.message is not defined";
                break;
            }
            if (typeof err.message !== "string") {
                logstr = "err.message is not a string";
                break;
            }
            fValidForm = true;
        } while (false);

        // if the err object has a valid form, then validate the error value
        if (fValidForm) {
            strictEqual(err.number, expectedErrorCode, "err.number compared to expected");
        } else {
            ok(false, logstr);
        }
    };

    // -------------------------------------------------------------------------
    // TESTS
    // -------------------------------------------------------------------------

    // ----------------------------- _spaces -----------------------------------

    /* _spaces object
     * Validates: defined, type
     */
    test("_spaces object defined, type", function () {
        ok(!!_spaces, "_spaces defined");
        ok(typeof _spaces === "object", "_spaces type");
    });

    /* _spaces.version Object property
     * Validates: defined, type, member names and types
     * Form: {"major": n, "minor": n, "patch": n}
     */
    test("_spaces.version Object property: defined, type, member names and types", function () {
        ok(_spaces.hasOwnProperty("version"), "_spaces object should have a 'version' property");
        ok(typeof _spaces.version === "object", "_spaces.version type");
        strictEqual(Object.keys(_spaces.version).length, 3, "_spaces.version should have 3 properties");
        strictEqual(typeof _spaces.version.major, "number", "version.major type should be 'number'");
        ok(_spaces.version.major >= 0, "version.major value should be >= 0");
        strictEqual(typeof _spaces.version.minor, "number", "version.minor type should be 'number'");
        ok(_spaces.version.minor >= 0, "version.minor value should be >= 0");
        strictEqual(typeof _spaces.version.patch, "number", "version.patch type should be 'number'");
        ok(_spaces.version.patch >= 0, "version.patch value should be >= 0");
    });

    /* _spaces.errorCodes constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.errorCodes constants object", function () {
        ok(typeof _spaces.errorCodes === "object", "_spaces.errorCodes defined");
        // constants
        ok(typeof _spaces.errorCodes.NO_ERROR === "number",
            "_spaces.errorCodes.NO_ERROR");
        ok(typeof _spaces.errorCodes.UNKNOWN_ERROR === "number",
            "_spaces.errorCodes.UNKNOWN_ERROR");
        ok(typeof _spaces.errorCodes.CANT_DISPATCH_MESSAGE_TO_HOST === "number",
            "_spaces.errorCodes.CANT_DISPATCH_MESSAGE_TO_HOST");
        ok(typeof _spaces.errorCodes.ARGUMENT_ERROR === "number",
            "_spaces.errorCodes.ARGUMENT_ERROR");
        ok(typeof _spaces.errorCodes.MISSING_NOTIFIER === "number",
            "_spaces.errorCodes.MISSING_NOTIFIER");
        ok(typeof _spaces.errorCodes.REQUEST_REJECTED === "number",
            "_spaces.errorCodes.REQUEST_REJECTED");
        ok(typeof _spaces.errorCodes.CONVERSION_ERROR === "number",
            "_spaces.errorCodes.CONVERSION_ERROR");
        ok(typeof _spaces.errorCodes.UNKNOWN_FUNCTION_ERROR === "number",
            "_spaces.errorCodes.UNKNOWN_FUNCTION_ERROR");
        ok(typeof _spaces.errorCodes.SUITEPEA_ERROR === "number",
            "_spaces.errorCodes.SUITEPEA_ERROR");
        ok(typeof _spaces.errorCodes.REENTRANCY_ERROR === "number",
            "_spaces.errorCodes.REENTRANCY_ERROR");
    });

    /* _spaces.notifierGroup constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.notifierGroup constants object", function () {
        ok(typeof _spaces.notifierGroup === "object", "_spaces.notifierGroup defined");
        // constants
        ok(typeof _spaces.notifierGroup.PHOTOSHOP === "string",
            "_spaces.notifierGroup.PHOTOSHOP");
        ok(typeof _spaces.notifierGroup.OS === "string",
            "_spaces.notifierGroup.OS");
        ok(typeof _spaces.notifierGroup.MENU === "string",
            "_spaces.notifierGroup.MENU");
        ok(typeof _spaces.notifierGroup.INTERACTION === "string",
            "_spaces.notifierGroup.INTERACTION");
        ok(typeof _spaces.notifierGroup.TOUCH === "string",
            "_spaces.notifierGroup.TOUCH");
    });

    /* _spaces.setNotifier() function
     * Validates: defined, type
     */
    test("_spaces.setNotifier function defined", function () {
        ok(typeof _spaces.setNotifier === "function",
            "_spaces.setNotifier function defined");
    });

    /* _spaces.notifierOptions.interaction constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.notifierOptions.interaction constants object", function () {
        ok(typeof _spaces.notifierOptions.interaction === "object",
           "_spaces.notifierOptions.interaction defined");
        // constants
        ok(typeof _spaces.notifierOptions.interaction.PROGRESS === "number",
            "_spaces.notifierOptions.interaction.PROGRESS");
        ok(typeof _spaces.notifierOptions.interaction.ERROR === "number",
            "_spaces.notifierOptions.interaction.ERROR");
        ok(typeof _spaces.notifierOptions.interaction.OPTIONS === "number",
            "_spaces.notifierOptions.interaction.OPTIONS");
        ok(typeof _spaces.notifierOptions.interaction.CONTEXT === "number",
            "_spaces.notifierOptions.interaction.CONTEXT");
        ok(typeof _spaces.notifierOptions.interaction.USER === "number",
            "_spaces.notifierOptions.interaction.USER");
    });

    /* _spaces.setNotifier() functional, set/reset for _spaces.notifierGroup.PHOTOSHOP
     * Validates: calls for set/reset
     * These tests don't attempt to cause the event to fire, but simply call setNotifier
     * with a valid "set" inputs and then a "reset" input (callback arg == undefined)
     * Unfortunately, without triggering a callback, there isn't anything to validate
     * other than an exception isn't thrown.
     * SEE: Adapter API Blackbox Tests for coverage for this area to observe actual notifications occurring.
     */

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.PHOTOSHOP", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.PHOTOSHOP;
        var options = {};
        _spaces.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResult(err);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.OS", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.OS;
        var options = {};
        _spaces.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResult(err);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.MENU", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.MENU;
        var options = {};
        _spaces.setNotifier(notifierGroup, options, function (err, menuCommand, info) {
            _validateNotifierResult(err);
            strictEqual(menuCommand, undefined, "callback menuCommand arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.ERROR", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.INTERACTION;
        var options = {"notificationKind": _spaces.notifierOptions.interaction.ERROR};
        _spaces.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.PROGRESS", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.INTERACTION;
        var options = {"notificationKind": _spaces.notifierOptions.interaction.PROGRESS};
        _spaces.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.OPTIONS", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.INTERACTION;
        var options = {"notificationKind": _spaces.notifierOptions.interaction.OPTIONS};
        _spaces.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_spaces.setNotifier() functional: set/reset for _spaces.notifierGroup.CONTEXT", function () {
        expect(3);
        var notifierGroup = _spaces.notifierGroup.INTERACTION;
        var options = {"notificationKind": _spaces.notifierOptions.interaction.CONTEXT};
        _spaces.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _spaces.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

// tburbage (2015/01/28): FAIL, BUT NEED REVIEW
if (0) {
    /* _spaces.setNotifier() functional/negative: set with invalid notifierGroup string
     * Validates: error handling on invalid input
     */
    asyncTest("_spaces.setNotifier() functional/negative: set with invalid notifierGroup string value", function () {
        expect(3);
        var notifierGroup = ""; // not a valid notifierGroup string value
        var options = {};
        _spaces.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            start();
        });
    });
} // if (0)


// tburbage (2015/01/28): FAIL, BUT NEED REVIEW
if (0) {
    /* _spaces.setNotifier() functional/negative: set with undefined notifierGroup
     * Validates: error handling on invalid input
     */
    asyncTest("_spaces.setNotifier() functional/negative: set with undefined notifierGroup", function () {
        expect(3);
        var notifierGroup; // undefined not a valid notifierGroup string value
        var options = {};
        _spaces.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            start();
        });
    });
} // if (0)

    /* _spaces.setNotifier() functional/negative: invalid input AND undefined callback
     * Validates: A JavaScript exception should be thrown in this case
     */
    test("_spaces.setNotifier() functional/negative: set with invalid input AND undefined callback", function () {
        var exceptionThrown = false;
        try {
            _spaces.setNotifier(undefined, undefined, undefined);
        } catch (err) {
            exceptionThrown = true;

        }
        ok(exceptionThrown, "Expect native Javascript exception to be thrown");
    });


    // ------------------------- Properties: get/set -------------------------------

    /* _spaces.getPropertyValue() function, simple get: 'ui.tooltip.delay.coldToHot'
     * Validates: defined, type, simple get call and callback
     * 2015/01/14: ui.tooltip.delay.coldToHot initial value: 0.1
     */
    asyncTest("_spaces.getPropertyValue(): 'ui.tooltip.delay.coldToHot'", function () {
        expect(5);
        ok(!!_spaces.getPropertyValue, "_spaces.getPropertyValue() defined");
        ok(typeof _spaces.getPropertyValue === "function", "_spaces.getPropertyValue() type");
        _spaces.getPropertyValue("ui.tooltip.delay.coldToHot", {}, function (err, propertyValue) {
            _validateNotifierResult(err);
            ok(propertyValue >= 0.0, "initial value expected to be >= 0.0");
            strictEqual("number", typeof propertyValue, "'propertyValue' arg type should be 'number'");
            start();
        });
    });

    /* _spaces.setPropertyValue() function, simple set: 'ui.tooltip.delay.coldToHot'
     * Validates: defined, type, simple set call and callback
     */
    asyncTest("_spaces.setPropertyValue(): 'ui.tooltip.delay.coldToHot'", function () {
        expect(3);
        ok(!!_spaces.setPropertyValue, "_spaces.setPropertyValue() defined");
        ok(typeof _spaces.setPropertyValue === "function", "_spaces.setPropertyValue() type");
        _spaces.setPropertyValue("ui.tooltip.delay.coldToHot", 0.1, {}, function (err) {
            _validateNotifierResult(err);
            start();
        });
    });

    /* _spaces.getPropertyValue() function, simple get: 'ui.tooltip.delay.coldToHot'
     * Validates:
     * - get initial, compare to expected default value
     * - set to new positive value
     * - get to validate positive value set
     * - set to default
     * - final get to validate set to default
     * 2015/01/14: ui.tooltip.delay.coldToHot initial value: 0.1
     */
    asyncTest("get/set property value: functional: ui.tooltip.delay.coldToHot", function () {
        expect(7);
        var propertyName = "ui.tooltip.delay.coldToHot";
        var expectedDefaultValue = 0.1;
        var setNewValue = 0.5;
        // options parameter for both getPropertyValue() and setPropertyValue() are currently unused
        var getOptions = {};
        var setOptions = {};
        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _spaces.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _spaces.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _spaces.getPropertyValue() function, simple get: 'ui.tooltip.delay.hotToHot'
     * Validates:
     * - get initial, compare to expected default value
     * - set to new positive value
     * - get to validate positive value set
     * - set to default
     * - final get to validate set to default
     * 2015/01/14: ui.tooltip.delay.hotToHot initial value: 0.15
     */
    asyncTest("get/set property value: functional: ui.tooltip.delay.hotToHot", function () {
        expect(7);
        var propertyName = "ui.tooltip.delay.hotToHot";
        var expectedDefaultValue = 0.15;
        var setNewValue = 0.5;
        // options parameter for both getPropertyValue() and setPropertyValue() are currently unused
        var getOptions = {};
        var setOptions = {};
        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _spaces.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _spaces.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _spaces.getPropertyValue() function, simple get: 'ui.tooltip.delay.hotToCold'
     * Validates:
     * - get initial, compare to expected default value
     * - set to new positive value
     * - get to validate positive value set
     * - set to default
     * - final get to validate set to default
     * 2015/01/14: ui.tooltip.delay.hotToCold initial value: 0.25
     */
    asyncTest("get/set property value: functional: ui.tooltip.delay.hotToCold", function () {
        expect(7);
        var propertyName = "ui.tooltip.delay.hotToCold";
        var expectedDefaultValue = 0.25;
        var setNewValue = 0.5;
        // options parameter for both getPropertyValue() and setPropertyValue() are currently unused
        var getOptions = {};
        var setOptions = {};
        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _spaces.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _spaces.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _spaces.getPropertyValue() function, simple get: 'ui.tooltip.delay.autoHide'
     * Validates:
     * - get initial, compare to expected default value
     * - set to new positive value
     * - get to validate positive value set
     * - set to 0, while the implementation treats as "autoHide disabled"
     * - get to validate "disabled" value set
     * - set to default,
     * - final get to validate set to default
     * 2015/01/14: ui.tooltip.delay.autoHide initial value: 10
     */
    asyncTest("get/set property value: functional: ui.tooltip.delay.autoHide", function () {
        expect(9);
        var propertyName = "ui.tooltip.delay.autoHide";
        var expectedDefaultValue = 10;
        var setNewPositiveValue = 1.5;
        var setToDisabledStateValue = 0;
        // options parameter for both getPropertyValue() and setPropertyValue() are currently unused
        var getOptions = {};
        var setOptions = {};
        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            // console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new positive value
            _spaces.setPropertyValue(propertyName, setNewPositiveValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewPositiveValue
                    strictEqual(propValue, setNewPositiveValue, "value after set to new positive value");
                    // set to setToDisabledStateValue value
                    _spaces.setPropertyValue(propertyName, setToDisabledStateValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for set to setToDisabledStateValue value
                            strictEqual(propValue, setToDisabledStateValue, "value after set to setToDisabledStateValue");
                            _spaces.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                                _validateNotifierResult(err);
                                _spaces.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                                    // callback for final set back to expectedDefaultValue
                                    strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                                    start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    /* _spaces.getPropertyValue() function: negative: undefined propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.getPropertyValue(): negative: undefined propertyName arg", function () {
        expect(1);
        _spaces.getPropertyValue(undefined, {}, function (err, propertyValue) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.getPropertyValue() function: negative: invalid propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.getPropertyValue(): negative: invalid propertyName arg", function () {
        expect(1);
        _spaces.getPropertyValue("does_not_exist", {}, function (err, propertyValue) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _spaces.getPropertyValue() function: negative: undefined options arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.getPropertyValue(): negative: undefined options arg", function () {
        expect(1);
        _spaces.getPropertyValue("ui.tooltip.delay.autoHide", undefined, function (err, propertyValue) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.setPropertyValue() function: negative: undefined propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.setPropertyValue(): negative: undefined propertyName arg", function () {
        expect(1);
        _spaces.setPropertyValue(undefined, 1.0, {}, function (err) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.setPropertyValue() function: negative: invalid propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.setPropertyValue(): negative: invalid propertyName arg", function () {
        expect(1);
        _spaces.setPropertyValue("does_not_exist", 1.0, {}, function (err) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _spaces.setPropertyValue() function: negative: undefined propertyValue arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.setPropertyValue(): negative: undefined propertyValue arg", function () {
        expect(1);
        _spaces.setPropertyValue("ui.tooltip.delay.autoHide", undefined, {}, function (err) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.setPropertyValue() function: negative: invalid propertyValue arg
     * Validates: Negative input handling. A valid 'ui.tooltip.delay.hotToCold' value is >0
     */
    asyncTest("_spaces.setPropertyValue(): negative: invalid propertyValue arg", function () {
        expect(1);
        _spaces.setPropertyValue("ui.tooltip.delay.hotToCold", -1.0, {}, function (err) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _spaces.setPropertyValue() function: negative: undefined options arg
     * Validates: Negative input handling
     */
    asyncTest("_spaces.setPropertyValue(): negative: undefined options arg", function () {
        expect(1);
        _spaces.setPropertyValue("ui.tooltip.delay.autoHide", 0, undefined, function (err, propertyValue) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.abort()
     * Validates: defined, type
     * Because abort() will destroy the HTML surface (and abruptly end the test...)
     * no functional test is feasible
     */
    test("_spaces.abort() defined, type", function () {
        ok(typeof _spaces.abort === "function", "_spaces.abort() type");
    });

    /* _spaces.abort()
     * Validates: negative: undefined 'options' arg
     */
    asyncTest("_spaces.abort(): negative: undefined 'options' arg", function () {
        expect(1);
        _spaces.abort(undefined, function(err) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.openURLInDefaultBrowser()
     * Validates: defined
     */
    test("_spaces.openURLInDefaultBrowser() defined, type", function () {
        ok(typeof _spaces.openURLInDefaultBrowser === "function", "_spaces.openURLInDefaultBrowser() type");
    });

    /* _spaces.openURLInDefaultBrowser()
     * Validates: negative: undefined url arg
     */
    asyncTest("_spaces.openURLInDefaultBrowser(): negative: undefined 'url' arg", function () {
        expect(1);
        _spaces.openURLInDefaultBrowser(undefined, function(err) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    // -------------------------- _spaces.config ------------------------------

    /* _spaces.config object
     * Validates: defined, type
     */
    test("_spaces.config object defined, type", function () {
        ok(!!_spaces.config, "_spaces.config defined");
        ok(typeof _spaces.config === "object", "_spaces.config type");
    });

    // ---------------------- _spaces._debug ------------------------------

    /* _spaces._debug
     * Validates: defined, type
     */
    test("_spaces._debug defined, type", function () {
        ok(typeof _spaces._debug === "object",
            "_spaces._debug object property defined, type");
    });

    test("_spaces._debug.getRemoteDebuggingPort()", function () {
        ok(typeof _spaces._debug.getRemoteDebuggingPort === "function",
            "_spaces._debug.getRemoteDebuggingPort function defined");
        var port = _spaces._debug.getRemoteDebuggingPort();
        strictEqual(typeof port, "number", "_spaces._debug.getRemoteDebuggingPort() retval");
    });

    /* _spaces._debug.logMessage() function
     *
     */
    test("_spaces._debug.logMessage()", function () {
        ok(typeof _spaces._debug.logMessage === "function",
            "_spaces._debug.logMessage function defined");
        _spaces._debug.logMessage("_spaces._debug.logMessage function test");
    });

    /* _spaces._debug_showHideDevTools()
     * function only tested for existence because the initial state can't be
     * determined to be able to reset it as found.
     */
    test("_spaces._debug_showHideDevTools() defined", function () {
        ok(typeof _spaces._debug.showHideDevTools === "function",
            "_spaces._debug.showHideDevTools() defined");
    });

    /* _spaces._debug.forcePlayArgumentFailure()
     * Negative: invoke a host method with an incorrect number/typs of arguments
     */
    asyncTest("_spaces._debug.forcePlayArgumentFailure()", function () {
        expect(1);

        _spaces._debug.forcePlayArgumentFailure(function (err) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);

            start();
        });
    });

    /* _spaces._debug.descriptorIdentity() function
     * tests for defined and a single round-trip C++<=>JS with empty
     * descriptor objects
     */
    test("_spaces._debug.descriptorIdentity() defined", function () {
        ok(typeof _spaces._debug.descriptorIdentity === "function",
            "_spaces._debug.descriptorIdentity() defined");
    });

    /* _spaces._debug.descriptorIdentity(): timing test, multiple iterations
     */
    asyncTest("_spaces._debug.descriptorIdentity(): timing test, multiple iterations", function () {
        expect(1);
        var iterations = 100;
        // WARN for Avg/median timings > warnThreshold and < errorThreshold (console.warn())
        // Test ERROR if either average or median is > errorThreshold
        var warnThreshold = 10.0; // ms
        var errorThreshold = 15.0; // ms
        var callbacksReceived = 0;
        var timings = new Array(iterations);

        var callback = function (err, descriptor, reference) {
            timings[callbacksReceived] = performance.now();
            callbacksReceived++;
            if (callbacksReceived < iterations) {
                _spaces._debug.descriptorIdentity({}, {}, callback);
            }
            else
            {
                var elapsed = timings[timings.length - 1] - startTime;
                var avgTime = elapsed / iterations;
                var discreteTimings = timings.map(function (currentValue, index, array) {
                    if (index > 0) {
                        return currentValue - array[index - 1];
                    }
                    return currentValue - startTime;
                });
                var sortedTimings = discreteTimings.sort();
                var maxTime = sortedTimings[sortedTimings.length - 1];
                var minTime = sortedTimings[0];
                var medianTime = sortedTimings[Math.floor(sortedTimings.length / 2)];
                var reportAsWarning = avgTime > warnThreshold && avgTime < errorThreshold ||
                    medianTime > warnThreshold && medianTime < errorThreshold;
                var reportAsError = avgTime > errorThreshold || medianTime > errorThreshold;
                var logstring = "AVG ROUND TRIP TIMES (ms) ";
                logstring += iterations;
                logstring += " iterations (thresholds: warn: ";
                logstring += warnThreshold;
                logstring += ", error: ";
                logstring += errorThreshold;
                logstring += "): avg: ";
                logstring += avgTime.toFixed(2);
                logstring += ", median: ";
                logstring += medianTime.toFixed(2);
                logstring += ", max: ";
                logstring += maxTime.toFixed(2);
                logstring += ", min: ";
                logstring += minTime.toFixed(2);
                if (reportAsWarning) {
                    console.warn(logstring);
                }
                ok(! reportAsError, logstring);
                start();
            }
        };
        var startTime = performance.now();
        _spaces._debug.descriptorIdentity({}, {}, callback);
    });

    /* _spaces._debug_testNativeDispatcherException() function
     */
    test("_spaces._debug_testNativeDispatcherException()", function () {
        ok(typeof _spaces._debug.testNativeDispatcherException === "function",
            "_spaces._debug.testNativeDispatcherException function defined");
        var exceptionThrown = false;
        try {
            _spaces._debug.testNativeDispatcherException();
        } catch (err) {
            exceptionThrown = true;
            ok(err instanceof Error, "Caught exception expected to be an instanceof Error");
            ok(err.hasOwnProperty("message"), "Error object should have a 'message' property");
            strictEqual("string", typeof err.message, "Error object 'message' prop type should be 'string'");
        }
        ok(exceptionThrown, "Expect native Javascript exception to be thrown");
    });

    /* _spaces._debug_enableDebugContextMenu() function only tested for
     * existence because the initial state can't be determined to be able to
     * reset it as found.
     */
    test("_spaces._debug_enableDebugContextMenu() defined", function () {
        ok(typeof _spaces._debug.enableDebugContextMenu === "function",
            "_spaces._debug.enableDebugContextMenu function defined");
    });

    // ---------------------------- _spaces.ps --------------------------------

    /* _spaces.ps property/object
     * Validates: defined, type
     */
    test("_spaces.ps property defined, type", function () {
        ok(!!_spaces.ps, "_spaces.ps property defined");
        ok(typeof _spaces.ps === "object", "_spaces.ps property type");
    });

    /* _spaces.ps.endModalToolState()
     * Validates: defined, type
     * SEE: Adapter API Blackbox Tests for interactive testing control
     */
    test("_spaces.ps.endModalToolState function defined", function () {
        ok(typeof _spaces.ps.endModalToolState === "function",
            "_spaces.ps.endModalToolState function defined");
    });

    /* _spaces.ps.performMenuCommand()
     * Validates: defined, type
     * TODO: Functional validation needed
     */
    test("_spaces.ps.performMenuCommand function", function () {
        ok(typeof _spaces.ps.performMenuCommand === "function",
            "_spaces.ps.performMenuCommand function defined");
    });

    /* _spaces.ps.getActiveTool()
     * Validates: defined, type
     * functional: makes valid requiest for the active tool and checks that the returned value has expected keys
     */
    asyncTest("_spaces.ps.getActiveTool() functional (valid request)", function () {
        expect(6);

        ok(typeof _spaces.ps.getActiveTool === "function",
            "_spaces.ps.getActiveTool() function defined");

        _spaces.ps.getActiveTool(function (err, info) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");

            ok(typeof info.title === "string",
                "_spaces.ps.getActiveTool. info result.title");

            ok(typeof info.isModal === "boolean",
                "_spaces.ps.getActiveTool. info result.isModal");

            ok(typeof info.key === "string",
                "_spaces.ps.getActiveTool. info result.key");

            start();
        });
    });

    /* _spaces.ps.requestImage() function
     * Validates: defined, type
     */
    test("_spaces.ps.requestImage() defined", function () {
        ok(typeof _spaces.ps.requestImage === "function",
            "_spaces.ps.requestImage() function defined");
    });

    // ---------------------- _spaces.ps.descriptor ---------------------------

    /* _spaces.ps.descriptor property
     * Validates: defined, type
     */
    test("_spaces.ps.descriptor property defined, type", function () {
        ok(!!_spaces.ps.descriptor, "_spaces.ps.descriptor property defined");
        ok(typeof _spaces.ps.descriptor === "object", "_spaces.ps.descriptor type");
    });

    /* _spaces.ps.descriptor.interactionMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.descriptor.interactionMode constants object", function () {
        ok(typeof _spaces.ps.descriptor.interactionMode === "object",
            "_spaces.ps.descriptor.interactionMode defined, type");
        // constants
        ok(typeof _spaces.ps.descriptor.interactionMode.DONT_DISPLAY === "number",
            "_spaces.ps.descriptor.interactionMode.DONT_DISPLAY");
        ok(typeof _spaces.ps.descriptor.interactionMode.DISPLAY === "number",
            "_spaces.ps.descriptor.interactionMode.DISPLAY");
        ok(typeof _spaces.ps.descriptor.interactionMode.SILENT === "number",
            "_spaces.ps.descriptor.interactionMode.SILENT");
    });

    /* _spaces.ps.descriptor.get()
     * Validates: defined, type
     * functional: makes valid request for PS property "hostName"
     */
    asyncTest("_spaces.ps.descriptor.get() functional (valid request)", function () {
        expect(5);

        ok(typeof _spaces.ps.descriptor.get === "function",
            "_spaces.ps.descriptor.get() function defined");

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
        var options = {};

        _spaces.ps.descriptor.get(reference, options, function (err, descriptor) {
            _validateNotifierResult(err);

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

    /* _spaces.ps.descriptor.get()
     * Validates: defined, type
     * functional: Uses option useExtendedReference: true
     */
    asyncTest("_spaces.ps.descriptor.get() functional (option useExtendedReference: true)", function () {
        expect(4);

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
        var options = {useExtendedReference: true};

        _spaces.ps.descriptor.get(reference, options, function (err, descriptor) {
            _validateNotifierResult(err);

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

    /* _spaces.ps.descriptor.get()
     * functional (negative: semantic failure)
     */
    asyncTest("_spaces.ps.descriptor.get(): semantic failure", function () {
        expect(2);

        var reference = {
            "ref": "xxx-ref-does-not-exist-xxx",
            "enum": "$Ordn",
            "value": "$Trgt"
        };
        var options = {};
        _spaces.ps.descriptor.get(reference, options, function (err, descriptor) {
            _validateNotifierResultError(err, _spaces.errorCodes.SUITEPEA_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.get()
     * functional (negative: argument failure)
     */
    asyncTest("_spaces.ps.descriptor.get(): argument failure", function () {
        expect(2);
        var options = {};
        _spaces.ps.descriptor.get("xxx-ref-does-not-exist-xxx", options, function (err, descriptor) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.play()
     * functional (positive/valid input)
     */
    asyncTest("_spaces.ps.descriptor.play(): (positive/valid input)", function () {
        expect(5);

        ok(typeof _spaces.ps.descriptor.play === "function",
            "_spaces.ps.descriptor.play() function defined");
        _spaces.ps.descriptor.play("jsonAction", {}, {}, function (err, descriptor) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");
            strictEqual(typeof descriptor, "object", "Result is a descriptor");
            deepEqual(descriptor, {}, "Result object is empty");

            start();
        });
    });

    /* _spaces.ps.descriptor.play()
     * functional (negative: argument failure)
     */
    asyncTest("_spaces.ps.descriptor.play(): argument failure", function () {
        expect(2);

        _spaces.ps.descriptor.play("jsonAction", 123, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.play()
     * functional (negative: argument conversion failure)
     */
    asyncTest("_spaces.ps.descriptor.play(): (negative: argument conversion failure)", function () {
        expect(2);

        _spaces.ps.descriptor.play("jsonAction", { ref: NaN }, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.play()
     * functional (negative: semantic failure)
     */
    asyncTest("_spaces.ps.descriptor.play(): (negative: semantic failure)", function () {
        expect(2);

        _spaces.ps.descriptor.play("xxx-ref-does-not-exist-xxx", {}, {}, function (err, descriptor) {
            _validateNotifierResultError(err, _spaces.errorCodes.SUITEPEA_ERROR);
            ok(!descriptor, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.batchPlay()
     * functional (positive/valid input)
     */
    asyncTest("_spaces.ps.descriptor.batchPlay(): (positive/valid input)", function () {
        expect(14);

        ok(typeof _spaces.ps.descriptor.batchPlay === "function",
            "_spaces.ps.descriptor.batchPlay() function defined");

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

        _spaces.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
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

    /* _spaces.ps.descriptor.batchPlay()
     * functional (negative: partial semantic failure)
     */
    asyncTest("_spaces.ps.descriptor.batchPlay(): (negative: partial semantic failure)", function () {
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

        _spaces.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");

            strictEqual(descriptors.length, 2, "Received three possible results");
            strictEqual(errors.length, 2, "Received three possible errors");

            strictEqual(typeof descriptors[0], "object", "Result is a descriptor");
            deepEqual(descriptors[0], {}, "Result object is empty");
            ok(!errors[0], "Error is falsy");

            ok(!descriptors[1], "Result is falsy");
            _validateNotifierResultError(errors[1], _spaces.errorCodes.SUITEPEA_ERROR);

            start();
        });
    });

    /* _spaces.ps.descriptor.batchPlay()
     * functional (negative: partial argument failure)
     */
    asyncTest("_spaces.ps.descriptor.batchPlay(): (negative: partial argument failure)", function () {
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

        _spaces.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
            _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
            ok(descriptors === undefined, "Call failed");
            ok(errors === undefined, "Call failed");

            start();
        });
    });

    /* _spaces.ps.descriptor.batchPlay()
     * functional (negative: with continueOnError: partial argument failure)
     */
    asyncTest("_spaces.ps.descriptor.batchPlay(): with continueOnError/partial semantic failure", function () {
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

        var options = {
            continueOnError: true
        };

        _spaces.ps.descriptor.batchPlay(commands, options, function (err, descriptors, errors) {
            _validateNotifierResult(err);
            ok(!err, "Call succeeded");

            strictEqual(descriptors.length, 3, "Received three possible results");
            strictEqual(errors.length, 3, "Received three possible errors");

            strictEqual(typeof descriptors[0], "object", "Result is a descriptor");
            deepEqual(descriptors[0], {}, "Result object is empty");
            ok(!errors[0], "Error is falsy");

            ok(!descriptors[1], "descriptors[1] is falsy");
            _validateNotifierResultError(errors[1], _spaces.errorCodes.SUITEPEA_ERROR);

            strictEqual(typeof descriptors[2], "object", "Result is a descriptor");
            deepEqual(descriptors[2], {}, "Result object descriptors[2] is empty");
            ok(!errors[2], "Error is falsy");

            start();
        });
    });


    // --------------------------- _spaces.ps.ui ------------------------------

    /* _spaces.ps property/object
     * Validates: defined, type
     */
    test("_spaces.ps.ui property defined, type", function () {
        ok(!!_spaces.ps.ui, "_spaces.ps.ui property defined");
        ok(typeof _spaces.ps.ui === "object", "_spaces.ps.ui property type");
    });

    /* _spaces.ps.ui.widgetTypes constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.ui.widgetTypes constants object", function () {
        ok(typeof _spaces.ps.ui.widgetTypes === "object",
            "_spaces.ps.ui.widgetTypes defined");
        // constants
        ok(typeof _spaces.ps.ui.widgetTypes.TOOLBAR === "number",
            "_spaces.ps.ui.widgetTypes.TOOLBAR");
        ok(typeof _spaces.ps.ui.widgetTypes.CONTROLBAR === "number",
            "_spaces.ps.ui.widgetTypes.CONTROLBAR");
        ok(typeof _spaces.ps.ui.widgetTypes.PALETTE === "number",
            "_spaces.ps.ui.widgetTypes.PALETTE");
        ok(typeof _spaces.ps.ui.widgetTypes.DOCUMENT === "number",
            "_spaces.ps.ui.widgetTypes.DOCUMENT");
        ok(typeof _spaces.ps.ui.widgetTypes.APPLICATIONBAR === "number",
            "_spaces.ps.ui.widgetTypes.APPLICATIONBAR");
        ok(typeof _spaces.ps.ui.widgetTypes.DOCUMENT_TABS === "number",
            "_spaces.ps.ui.widgetTypes.DOCUMENT_TABS");
        ok(typeof _spaces.ps.ui.widgetTypes.ALL === "number",
            "_spaces.ps.ui.widgetTypes.ALL");
    });

    /* _spaces.ps.ui.setWidgetTypeVisibility()
     * Validates: defined, type
     * SEE: Adapter API Blackbox Tests for full interactive testing control.
     * tburbage (2014/12/12): Since there is no way to query for initial state,
     * I'd rather not alter the UI state the user/developer may have intentionally
     * set before the tests are run.
     */
    test("_spaces.ps.ui.setWidgetTypeVisibility() function defined", function () {
        ok(typeof _spaces.ps.ui.setWidgetTypeVisibility === "function",
            "_spaces.ps.ui.setWidgetTypeVisibility function defined");
    });

    /* _spaces.ps.ui.pointerPropagationMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.ui.pointerPropagationMode constants object", function () {
        ok(typeof _spaces.ps.ui.pointerPropagationMode === "object",
            "_spaces.ps.ui.pointerPropagationMode defined");
        // constants
        ok(typeof _spaces.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE === "number",
            "_spaces.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE");
        ok(typeof _spaces.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE === "number",
            "_spaces.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _spaces.ps.ui.pointerPropagationMode.NEVER_PROPAGATE === "number",
            "_spaces.ps.ui.pointerPropagationMode.NEVER_PROPAGATE");
    });

    /* _spaces.ps.ui.getPointerPropagationMode()
     * Validates: Functional: simple call, and return value.
     * Does not assert what the value should specifically be, only that it be
     * among a range of possible values.
     */
    asyncTest("_spaces.ps.ui.getPointerPropagationMode() functional", function () {
        expect(3);

        ok(typeof _spaces.ps.ui.getPointerPropagationMode === "function",
            "_spaces.ps.ui.getPointerPropagationMode() function defined");

        _spaces.ps.ui.getPointerPropagationMode(function (err, mode) {
            _validateNotifierResult(err);

            var modeValidation = (mode === _spaces.ps.ui.pointerPropagationMode.ALPHA_PROPAGATE ||
                mode === _spaces.ps.ui.pointerPropagationMode.NEVER_PROPAGATE ||
                mode === _spaces.ps.ui.pointerPropagationMode.ALWAYS_PROPAGATE);

            ok(modeValidation, "mode factor validation");
            if (!modeValidation) {
                console.log("mode not the expected value. returned value is: " + mode);
            }

            start();
        });
    });

    /* _spaces.ps.ui.setPointerPropagationMode(), get/set.
     * Gets the initial state, sets for each of the other supported states, then back to the initial state.
     * Validates setPointerPropagationMode() and getPointerPropagationMode() callback args.
     */
    asyncTest("_spaces.ps.ui.setPointerPropagationMode() get/set", function () {
        // Note all of the validation is in the getPointerPropagationMode() callback.
        // It gets called 4 times, once after getting the initial value, then 3 more times
        // following a set for each of the pointerPropagationMode constants to validate
        // the set calls.
        expect(14);

        // getPointerPropagationMode() callback
        var getModeCallback = function (err, mode) {
            _validateNotifierResult(err);
            // Set up a mode "set" list with the initial mode to be set last (i.e. reset)
            if (setModeList.length === 0) {
                for (var key in _spaces.ps.ui.pointerPropagationMode) {
                    if (_spaces.ps.ui.pointerPropagationMode[key] !== mode) {
                        setModeList.push(_spaces.ps.ui.pointerPropagationMode[key]);
                    }
                }
                setModeList.push(mode);
            } else {
                // Primary validation that get returns the same mode as had been set
                strictEqual(mode, setModeList[setModeIndex], "mode from get following set");
                setModeIndex++;
            }
            ok(mode in setModeList, "mode on get should be a valid pointerPropagationMode member");
            if (setModeIndex < setModeList.length) {
                var options = {defaultMode: setModeList[setModeIndex]};
                _spaces.ps.ui.setPointerPropagationMode(options, setModeCallback);
            } else {
                start();
            }
        };

        // setPointerPropagationMode() callback
        var setModeCallback = function (err) {
            _validateNotifierResult(err);
            _spaces.ps.ui.getPointerPropagationMode(getModeCallback);
        };

        var setModeList = [];
        var setModeIndex = 0;
        _spaces.ps.ui.getPointerPropagationMode(getModeCallback);
    });


    // tburbage (2014/12/12): Intend to add functional test(s) for
    // _spaces.ps.ui.setPointerEventPropagationPolicy()
    // after definition of what are the supported set actions is resolved.


    /* _spaces.ps.ui.policyAction constants object
     * Only valid for Mac
     * Validates: defined, type, number of elements, their type, ref by name
     */
    if (navigator.platform === "MacIntel") {
        test("_spaces.ps.ui.policyAction constants object", function () {
            ok(typeof _spaces.ps.ui.policyAction === "object",
                "_spaces.ps.ui.policyAction defined");
            // constants
            ok(typeof _spaces.ps.ui.policyAction.ALPHA_PROPAGATE === "number",
                "_spaces.ps.ui.policyAction.ALPHA_PROPAGATE");
            ok(typeof _spaces.ps.ui.policyAction.ALWAYS_PROPAGATE === "number",
                "_spaces.ps.ui.policyAction.ALWAYS_PROPAGATE");
            ok(typeof _spaces.ps.ui.policyAction.NEVER_PROPAGATE === "number",
                "_spaces.ps.ui.policyAction.NEVER_PROPAGATE");
        });
    }

    /* _spaces.ps.ui.keyboardPropagationMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.ui.keyboardPropagationMode constants object", function () {
        ok(typeof _spaces.ps.ui.keyboardPropagationMode === "object",
            "_spaces.ps.ui.keyboardPropagationMode defined");
        // constants
        ok(typeof _spaces.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE === "number",
            "_spaces.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE");
        ok(typeof _spaces.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE === "number",
            "_spaces.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE");
        ok(typeof _spaces.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE === "number",
            "_spaces.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE");
    });

    /* _spaces.ps.ui.getKeyboardPropagationMode()
     * Validates: defined, type, call and callback, callback args
     * Does not assume what the returned will be (i.e. "default" value), but does validate
     * that the returned mode is a defined value in keyboardPropagationMode
     */
    asyncTest("_spaces.ps.ui.getKeyboardPropagationMode() functional", function () {
        expect(4);

        ok(typeof _spaces.ps.ui.getKeyboardPropagationMode === "function",
             "_spaces.ps.ui.getKeyboardPropagationMode() function defined");

        _spaces.ps.ui.getKeyboardPropagationMode(function (err, mode) {
            _validateNotifierResult(err);
            strictEqual(typeof mode, "number", "typeof 'mode' arg should be 'number'");
            var modeFound = false;
            for (var key in _spaces.ps.ui.keyboardPropagationMode) {
                if (mode === _spaces.ps.ui.keyboardPropagationMode[key]) {
                    modeFound = true;
                    break;
                }
            }
            ok(modeFound, "Returned mode should be a member of _spaces.ps.ui.keyboardPropagationMode");
            start();
        });
    });

    /* _spaces.ps.ui.setKeyboardPropagationMode(), get/set.
     * Gets the initial state, sets for each of the other supported states, then back to the initial state.
     * Validates setKeyboardPropagationMode() and getKeyboardPropagationMode() callback args.
     */
    asyncTest("_spaces.ps.ui.setKeyboardPropagationMode() get/set", function () {
        // Note all of the validation is in the getKeyboardPropagationMode() callback.
        // It gets called 4 times, once after getting the initial value, then 3 more times
        // following a set for each of the keyboardPropagationMode constants to validate
        // the set calls.
        expect(14);

        // getKeyboardPropagationMode() callback
        var getModeCallback = function (err, mode) {
            _validateNotifierResult(err);
            // Set up a mode "set" list with the initial setting last
            if (setModeList.length === 0) {
                for (var key in _spaces.ps.ui.pointerPropagationMode) {
                    if (_spaces.ps.ui.pointerPropagationMode[key] !== mode) {
                        setModeList.push(_spaces.ps.ui.pointerPropagationMode[key]);
                    }
                }
                setModeList.push(mode);
            } else {
                // Primary validation that get returns the same mode as had been set
                strictEqual(mode, setModeList[setModeIndex], "mode from get following set");
                setModeIndex++;
            }
            ok(mode in setModeList, "mode on get should be a valid pointerPropagationMode member");
            if (setModeIndex < setModeList.length) {
                var options = {defaultMode: setModeList[setModeIndex]};
                _spaces.ps.ui.setKeyboardPropagationMode(options, setModeCallback);
            } else {
                start();
            }
        };

        // setKeyboardPropagationMode() callback
        var setModeCallback = function (err) {
            _validateNotifierResult(err);
            _spaces.ps.ui.getKeyboardPropagationMode(getModeCallback);
        };

        var setModeList = [];
        var setModeIndex = 0;
        _spaces.ps.ui.getKeyboardPropagationMode(getModeCallback);
    });

    /* _spaces.ps.ui.setKeyboardEventPropagationPolicy()
     * Validates: defined, type
     */
    test("_spaces.ps.ui.setKeyboardEventPropagationPolicy() function defined", function () {
        ok(typeof _spaces.ps.ui.setKeyboardEventPropagationPolicy === "function",
            "_spaces.ps.ui.setKeyboardEventPropagationPolicy() function defined");
    });

    /* _spaces.ps.ui.setKeyboardEventPropagationPolicy()
     * Functional: negative, empty options
     */
    asyncTest("_spaces.ps.ui.setPointerEventPropagationPolicy(): negative:  with empty options", function () {
        expect(1);

        var options = {};
        _spaces.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err, _spaces.errorCodes.UNKNOWN_ERROR);

            start();
        });
    });

    /* _spaces.ps.ui.setKeyboardEventPropagationPolicy()
     * Functional: negative, empty policy
     */
    asyncTest("_spaces.ps.ui.setPointerEventPropagationPolicy(): negative, empty policy", function () {
        expect(1);

        var options = { policyList: [] };
        _spaces.ps.ui.setPointerEventPropagationPolicy(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });


    // tburbage (2014/12/12): Intend to add functional test(s) for
    // _spaces.ps.ui.setKeyboardEventPropagationPolicy() functional
    // after definition of what are the supported set actions is resolved.


    /* _spaces.ps.ui.overscrollMode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.ui.overscrollMode constants object", function () {
        ok(typeof _spaces.ps.ui.overscrollMode === "object",
            "_spaces.ps.ui.overscrollMode defined");
        // constants
        ok(typeof _spaces.ps.ui.overscrollMode.NORMAL_OVERSCROLL === "number",
            "_spaces.ps.ui.overscrollMode.NORMAL_OVERSCROLL");
        ok(typeof _spaces.ps.ui.overscrollMode.ALWAYS_OVERSCROLL === "number",
            "_spaces.ps.ui.overscrollMode.ALWAYS_OVERSCROLL");
        ok(typeof _spaces.ps.ui.overscrollMode.NEVER_OVERSCROLL === "number",
            "_spaces.ps.ui.overscrollMode.NEVER_OVERSCROLL");
    });

    /* _spaces.ps.ui.getOverscrollMode(), simple functional
     * Validates: Functional: simple call, and return value.
     */
    asyncTest("_spaces.ps.ui.getOverscrollMode() functional", function () {
        expect(3);

        ok(typeof _spaces.ps.ui.getOverscrollMode === "function",
             "_spaces.ps.ui.getOverscrollMode() function defined");

        _spaces.ps.ui.getOverscrollMode(function (err, mode) {
            _validateNotifierResult(err);

            var modeValidation = (mode === _spaces.ps.ui.overscrollMode.NORMAL_OVERSCROLL ||
                mode === _spaces.ps.ui.overscrollMode.ALWAYS_OVERSCROLL ||
                mode === _spaces.ps.ui.overscrollMode.NEVER_OVERSCROLL);

            ok(modeValidation, "mode factor validation");
            if (!modeValidation) {
                console.log("mode not the expected value. returned value is: " + mode);
            }

            start();
        });
    });

    /* _spaces.ps.ui.setOverscrollMode(), simple functional
     * Validates: Functional: simple call, and return value.
     * TODO: Could be expanded to do get (initial)/set (new)/get (validate)/set (init)
     */
    asyncTest("_spaces.ps.ui.setOverscrollMode() functional", function () {
        expect(2);

        ok(typeof _spaces.ps.ui.setOverscrollMode === "function",
             "_spaces.ps.ui.setOverscrollMode() function defined");

        var options = {
            mode: _spaces.ps.ui.overscrollMode.ALWAYS_OVERSCROLL
        };

        _spaces.ps.ui.setOverscrollMode(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    /* _spaces.ps.ui.getSuppressScrollbars()
     * Functional: Get the scrollbar mode. While it is initialized to false, at this
     * point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_spaces.ps.ui.getSuppressScrollbars() functional", function () {
        expect(3);

        ok(typeof _spaces.ps.ui.getSuppressScrollbars === "function",
             "_spaces.ps.ui.getSuppressScrollbars() function defined");

        _spaces.ps.ui.getSuppressScrollbars(function (err, value) {
            _validateNotifierResult(err);

            strictEqual(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    /* _spaces.ps.ui.setSuppressScrollbars()
     * Functional: Set the scrollbar mode. When set the old value is returned.
     * The First value sets the scrollbar to true, the second to false
     */
    asyncTest("_spaces.ps.ui.setSuppressScrollbars() functional", function () {
        expect(3);

        ok(typeof _spaces.ps.ui.setSuppressScrollbars === "function",
             "_spaces.ps.ui.setSuppressScrollbars() function defined");

        _spaces.ps.ui.setSuppressScrollbars(true, function (err, previousValue) {
            _validateNotifierResult(err);

            strictEqual(typeof previousValue, "boolean", "Result is a boolean");

            // reset the scrollbar value
            _spaces.ps.ui.setSuppressScrollbars(previousValue, function () { });

            start();
        });
    });

    /* Get/set the scrollbar mode. Confirms the "symmetry" of get/set.
     * While it is initialized to false, at this point we cannot make assumptions about its value.
     * Value validation is also an issue as we are invoking setter tests asynchronously.
     */
    asyncTest("_spaces.ps.ui.setSuppressScrollbars() get/set", function () {
        expect(11);

        // Initial get of startValue
        _spaces.ps.ui.getSuppressScrollbars(function (err, startValue) {
            _validateNotifierResult(err);
            strictEqual(typeof startValue, "boolean", "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _spaces.ps.ui.setSuppressScrollbars(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                strictEqual(typeof previousValue, "boolean", "Result is a boolean");
                strictEqual(previousValue, startValue, "previousValue returned by set should equal prior get value");

                // get to confirm set
                _spaces.ps.ui.getSuppressScrollbars(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(newValue, !startValue, "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _spaces.ps.ui.setSuppressScrollbars(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue, !startValue,
                                    "previousValue returned by set should equal prior get value");

                        // get to confirm set
                        _spaces.ps.ui.getSuppressScrollbars(function (err, endValue) {
                            _validateNotifierResult(err);
                            strictEqual(endValue, startValue, "endValue (on get) should equal the startValue");

                            start();
                        });
                    });
                });
            });
        });
    });

    /* Get/set the SuppressTargetPaths state
     * getSuppressTargetPaths(), setSuppressTargetPaths() functional
     * Validates: identify, call and callback args for get and set, value toggle.
     * Does not assume what the initial value is, but sets it to the inverse, then
     * back to the initial state.
     */
    asyncTest("_spaces.ps.ui.setSuppressTargetPaths() get/set", function () {
        expect(13);

        ok(typeof _spaces.ps.ui.getSuppressTargetPaths === "function",
             "_spaces.ps.ui.getSuppressTargetPaths() function defined");

        ok(typeof _spaces.ps.ui.getSuppressTargetPaths === "function",
             "_spaces.ps.ui.getSuppressTargetPaths() function defined");

        // Initial get of startValue
        _spaces.ps.ui.getSuppressTargetPaths(function (err, startValue) {
            _validateNotifierResult(err);
            strictEqual(typeof startValue, "boolean", "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _spaces.ps.ui.setSuppressTargetPaths(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                strictEqual(typeof previousValue, "boolean", "Result is a boolean");
                strictEqual(previousValue, startValue, "previousValue returned by set should equal prior get value");

                // get to confirm set
                _spaces.ps.ui.getSuppressTargetPaths(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(newValue, !startValue, "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _spaces.ps.ui.setSuppressTargetPaths(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue, !startValue,
                                    "previousValue returned by set should equal prior get value");

                        // get to confirm set
                        _spaces.ps.ui.getSuppressTargetPaths(function (err, endValue) {
                            _validateNotifierResult(err);
                            strictEqual(endValue, startValue, "endValue (on get) should equal the startValue");

                            start();
                        });
                    });
                });
            });
        });
    });

    /* Get/set the OverlayOffsets state
     * getOverlayOffsets(), setOverlayOffsets() functional
     * Validates: identify, call and callback args for get and set, value toggle.
     * Does not assume what the initial value is, but sets it to the inverse, then
     * back to the initial state.
     */
    asyncTest("_spaces.ps.ui.setOverlayOffsets() get/set", function () {
        expect(27);

        ok(typeof _spaces.ps.ui.getOverlayOffsets === "function",
             "_spaces.ps.ui.getOverlayOffsets() function defined");

        ok(typeof _spaces.ps.ui.setOverlayOffsets === "function",
             "_spaces.ps.ui.setOverlayOffsets() function defined");

        var expOffsetAttrNames = ["left", "top", "right", "bottom"];
        // Initial get of starting offsets
        _spaces.ps.ui.getOverlayOffsets(function (err, options) {
            _validateNotifierResult(err);
            strictEqual(typeof options, "object", "options is an object");
            ok("offset" in options, "options should have an 'offset' attribute");
            strictEqual(typeof options.offset, "object", "options 'offset' is an object");
            var startOffsets = options.offset;
            var startAttrs = Object.keys(options.offset);
            strictEqual(startAttrs.length, 4, "offset should have 4 attributes");
            // test that all expected attributes are present and have an appropriate
            // type and value
            for (var i = 0; i < expOffsetAttrNames.length; i++) {
                var attr = expOffsetAttrNames[i];
                ok(attr in startOffsets, "attribute '" + attr + "' in options.offset");
                strictEqual(typeof startOffsets[attr], "number", "offset values are numbers");
                ok(startOffsets[attr] >= 0, "offset values >= 0");
            }
            // Invert startValue state on set and compare to previousValue
            var newOffsets = {"left": startOffsets.left + 10,
                              "top": startOffsets.top + 20,
                              "right": startOffsets.right + 30,
                              "bottom": startOffsets.bottom + 40};
            _spaces.ps.ui.setOverlayOffsets({"offset": newOffsets}, function (err, prevValue) {
                _validateNotifierResult(err);
                deepEqual(prevValue.offset, startOffsets, "startOffsets and prevOffsets should be equivalent");
                // get to confirm set
                _spaces.ps.ui.getOverlayOffsets(function (err, options) {
                    _validateNotifierResult(err);
                    deepEqual(options.offset, newOffsets, "callback offset and newOffsets should be equivalent");

                    // set back to the initial state
                    _spaces.ps.ui.setOverlayOffsets({"offset": startOffsets}, function (err, prevValue) {
                        _validateNotifierResult(err);
                        deepEqual(prevValue.offset, newOffsets, "callback offset and newOffsets should be equivalent");

                        // get to confirm set
                        _spaces.ps.ui.getOverlayOffsets(function (err, options) {
                            _validateNotifierResult(err);
                            deepEqual(options.offset, startOffsets, "callback offset and startOffsets should be equivalent");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* Log a headlights event
     * LogHeadlightsEvent() functional
     * Validates: identify, call args log event.
     */
    asyncTest("_spaces.ps.logHeadlightsEvent() functional", function () {
        expect(2);

        ok(typeof _spaces.ps.logHeadlightsEvent === "function",
             "_spaces.ps.logHeadlightsEvent() function defined");

        var options = {
            category:      "playground",
            subcategory:   "test",
            event:         "execute headlights unit test",
        };

        // Log an Event
        _spaces.ps.logHeadlightsEvent(options, function (err) {
            _validateNotifierResult(err);

            start();
        });
    });

    /* _spaces.ps.ui.commandKind constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.ps.ui.commandKind constants object", function () {
        ok(typeof _spaces.ps.ui.commandKind === "object",
            "_spaces.ps.ui.commandKind defined");
        // constants
        ok(typeof _spaces.ps.ui.commandKind.USER_DEFINED === "number",
            "_spaces.ps.ui.commandKind.USER_DEFINED");
        ok(typeof _spaces.ps.ui.commandKind.CUT === "number",
            "_spaces.ps.ui.commandKind.CUT");
        ok(typeof _spaces.ps.ui.commandKind.COPY === "number",
            "_spaces.ps.ui.commandKind.COPY");
        ok(typeof _spaces.ps.ui.commandKind.PASTE === "number",
            "_spaces.ps.ui.commandKind.PASTE");
        ok(typeof _spaces.ps.ui.commandKind.SELECT_ALL === "number",
            "_spaces.ps.ui.commandKind.SELECT_ALL");
        ok(typeof _spaces.ps.ui.commandKind.UNDO === "number",
            "_spaces.ps.ui.commandKind.UNDO");
        ok(typeof _spaces.ps.ui.commandKind.REDO === "number",
            "_spaces.ps.ui.commandKind.REDO");
        ok(typeof _spaces.ps.ui.commandKind.DELETE === "number",
            "_spaces.ps.ui.commandKind.DELETE");
    });

    // --------------------- Menu tests ---------------------

    /* _spaces.ps.ui.installMenu()
     * Validates: defined, type
     */
    test("_spaces.ps.ui.installMenu() function defined", function () {
        ok(typeof _spaces.ps.ui.installMenu === "function",
             "_spaces.ps.ui.installMenu() function defined");
    });

    // tburbage (2014/12/12): Decided NOT to add a functional set/reset
    // for installMenu() because Designshop has a method for running these
    // tests from its own custom menu. There isn't a way to get the current
    // custom menu, install a new one, then restore the previous one (defined
    // elsewhere)
    // SEE: Adapter API Blackbox Tests, "_spaces.ps.ui" section for this
    // coverage.

    // ---------------------------- _spaces.os --------------------------------

    /* _spaces.os property/object
     * Validates: defined, type
     */
    test("_spaces.os property defined, type", function () {
        ok(!!_spaces.os, "_spaces.os property defined");
        ok(typeof _spaces.os === "object", "_spaces.os property type");
    });

    /* _spaces.os.eventKind constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.os.eventKind constants object", function () {
        ok(typeof _spaces.os.eventKind === "object",
            "_spaces.os.eventKind defined");
        // constants
        ok(typeof _spaces.os.eventKind.LEFT_MOUSE_DOWN === "number",
            "_spaces.os.eventKind.LEFT_MOUSE_DOWN");
        ok(typeof _spaces.os.eventKind.KEY_DOWN === "number",
            "_spaces.os.eventKind.KEY_DOWN");
        ok(typeof _spaces.os.eventKind.KEY_UP === "number",
            "_spaces.os.eventKind.KEY_UP");
        ok(typeof _spaces.os.eventKind.FLAGS_CHANGED === "number",
            "_spaces.os.eventKind.FLAGS_CHANGED");
        ok(typeof _spaces.os.eventKind.MOUSE_WHEEL === "number",
            "_spaces.os.eventKind.MOUSE_WHEEL");
    });

    /* _spaces.os.eventModifiers constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.os.eventModifiers constants object", function () {
        ok(typeof _spaces.os.eventModifiers === "object",
            "_spaces.os.eventModifiers defined");
        // constants
        ok(typeof _spaces.os.eventModifiers.NONE === "number",
            "_spaces.os.eventModifiers.NONE");
        ok(typeof _spaces.os.eventModifiers.SHIFT === "number",
            "_spaces.os.eventModifiers.SHIFT");
        ok(typeof _spaces.os.eventModifiers.CONTROL === "number",
            "_spaces.os.eventModifiers.CONTROL");
        ok(typeof _spaces.os.eventModifiers.ALT === "number",
            "_spaces.os.eventModifiers.ALT");
        ok(typeof _spaces.os.eventModifiers.COMMAND === "number",
            "_spaces.os.eventModifiers.COMMAND");
    });

    /* _spaces.os.eventKeyCode constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.os.eventKeyCode constants object", function () {
        ok(typeof _spaces.os.eventKeyCode === "object",
            "_spaces.os.eventKeyCode defined");
        // constants
        ok(typeof _spaces.os.eventKeyCode.NONE === "number",
            "_spaces.os.eventKeyCode.NONE");
        ok(typeof _spaces.os.eventKeyCode.BACKSPACE === "number",
            "_spaces.os.eventKeyCode.BACKSPACE");
        ok(typeof _spaces.os.eventKeyCode.TAB === "number",
            "_spaces.os.eventKeyCode.TAB");
        ok(typeof _spaces.os.eventKeyCode.ENTER === "number",
            "_spaces.os.eventKeyCode.ENTER");
        ok(typeof _spaces.os.eventKeyCode.ESCAPE === "number",
            "_spaces.os.eventKeyCode.ESCAPE");
        ok(typeof _spaces.os.eventKeyCode.PAGE_UP === "number",
            "_spaces.os.eventKeyCode.PAGE_UP");
        ok(typeof _spaces.os.eventKeyCode.PAGE_DOWN === "number",
            "_spaces.os.eventKeyCode.PAGE_DOWN");
        ok(typeof _spaces.os.eventKeyCode.END === "number",
            "_spaces.os.eventKeyCode.END");
        ok(typeof _spaces.os.eventKeyCode.HOME === "number",
            "_spaces.os.eventKeyCode.HOME");
        ok(typeof _spaces.os.eventKeyCode.ARROW_LEFT === "number",
            "_spaces.os.eventKeyCode.ARROW_LEFT");
        ok(typeof _spaces.os.eventKeyCode.ARROW_UP === "number",
            "_spaces.os.eventKeyCode.ARROW_UP");
        ok(typeof _spaces.os.eventKeyCode.ARROW_RIGHT === "number",
            "_spaces.os.eventKeyCode.ARROW_RIGHT");
        ok(typeof _spaces.os.eventKeyCode.ARROW_DOWN === "number",
            "_spaces.os.eventKeyCode.ARROW_DOWN");
        ok(typeof _spaces.os.eventKeyCode.INSERT === "number",
            "_spaces.os.eventKeyCode.INSERT");
        ok(typeof _spaces.os.eventKeyCode.DELETE === "number",
            "_spaces.os.eventKeyCode.DELETE");
        ok(typeof _spaces.os.eventKeyCode.WIN_LEFT === "number",
            "_spaces.os.eventKeyCode.WIN_LEFT");
        ok(typeof _spaces.os.eventKeyCode.WIN_RIGHT === "number",
            "_spaces.os.eventKeyCode.WIN_RIGHT");
        ok(typeof _spaces.os.eventKeyCode.WIN_MENU === "number",
            "_spaces.os.eventKeyCode.WIN_MENU");
        ok(typeof _spaces.os.eventKeyCode.KEY_F1 === "number",
            "_spaces.os.eventKeyCode.KEY_F1");
        ok(typeof _spaces.os.eventKeyCode.KEY_F2 === "number",
            "_spaces.os.eventKeyCode.KEY_F2");
        ok(typeof _spaces.os.eventKeyCode.KEY_F3 === "number",
            "_spaces.os.eventKeyCode.KEY_F3");
        ok(typeof _spaces.os.eventKeyCode.KEY_F4 === "number",
            "_spaces.os.eventKeyCode.KEY_F4");
        ok(typeof _spaces.os.eventKeyCode.KEY_F5 === "number",
            "_spaces.os.eventKeyCode.KEY_F5");
        ok(typeof _spaces.os.eventKeyCode.KEY_F6 === "number",
            "_spaces.os.eventKeyCode.KEY_F6");
        ok(typeof _spaces.os.eventKeyCode.KEY_F7 === "number",
            "_spaces.os.eventKeyCode.KEY_F7");
        ok(typeof _spaces.os.eventKeyCode.KEY_F8 === "number",
            "_spaces.os.eventKeyCode.KEY_F8");
        ok(typeof _spaces.os.eventKeyCode.KEY_F9 === "number",
            "_spaces.os.eventKeyCode.KEY_F9");
        ok(typeof _spaces.os.eventKeyCode.KEY_F10 === "number",
            "_spaces.os.eventKeyCode.KEY_F10");
        ok(typeof _spaces.os.eventKeyCode.KEY_F11 === "number",
            "_spaces.os.eventKeyCode.KEY_F11");
        ok(typeof _spaces.os.eventKeyCode.KEY_F12 === "number",
            "_spaces.os.eventKeyCode.KEY_F12");
    });

    /* _spaces.os.notifierKind constants object
     * (renamed from DEPRECATED _spaces.os.eventTypes)
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_spaces.os.notifierKind constants object", function () {
        ok(typeof _spaces.os.notifierKind === "object",
            "_spaces.os.notifierKind defined");
        // constants
        ok(typeof _spaces.os.notifierKind.MOUSE_CAPTURE_LOST === "string",
            "_spaces.os.notifierKind.MOUSE_CAPTURE_LOST");
        ok(typeof _spaces.os.notifierKind.ACTIVATION_CHANGED === "string",
            "_spaces.os.notifierKind.ACTIVATION_CHANGED");
        ok(typeof _spaces.os.notifierKind.KEYBOARDFOCUS_CHANGED === "string",
            "_spaces.os.notifierKind.KEYBOARDFOCUS_CHANGED");
        ok(typeof _spaces.os.notifierKind.EXTERNAL_MOUSE_DOWN === "string",
            "_spaces.os.notifierKind.EXTERNAL_MOUSE_DOWN");
        ok(typeof _spaces.os.notifierKind.EXTERNAL_MOUSE_WHEEL === "string",
            "_spaces.os.notifierKind.EXTERNAL_MOUSE_WHEEL");
        ok(typeof _spaces.os.notifierKind.EXTERNAL_KEYEVENT === "string",
            "_spaces.os.notifierKind.EXTERNAL_KEYEVENT");
        ok(typeof _spaces.os.notifierKind.TOUCH === "string",
            "_spaces.os.notifierKind.TOUCH");
        ok(typeof _spaces.os.notifierKind.CONVERTIBLE_SLATE_MODE_CHANGED === "string",
            "_spaces.os.notifierKind.CONVERTIBLE_SLATE_MODE_CHANGED");
    });

    /* _spaces.os.registerEventListener()
     * Validates: defined, type
     */
    test("_spaces.os.registerEventListener() defined", function () {
        ok(typeof _spaces.os.registerEventListener === "function",
            "_spaces.os.registerEventListener function defined");
    });

    /* _spaces.os.registerEventListener()
     * Validates: defined, type
     */
    test("_spaces.os.unRegisterEventListener() defined", function () {
        ok(typeof _spaces.os.unRegisterEventListener === "function",
            "_spaces.os.unRegisterEventListener function defined");
    });

    /* _spaces.os.postEvent()
     * Validates: defined, type
     */
    test("_spaces.os.postEvent() defined", function () {
        ok(typeof _spaces.os.postEvent === "function",
            "_spaces.os.postEvent function defined");
    });

    /* _spaces.os.keyboardFocus property
     * Validates: defined, type
     */
    test("_spaces.os.keyboardFocus defined", function () {
        ok(typeof _spaces.os.keyboardFocus === "object",
            "_spaces.os.keyboardFocus property defined");
    });

    /* _spaces.os.keyboardFocus.acquire()
     * Validates: defined, type
     */
    test("_spaces.os.keyboardFocus.acquire() defined", function () {
        ok(typeof _spaces.os.keyboardFocus.acquire === "function",
            "_spaces.os.keyboardFocus.acquire() function defined");
    });

    /* _spaces.os.keyboardFocus.release()
     * Validates: defined, type
     */
    test("_spaces.os.keyboardFocus.release() defined", function () {
        ok(typeof _spaces.os.keyboardFocus.release === "function",
            "_spaces.os.keyboardFocus.release() function defined");
    });

    /* _spaces.os.keyboardFocus.isActive()
     * Validates: defined, type
     */
    test("_spaces.os.keyboardFocus.isActive() defined", function () {
        ok(typeof _spaces.os.keyboardFocus.isActive === "function",
            "_spaces.os.keyboardFocus.isActive() function defined");
    });

    /* _spaces.os.keyboardFocus: acquire(), release(), isActive() functional
     *
     */
    asyncTest("_spaces.os.keyboardFocus: acquire() / release() / isActive() functional", function () {
        expect(7);
        _spaces.os.keyboardFocus.acquire({}, function (err) {
            _validateNotifierResult(err);
            _spaces.os.keyboardFocus.isActive({}, function (err, value) {
                _validateNotifierResult(err);
                strictEqual(typeof value, "boolean", "value type");
                strictEqual(value, true, "focus should be active following acquire()");
                _spaces.os.keyboardFocus.release({}, function (err) {
                    _validateNotifierResult(err);
                    _spaces.os.keyboardFocus.isActive({}, function (err, value) {
                        _validateNotifierResult(err);
                        strictEqual(value, false, "focus should not be active following release()");
                        start();
                    });
                });
            });
        });
    });

    // --------------------- ConvertibleSlateMode tests ---------------------

    /* _spaces.os.keyboardFocus.isConvertibleSlateMode()
     * Functional: Call, validate return value type, err check.
     */
    asyncTest("_spaces.os.isConvertibleSlateMode() functional", function () {
        expect(3);

        ok(typeof _spaces.os.isConvertibleSlateMode === "function",
            "_spaces.os.isConvertibleSlateMode() function defined");

        _spaces.os.isConvertibleSlateMode(function (err, value) {
            _validateNotifierResult(err);

            strictEqual(typeof value, "boolean", "Result is a boolean");

            start();
        });
    });

    // no test for setting this property, it is read-only.


    // ------------------------ _spaces.os.clipboard --------------------------

    /* _spaces.os.clipboard object
     * Validates: defined, type
     */
    test("_spaces.os.clipboard object defined, type", function () {
        ok(!!_spaces.os.clipboard, "_spaces.os.clipboard defined");
        ok(typeof _spaces.os.clipboard === "object", "_spaces.os.clipboard type");
    });


    /* _spaces.os.clipboard: write(), read() functional: simple string
     * Validates: All valid args, verifies the string set on write() is the same on read()
     *
     */
    asyncTest("_spaces.os.clipboard: write(), read() functional: simple string", function () {
        expect(9);
        ok(typeof _spaces.os.clipboard.write === "function",
            "_spaces.os.clipboard.write() function defined");
        ok(typeof _spaces.os.clipboard.read === "function",
            "_spaces.os.clipboard.read() function defined");
        var options = {
            "format": "string",
            "data": "_spaces.os.clipboard test"
        };

        _spaces.os.clipboard.write(options, function (err) {
            _validateNotifierResult(err);
            var options = {
                "formats": ["string"]
            };
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResult(err);
                strictEqual(typeof info, "object", "read() info arg");
                strictEqual(typeof info.format, "string",
                      "read() info arg, format property type");
                strictEqual(info.format, "string",
                      "read() info arg, format property value");
                strictEqual(typeof info.data, "string",
                      "read() info arg, data property type");
                strictEqual(info.data, "_spaces.os.clipboard test",
                      "read() info arg, data property value");
                start();
            });
        });
    });

    /* _spaces.os.clipboard: write(), read() functional: string with special and Unicode chars
     * Validates: All valid args, verifies the string set on write() is the same on read()
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#String_literals
     */
    asyncTest("_spaces.os.clipboard: write(), read() functional: simple string", function () {
        expect(7);
        var inputString = "Clipboard string: ";
        inputString += "tab: \t";
        inputString += "; newline: \n";
        inputString += "; doublequote: \"";
        inputString += "; singlequote: \'";
        inputString += "; Latin-1 hex (copyright symbol): \xA9";
        inputString += "; Unicode (copyright symbol): \u00A9";

        var options = {
            "format": "string",
            "data": inputString
        };

        _spaces.os.clipboard.write(options, function (err) {
            _validateNotifierResult(err);
            var options = {
                "formats": ["string"]
            };
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResult(err);
                strictEqual(typeof info, "object", "read() info arg");
                strictEqual(typeof info.format, "string",
                      "read() info arg, format property type");
                strictEqual(info.format, "string",
                      "read() info arg, format property value");
                strictEqual(typeof info.data, "string",
                      "read() info arg, data property type");
                strictEqual(info.data, inputString,
                      "read() info arg, data property value");
                start();
            });
        });
    });

    /* _spaces.os.clipboard: write(), read() functional: custom format with special and Unicode chars
     * Validates: All valid args, verifies the string set on write() is the same on read()
     */
    asyncTest("_spaces.os.clipboard: write(), read() functional: custom format", function () {
        expect(7);
        var inputString = "Some data";
        var customFormat = "com.adobe.playground.lowlevel-test.format01";

        var options = {
            "format": customFormat,
            "data": inputString
        };

        _spaces.os.clipboard.write(options, function (err) {
            _validateNotifierResult(err);
            var options = {
                "formats": [customFormat, "string"]
            };
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResult(err);
                strictEqual(typeof info, "object", "read() info arg");
                strictEqual(typeof info.format, "string",
                      "read() info arg, format property type");
                strictEqual(info.format, customFormat,
                      "read() info arg, format property value");
                strictEqual(typeof info.data, "string",
                      "read() info arg, data property type");
                strictEqual(info.data, inputString,
                      "read() info arg, data property value");
                start();
            });
        });
    });

    /* _spaces.os.clipboard: write() negative: undefined 'options' arg
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: undefined 'options' arg", function () {
        expect(2);

        try {
            _spaces.os.clipboard.write(undefined, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: undefined 'callback' arg
     * Expect a native error/exception to be thrown
     */
    test("_spaces.os.clipboard: write() negative: undefined 'callback' arg", function () {
        var expectedErrorStr = "Async native function invoked without a notifier as the last argument.";
        var options = {
            "format": "string",
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, undefined);
            ok(false, "Runtime error is expected to be thrown");
        }
        catch (err) {
            strictEqual(err.message.slice(0, expectedErrorStr.length),
                        expectedErrorStr,
                        "Runtime error expected to be thrown");
        }
    });

    /* https://watsonexp.corp.adobe.com/#bug=3909817
     * No error is thrown when when a callback function reference with incorrect number of parameters
     * is passed to a Playground API function (CLOSED/AS DESIGNED)
     * We do absolutely no arg count validation for the API callback functions provided by the caller...
     */

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' string value", function () {
        expect(2);

        var options = {
            "format": "",
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: omitted 'options.format'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: omitted 'options.format'", function () {
        expect(2);

        var options = {
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' type: undefined", function () {
        expect(2);

        var options = {
            "format": undefined,
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' type: number
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' type: number", function () {
        expect(2);

        var options = {
            "format": 0,
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' type: boolean
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' type: boolean", function () {
        expect(2);

        var options = {
            "format": false,
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' type: null", function () {
        expect(2);

        var options = {
            "format": null,
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.format' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.format' type: object", function () {
        expect(2);

        var options = {
            "format": {},
            "data": "_spaces.os.clipboard test"
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: omitted 'options.data'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: omitted 'options.data'", function () {
        expect(2);

        var options = {
            "format": "string",
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.data' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.data' type: undefined", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": undefined
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.data' type: number
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.data' type: number", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": 1.5
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.data' type: boolean
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.data' type: boolean", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": true
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.data' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.data' type: null", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": null
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: write() negative: invalid 'options.data' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: write() negative: invalid 'options.data' type: object", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": {}
        };

        try {
            _spaces.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: undefined 'options' arg
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: undefined 'options' arg", function () {
        expect(2);

        try {
            _spaces.os.clipboard.read(undefined, function (err) {
                _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: undefined 'callback' arg
     * Expect a native error/exception to be thrown
     */
    test("_spaces.os.clipboard: read() negative: undefined 'callback' arg", function () {
        var expectedErrorStr = "Async native function invoked without a notifier as the last argument.";
        var options = {
            "formats": ["string"]
        };

        try {
            _spaces.os.clipboard.read(options, undefined);
            ok(false, "Runtime error is expected to be thrown");
        }
        catch (err) {
            strictEqual(err.message.slice(0, expectedErrorStr.length),
                        expectedErrorStr,
                        "Runtime error expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: invalid 'options.formats' type string value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: invalid 'options.formats' type string value", function () {
        expect(2);

        var options = {
            "formats": [""]
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: invalid 'options.formats' type value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: invalid 'options.formats' type", function () {
        expect(2);

        var options = {
            "formats": "string, should be array"
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });


    /* _spaces.os.clipboard: read() negative: omitted 'options.formats'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: omitted 'options.formats'", function () {
        expect(2);

        var options = {
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: invalid 'options.formats' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: invalid 'options.formats' type: undefined", function () {
        expect(2);

        var options = {
            "formats": undefined,
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: invalid 'options.formats' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: invalid 'options.formats' type: null", function () {
        expect(2);

        var options = {
            "formats": null,
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.clipboard: read() negative: invalid 'options.formats' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_spaces.os.clipboard: read() negative: invalid 'options.formats' type: object", function () {
        expect(2);

        var options = {
            "formats": {},
        };

        try {
            _spaces.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _spaces.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _spaces.os.setTooltip()
     * Validates: defined, type, functional: call and callback args
     * See also: _spaces.getPropertyValue(), setPropertyValue()
     * which are used to control tooltip behavior by way of
     * ui.tooltip.delay.*. Testing controls for those are/will be added
     * to the Blackbox Test.
     */
    asyncTest("_spaces.os.setTooltip(): defined, type, functional", function () {
        expect(3);

        ok(typeof _spaces.os.setTooltip === "function",
           "_spaces.os.setTooltip() function defined");
        var options = {"label": "The tooltip text"};
        _spaces.os.setTooltip(options, function (err) {
            _validateNotifierResult(err);
            // "reset" by omitting optional 'options' 'label' key
            options = {};
            _spaces.os.setTooltip(options, function (err) {
                _validateNotifierResult(err);
                start();
            });
        });
    });

    /* _spaces.os.setTooltip()
     * Validates: functional: Unicode label
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Unicode
     * Only visual validation in the BBTest will really validate Unicode usage
     */
    asyncTest("_spaces.os.setTooltip(): functional: label with 'Copyright' Unicode char", function () {
        expect(1);

        var options = {"label": "\u00A9 Adobe Systems Incorporated"};
        _spaces.os.setTooltip(options, function (err) {
            _validateNotifierResult(err);
            start();
        });
    });

    /* _spaces.os.setTooltip()
     * Validates: negative: Invalid/undefined 'label' value type
     */
    asyncTest("_spaces.os.setTooltip(): negative: invalid/undefined 'label' value", function () {
        expect(1);
        var options = {"label": undefined};
        _spaces.os.setTooltip(options, function(err) {
            _validateNotifierResultError(err, _spaces.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _spaces.os.resetCursor()
     * Validates: defined, type, functional: call and callback args
     */
    asyncTest("_spaces.os.resetCursor() functional", function () {
        expect(2);

        ok(typeof _spaces.os.resetCursor === "function",
             "_spaces.os.resetCursor() function defined");
        var options = {}; // 'options' arg currently unused
        _spaces.os.resetCursor(options, function (err) {
            _validateNotifierResult(err);
            start();
        });
    });

    // END OF TESTS
    console.log("Adapter version",
                _spaces.version.major + "." +
                _spaces.version.minor + "." +
                _spaces.version.patch,
                ": low level API tests completed");
});
