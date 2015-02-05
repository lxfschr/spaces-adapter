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

/* global _playground, module, console, performance, define */
/* global test, asyncTest, expect, start, ok, equal, strictEqual, deepEqual */
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

    // --------------------------- _playground ---------------------------------

    /* _playground object
     * Validates: defined, type
     */
    test("_playground object defined, type", function () {
        ok(!!_playground, "_playground defined");
        ok(typeof _playground === "object", "_playground type");
    });

    /* _playground.version Object property
     * Validates: defined, type, member names and types
     * Form: {"major": n, "minor": n, "patch": n}
     */
    test("_playground.version Object property: defined, type, member names and types", function () {
        ok(_playground.hasOwnProperty("version"), "_playground object should have a 'version' property");
        ok(typeof _playground.version === "object", "_playground.version type");
        strictEqual(Object.keys(_playground.version).length, 3, "_playground.version should have 3 properties");
        strictEqual(typeof _playground.version.major, "number", "version.major type should be 'number'");
        ok(_playground.version.major >= 0, "version.major value should be >= 0");
        strictEqual(typeof _playground.version.minor, "number", "version.minor type should be 'number'");
        ok(_playground.version.minor >= 0, "version.minor value should be >= 0");
        strictEqual(typeof _playground.version.patch, "number", "version.patch type should be 'number'");
        ok(_playground.version.patch >= 0, "version.patch value should be >= 0");
    });

    /* _playground.errorCodes constants object
     * Validates: defined, type, number of elements, their type, ref by name
     */
    test("_playground.errorCodes constants object", function () {
        ok(typeof _playground.errorCodes === "object", "_playground.errorCodes defined");
        // CHANGE THIS VALUE WHEN ADDING OR REMOVING errorCode PROPERTIES!
        var expectedSize = 10;
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
        ok(typeof _playground.errorCodes.REQUEST_REJECTED === "number",
            "_playground.errorCodes.REQUEST_REJECTED");
        ok(typeof _playground.errorCodes.CONVERSION_ERROR === "number",
            "_playground.errorCodes.CONVERSION_ERROR");
        ok(typeof _playground.errorCodes.UNKNOWN_FUNCTION_ERROR === "number",
            "_playground.errorCodes.UNKNOWN_FUNCTION_ERROR");
        ok(typeof _playground.errorCodes.SUITEPEA_ERROR === "number",
            "_playground.errorCodes.SUITEPEA_ERROR");
        ok(typeof _playground.errorCodes.REENTRANCY_ERROR === "number",
            "_playground.errorCodes.REENTRANCY_ERROR");
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
        ok(typeof _playground.notifierOptions.interaction === "object",
           "_playground.notifierOptions.interaction defined");
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

    /* _playground.setNotifier() functional, set/reset for _playground.notifierGroup.PHOTOSHOP
     * Validates: calls for set/reset
     * These tests don't attempt to cause the event to fire, but simply call setNotifier
     * with a valid "set" inputs and then a "reset" input (callback arg == undefined)
     * Unfortunately, without triggering a callback, there isn't anything to validate
     * other than an exception isn't thrown.
     * SEE: Adapter API Blackbox Tests for coverage for this area to observe actual notifications occurring.
     */

    asyncTest("_playground.setNotifier() functional: set/reset for _playground.notifierGroup.PHOTOSHOP", function () {
        expect(3);
        var notifierGroup = _playground.notifierGroup.PHOTOSHOP;
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResult(err);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _playground.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_playground.setNotifier() functional: set/reset for _playground.notifierGroup.OS", function () {
        expect(3);
        var notifierGroup = _playground.notifierGroup.OS;
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResult(err);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _playground.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_playground.setNotifier() functional: set/reset for _playground.notifierGroup.MENU", function () {
        expect(3);
        var notifierGroup = _playground.notifierGroup.MENU;
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, menuCommand, info) {
            _validateNotifierResult(err);
            strictEqual(menuCommand, undefined, "callback menuCommand arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _playground.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_playground.setNotifier() functional: set/reset for _playground.notifierGroup.ERROR", function () {
        expect(3);
        var notifierGroup = _playground.notifierGroup.INTERACTION;
        var options = {"notificationKind": _playground.notifierOptions.interaction.ERROR};
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _playground.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

    asyncTest("_playground.setNotifier() functional: set/reset for _playground.notifierGroup.PROGRESS", function () {
        expect(3);
        var notifierGroup = _playground.notifierGroup.INTERACTION;
        var options = {"notificationKind": _playground.notifierOptions.interaction.PROGRESS};
        _playground.setNotifier(notifierGroup, options, function (err, type, info) {
            _validateNotifierResult(err);
            strictEqual(type, undefined, "callback type arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            _playground.setNotifier(notifierGroup, options, undefined);
            start();
        });
    });

// tburbage (2015/01/28): FAIL, BUT NEED REVIEW
if (0) {
    /* _playground.setNotifier() functional/negative: set with invalid notifierGroup string
     * Validates: error handling on invalid input
     */
    asyncTest("_playground.setNotifier() functional/negative: set with invalid notifierGroup string value", function () {
        expect(3);
        var notifierGroup = ""; // not a valid notifierGroup string value
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            start();
        });
    });
} // if (0)


// tburbage (2015/01/28): FAIL, BUT NEED REVIEW
if (0) {
    /* _playground.setNotifier() functional/negative: set with undefined notifierGroup
     * Validates: error handling on invalid input
     */
    asyncTest("_playground.setNotifier() functional/negative: set with undefined notifierGroup", function () {
        expect(3);
        var notifierGroup = undefined; // not a valid notifierGroup string value
        var options = {};
        _playground.setNotifier(notifierGroup, options, function (err, notificationKind, info) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            strictEqual(notificationKind, undefined, "callback notificationKind arg on set should be undefined");
            strictEqual(info, undefined, "callback info arg on set should be undefined");
            start();
        });
    });
} // if (0)
    
    /* _playground.setNotifier() functional/negative: invalid input AND undefined callback
     * Validates: A JavaScript exception should be thrown in this case
     */
    test("_playground.setNotifier() functional/negative: set with invalid input AND undefined callback", function () {
        var exceptionThrown = false;
        try {
            _playground.setNotifier(undefined, undefined, undefined);
        } catch (err) {
            console.log("DEBUG:", err.number, err.message);
            exceptionThrown = true;

        }
        ok(exceptionThrown, "Expect native Javascript exception to be thrown");
    });

    
    // ------------------------- Properties: get/set -------------------------------

    /* _playground.getPropertyValue() function, simple get: 'ui.tooltip.delay.coldToHot'
     * Validates: defined, type, simple get call and callback
     * 2015/01/14: ui.tooltip.delay.coldToHot initial value: 0.1
     */
    asyncTest("_playground.getPropertyValue(): 'ui.tooltip.delay.coldToHot'", function () {
        expect(5);
        ok(!!_playground.getPropertyValue, "_playground.getPropertyValue() defined");
        ok(typeof _playground.getPropertyValue === "function", "_playground.getPropertyValue() type");
        _playground.getPropertyValue("ui.tooltip.delay.coldToHot", {}, function (err, propertyValue) {
            _validateNotifierResult(err);
            ok(propertyValue >= 0.0, "initial value expected to be >= 0.0");
            strictEqual("number", typeof propertyValue, "'propertyValue' arg type should be 'number'");
            start();
        });
    });

    /* _playground.setPropertyValue() function, simple set: 'ui.tooltip.delay.coldToHot'
     * Validates: defined, type, simple set call and callback
     */
    asyncTest("_playground.setPropertyValue(): 'ui.tooltip.delay.coldToHot'", function () {
        expect(3);
        ok(!!_playground.setPropertyValue, "_playground.setPropertyValue() defined");
        ok(typeof _playground.setPropertyValue === "function", "_playground.setPropertyValue() type");
        _playground.setPropertyValue("ui.tooltip.delay.coldToHot", 0.1, {}, function (err) {
            _validateNotifierResult(err);
            start();
        });
    });

    /* _playground.getPropertyValue() function, simple get: 'ui.tooltip.delay.coldToHot'
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
        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _playground.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _playground.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _playground.getPropertyValue() function, simple get: 'ui.tooltip.delay.hotToHot'
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
        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _playground.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _playground.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _playground.getPropertyValue() function, simple get: 'ui.tooltip.delay.hotToCold'
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
        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            //console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new value
            _playground.setPropertyValue(propertyName, setNewValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewValue
                    strictEqual(propValue, setNewValue, "value after set to new value");
                    _playground.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for final set back to expectedDefaultValue
                            strictEqual(propValue, expectedDefaultValue, "value after set back to default value");
                            start();
                        });
                    });
                });
            });
        });
    });

    /* _playground.getPropertyValue() function, simple get: 'ui.tooltip.delay.autoHide'
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
        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
            _validateNotifierResult(err);
            // callback for the initial get
            // console.log(propertyName + " initial value:", propValue);
            strictEqual("number", typeof propValue, "propValue arg type should be 'number'");
            strictEqual(propValue, expectedDefaultValue, "compare initial propValue returned to expected default value");
            // Set to a new positive value
            _playground.setPropertyValue(propertyName, setNewPositiveValue, setOptions, function (err) {
                _validateNotifierResult(err);
                _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                    // callback for set to setNewPositiveValue
                    strictEqual(propValue, setNewPositiveValue, "value after set to new positive value");
                    // set to setToDisabledStateValue value
                    _playground.setPropertyValue(propertyName, setToDisabledStateValue, setOptions, function (err) {
                        _validateNotifierResult(err);
                        _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
                            // callback for set to setToDisabledStateValue value
                            strictEqual(propValue, setToDisabledStateValue, "value after set to setToDisabledStateValue");
                            _playground.setPropertyValue(propertyName, expectedDefaultValue, setOptions, function (err) {
                                _validateNotifierResult(err);
                                _playground.getPropertyValue(propertyName, getOptions, function (err, propValue) {
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

    /* _playground.getPropertyValue() function: negative: undefined propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.getPropertyValue(): negative: undefined propertyName arg", function () {
        expect(1);
        _playground.getPropertyValue(undefined, {}, function (err, propertyValue) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _playground.getPropertyValue() function: negative: invalid propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.getPropertyValue(): negative: invalid propertyName arg", function () {
        expect(1);
        _playground.getPropertyValue("does_not_exist", {}, function (err, propertyValue) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _playground.getPropertyValue() function: negative: undefined options arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.getPropertyValue(): negative: undefined options arg", function () {
        expect(1);
        _playground.getPropertyValue("ui.tooltip.delay.autoHide", undefined, function (err, propertyValue) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _playground.setPropertyValue() function: negative: undefined propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.setPropertyValue(): negative: undefined propertyName arg", function () {
        expect(1);
        _playground.setPropertyValue(undefined, 1.0, {}, function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _playground.setPropertyValue() function: negative: invalid propertyName arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.setPropertyValue(): negative: invalid propertyName arg", function () {
        expect(1);
        _playground.setPropertyValue("does_not_exist", 1.0, {}, function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _playground.setPropertyValue() function: negative: undefined propertyValue arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.setPropertyValue(): negative: undefined propertyValue arg", function () {
        expect(1);
        _playground.setPropertyValue("ui.tooltip.delay.autoHide", undefined, {}, function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            start();
        });
    });

    /* _playground.setPropertyValue() function: negative: invalid propertyValue arg
     * Validates: Negative input handling. A valid 'ui.tooltip.delay.hotToCold' value is >0
     */
    asyncTest("_playground.setPropertyValue(): negative: invalid propertyValue arg", function () {
        expect(1);
        _playground.setPropertyValue("ui.tooltip.delay.hotToCold", -1.0, {}, function (err) {
            _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
            start();
        });
    });

    /* _playground.setPropertyValue() function: negative: undefined options arg
     * Validates: Negative input handling
     */
    asyncTest("_playground.setPropertyValue(): negative: undefined options arg", function () {
        expect(1);
        _playground.setPropertyValue("ui.tooltip.delay.autoHide", 0, undefined, function (err, propertyValue) {
            _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
            start();
        });
    });


    // -------------------------- _playground.config ------------------------------

    /* _playground.config object
     * Validates: defined, type
     */
    test("_playground.config object defined, type", function () {
        ok(!!_playground.config, "_playground.config defined");
        ok(typeof _playground.config === "object", "_playground.config type");
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

    // tburbage (2014/12/10): Withdrawing the single execution round trip timing test
    // for now. It is very common for the very first call to exceed our max
    // round-trip time of 15ms, but subsequent executions are almost never
    // over the error threshold. The multiple iterations execution test is
    // more reliable...

    // asyncTest("_playground._debug.descriptorIdentity(): timing test (single)", function () {
    //     expect(2);
    //     var warnMaxTime = 10; // ms
    //     var errorMaxTime = 15; // ms
    //     var startTime = performance.now();
    //     _playground._debug.descriptorIdentity({}, {}, function (err, descriptor, reference) {
    //         var elapsed = performance.now() - startTime;
    //         _validateNotifierResult(err);
    //         if (elapsed > warnMaxTime && elapsed <= errorMaxTime) {
    //             console.warn("Single round trip time (", elapsed.toFixed(2),
    //                          "ms) exceeds WARN threshold (", warnMaxTime, "ms)");
    //         }
    //         ok(elapsed <= errorMaxTime,
    //            "Single round trip time (" + elapsed.toFixed(2) +
    //            "ms): should not exceed ERROR threshold (" + errorMaxTime + "ms)");
    //         start();
    //     });
    // });

    /* _playground._debug.descriptorIdentity(): timing test, multiple iterations
     */
    asyncTest("_playground._debug.descriptorIdentity(): timing test, multiple iterations", function () {
        expect(1);
        var callback = function (err, descriptor, reference) {
            timings[callbacksReceived] = performance.now();
            callbacksReceived++;
            if (callbacksReceived < iterations) {
                _playground._debug.descriptorIdentity({}, {}, callback);
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
                var reportAsWarning = avgTime > warnMaxTime && avgTime < errorMaxTime ||
                    medianTime > warnMaxTime && medianTime < errorMaxTime;
                var reportAsError = avgTime > errorMaxTime || medianTime > errorMaxTime;
                var logstring = "AVG ROUND TRIP TIME EXCEEDS THRESHOLD (warn: ";
                logstring += warnMaxTime;
                logstring += ", error: ";
                logstring += errorMaxTime;
                logstring += "): iterations:" + iterations;
                logstring += "TIMINGS (ms): avg: ";
                logstring += avgTime;
                logstring += "median: ";
                logstring += medianTime;
                logstring += "max: ";
                logstring += maxTime;
                logstring += "min: ";
                logstring += minTime;
                if (reportAsWarning) {
                    console.warn(logstring);
                }
                ok(! reportAsError, logstring);
                start();
            }
        };
        var iterations = 100;
        // WARN for Avg/median timings > warnMaxTime and < errorMaxTime (console.warn())
        // Test ERROR if either average or median is > errorMaxTime
        var warnMaxTime = 10; // ms
        var errorMaxTime = 15; // ms
        var callbacksReceived = 0;
        var timings = new Array(iterations);
        var startTime = performance.now();
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
     * SEE: Adapter API Blackbox Tests for interactive testing control
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

        _playground.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
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

        _playground.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
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

        _playground.ps.descriptor.batchPlay(commands, {}, function (err, descriptors, errors) {
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

        var options = {
            continueOnError: true
        };

        _playground.ps.descriptor.batchPlay(commands, options, function (err, descriptors, errors) {
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
     * SEE: Adapter API Blackbox Tests for full interactive testing control.
     * tburbage (2014/12/12): Since there is no way to query for initial state,
     * I'd rather not alter the UI state the user/developer may have intentionally
     * set before the tests are run.
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

    /* _playground.ps.ui.setPointerPropagationMode(), get/set.
     * Gets the initial state, sets for each of the other supported states, then back to the initial state.
     * Validates setPointerPropagationMode() and getPointerPropagationMode() callback args.
     */
    asyncTest("_playground.ps.ui.setPointerPropagationMode() get/set", function () {
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
                for (var key in _playground.ps.ui.pointerPropagationMode) {
                    if (_playground.ps.ui.pointerPropagationMode[key] !== mode) {
                        setModeList.push(_playground.ps.ui.pointerPropagationMode[key]);
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
                _playground.ps.ui.setPointerPropagationMode(options, setModeCallback);
            } else {
                start();
            }
        };

        // setPointerPropagationMode() callback
        var setModeCallback = function (err) {
            _validateNotifierResult(err);
            _playground.ps.ui.getPointerPropagationMode(getModeCallback);
        };

        var setModeList = [];
        var setModeIndex = 0;
        _playground.ps.ui.getPointerPropagationMode(getModeCallback);
    });


    // tburbage (2014/12/12): Intend to add functional test(s) for
    // _playground.ps.ui.setPointerEventPropagationPolicy()
    // after definition of what are the supported set actions is resolved.


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

    /* _playground.ps.ui.getKeyboardPropagationMode()
     * Validates: defined, type, call and callback, callback args
     * Does not assume what the returned will be (i.e. "default" value), but does validate
     * that the returned mode is a defined value in keyboardPropagationMode
     */
    asyncTest("_playground.ps.ui.getKeyboardPropagationMode() functional", function () {
        expect(4);

        ok(typeof _playground.ps.ui.getKeyboardPropagationMode === "function",
             "_playground.ps.ui.getKeyboardPropagationMode() function defined");

        _playground.ps.ui.getKeyboardPropagationMode(function (err, mode) {
            _validateNotifierResult(err);
            strictEqual(typeof mode, "number", "typeof 'mode' arg should be 'number'");
            var modeFound = false;
            for (var key in _playground.ps.ui.keyboardPropagationMode) {
                if (mode === _playground.ps.ui.keyboardPropagationMode[key]) {
                    modeFound = true;
                    break;
                }
            }
            ok(modeFound, "Returned mode should be a member of _playground.ps.ui.keyboardPropagationMode");
            start();
        });
    });

    /* _playground.ps.ui.setKeyboardPropagationMode(), get/set.
     * Gets the initial state, sets for each of the other supported states, then back to the initial state.
     * Validates setKeyboardPropagationMode() and getKeyboardPropagationMode() callback args.
     */
    asyncTest("_playground.ps.ui.setKeyboardPropagationMode() get/set", function () {
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
                for (var key in _playground.ps.ui.pointerPropagationMode) {
                    if (_playground.ps.ui.pointerPropagationMode[key] !== mode) {
                        setModeList.push(_playground.ps.ui.pointerPropagationMode[key]);
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
                _playground.ps.ui.setKeyboardPropagationMode(options, setModeCallback);
            } else {
                start();
            }
        };

        // setKeyboardPropagationMode() callback
        var setModeCallback = function (err) {
            _validateNotifierResult(err);
            _playground.ps.ui.getKeyboardPropagationMode(getModeCallback);
        };

        var setModeList = [];
        var setModeIndex = 0;
        _playground.ps.ui.getKeyboardPropagationMode(getModeCallback);
    });

    /* _playground.ps.ui.setKeyboardEventPropagationPolicy()
     * Validates: defined, type
     */
    test("_playground.ps.ui.setKeyboardEventPropagationPolicy() function defined", function () {
        ok(typeof _playground.ps.ui.setKeyboardEventPropagationPolicy === "function",
            "_playground.ps.ui.setKeyboardEventPropagationPolicy() function defined");
    });

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


    // tburbage (2014/12/12): Intend to add functional test(s) for
    // _playground.ps.ui.setKeyboardEventPropagationPolicy() functional
    // after definition of what are the supported set actions is resolved.


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

    /* Get/set the SuppressTargetPaths state
     * getSuppressTargetPaths(), setSuppressTargetPaths() functional
     * Validates: identify, call and callback args for get and set, value toggle.
     * Does not assume what the initial value is, but sets it to the inverse, then
     * back to the initial state.
     */
    asyncTest("_playground.ps.ui.setSuppressTargetPaths() get/set", function () {
        expect(13);

        ok(typeof _playground.ps.ui.getSuppressTargetPaths === "function",
             "_playground.ps.ui.getSuppressTargetPaths() function defined");

        ok(typeof _playground.ps.ui.getSuppressTargetPaths === "function",
             "_playground.ps.ui.getSuppressTargetPaths() function defined");
        
        // Initial get of startValue
        _playground.ps.ui.getSuppressTargetPaths(function (err, startValue) {
            _validateNotifierResult(err);
            strictEqual(typeof startValue, "boolean", "Result is a boolean");

            // Invert startValue state on set and compare to previousValue
            _playground.ps.ui.setSuppressTargetPaths(!startValue, function (err, previousValue) {
                _validateNotifierResult(err);
                strictEqual(typeof previousValue, "boolean", "Result is a boolean");
                strictEqual(previousValue, startValue, "previousValue returned by set should equal prior get value");

                // get to confirm set
                _playground.ps.ui.getSuppressTargetPaths(function (err, newValue) {
                    _validateNotifierResult(err);
                    strictEqual(newValue, !startValue, "newValue (on get) should equal that previously set");

                    // set back to the initial (startValue) state
                    _playground.ps.ui.setSuppressTargetPaths(startValue, function (err, previousValue) {
                        _validateNotifierResult(err);
                        strictEqual(previousValue, !startValue,
                                    "previousValue returned by set should equal prior get value");

                        // get to confirm set
                        _playground.ps.ui.getSuppressTargetPaths(function (err, endValue) {
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

    // tburbage (2014/12/12): Decided NOT to add a functional set/reset
    // for installMenu() because Designshop has a method for running these
    // tests from its own custom menu. There isn't a way to get the current
    // custom menu, install a new one, then restore the previous one (defined
    // elsewhere)
    // SEE: Adapter API Blackbox Tests, "_playground.ps.ui" section for this
    // coverage.

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
        var expectedSize = 4;
        var actualSize = Object.getOwnPropertyNames(_playground.os.eventKind).length;
        strictEqual(actualSize, expectedSize, "_playground.os.eventKind size");
        // constants
        ok(typeof _playground.os.eventKind.LEFT_MOUSE_DOWN === "number",
            "_playground.os.eventKind.LEFT_MOUSE_DOWN");
        ok(typeof _playground.os.eventKind.KEY_DOWN === "number",
            "_playground.os.eventKind.KEY_DOWN");
        ok(typeof _playground.os.eventKind.KEY_UP === "number",
            "_playground.os.eventKind.KEY_UP");
        ok(typeof _playground.os.eventKind.FLAGS_CHANGED === "number",
            "_playground.os.eventKind.FLAGS_CHANGED");
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
        var expectedSize = 30;
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

    /* _playground.os.keyboardFocus: acquire(), release(), isActive() functional
     *
     */
    asyncTest("_playground.os.keyboardFocus: acquire() / release() / isActive() functional", function () {
        expect(7);
        _playground.os.keyboardFocus.acquire({}, function (err) {
            _validateNotifierResult(err);
            _playground.os.keyboardFocus.isActive({}, function (err, value) {
                _validateNotifierResult(err);
                strictEqual(typeof value, "boolean", "value type");
                strictEqual(value, true, "focus should be active following acquire()");
                _playground.os.keyboardFocus.release({}, function (err) {
                    _validateNotifierResult(err);
                    _playground.os.keyboardFocus.isActive({}, function (err, value) {
                        _validateNotifierResult(err);
                        strictEqual(value, false, "focus should not be active following release()");
                        start();
                    });
                });
            });
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


    // ------------------------- _playground.os.clipboard ----------------------------

    /* _playground.os.clipboard object
     * Validates: defined, type
     */
    test("_playground.os.clipboard object defined, type", function () {
        ok(!!_playground.os.clipboard, "_playground.os.clipboard defined");
        ok(typeof _playground.os.clipboard === "object", "_playground.os.clipboard type");
    });


    // clipboard support currently only available for Mac
    // the negative tests will still pass because their error conditions are detected
    // before the actual interaction with the system clipboard takes place.
    if (navigator.platform !== "Win32") {


    /* _playground.os.clipboard: write(), read() functional: simple string
     * Validates: All valid args, verifies the string set on write() is the same on read()
     *
     */
    asyncTest("_playground.os.clipboard: write(), read() functional: simple string", function () {
        expect(9);
        ok(typeof _playground.os.clipboard.write === "function",
            "_playground.os.clipboard.write() function defined");
        ok(typeof _playground.os.clipboard.read === "function",
            "_playground.os.clipboard.read() function defined");
        var options = {
            "format": "string",
            "data": "_playground.os.clipboard test"
        };

        _playground.os.clipboard.write(options, function (err) {
            _validateNotifierResult(err);
            var options = {
                "formats": ["string"]
            };
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResult(err);
                strictEqual(typeof info, "object", "read() info arg");
                strictEqual(typeof info.format, "string",
                      "read() info arg, format property type");
                strictEqual(info.format, "string",
                      "read() info arg, format property value");
                strictEqual(typeof info.data, "string",
                      "read() info arg, data property type");
                strictEqual(info.data, "_playground.os.clipboard test",
                      "read() info arg, data property value");
                start();
            });
        });
    });

    /* _playground.os.clipboard: write(), read() functional: string with special and Unicode chars
     * Validates: All valid args, verifies the string set on write() is the same on read()
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#String_literals
     */
    asyncTest("_playground.os.clipboard: write(), read() functional: simple string", function () {
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

        _playground.os.clipboard.write(options, function (err) {
            _validateNotifierResult(err);
            var options = {
                "formats": ["string"]
            };
            _playground.os.clipboard.read(options, function (err, info) {
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


    } // if (navigator.platform !== "Win32")


    /* _playground.os.clipboard: write() negative: undefined 'options' arg
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: undefined 'options' arg", function () {
        expect(2);

        try {
            _playground.os.clipboard.write(undefined, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: undefined 'callback' arg
     * Expect a native error/exception to be thrown
     */
    test("_playground.os.clipboard: write() negative: undefined 'callback' arg", function () {
        var expectedErrorStr = "Async native function invoked without a notifier as the last argument.";
        var options = {
            "format": "string",
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, undefined);
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

    /* _playground.os.clipboard: write() negative: invalid 'options.format' value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' string value", function () {
        expect(2);

        var options = {
            "format": "",
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: omitted 'options.format'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: omitted 'options.format'", function () {
        expect(2);

        var options = {
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.format' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' type: undefined", function () {
        expect(2);

        var options = {
            "format": undefined,
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.format' type: number
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' type: number", function () {
        expect(2);

        var options = {
            "format": 0,
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.format' type: boolean
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' type: boolean", function () {
        expect(2);

        var options = {
            "format": false,
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.format' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' type: null", function () {
        expect(2);

        var options = {
            "format": null,
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.format' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.format' type: object", function () {
        expect(2);

        var options = {
            "format": {},
            "data": "_playground.os.clipboard test"
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: omitted 'options.data'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: omitted 'options.data'", function () {
        expect(2);

        var options = {
            "format": "string",
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.data' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.data' type: undefined", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": undefined
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.data' type: number
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.data' type: number", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": 1.5
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.data' type: boolean
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.data' type: boolean", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": true
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.data' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.data' type: null", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": null
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: write() negative: invalid 'options.data' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: write() negative: invalid 'options.data' type: object", function () {
        expect(2);

        var options = {
            "format": "string",
            "data": {}
        };

        try {
            _playground.os.clipboard.write(options, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: undefined 'options' arg
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: undefined 'options' arg", function () {
        expect(2);

        try {
            _playground.os.clipboard.read(undefined, function (err) {
                _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: undefined 'callback' arg
     * Expect a native error/exception to be thrown
     */
    test("_playground.os.clipboard: read() negative: undefined 'callback' arg", function () {
        var expectedErrorStr = "Async native function invoked without a notifier as the last argument.";
        var options = {
            "formats": ["string"]
        };

        try {
            _playground.os.clipboard.read(options, undefined);
            ok(false, "Runtime error is expected to be thrown");
        }
        catch (err) {
            strictEqual(err.message.slice(0, expectedErrorStr.length),
                        expectedErrorStr,
                        "Runtime error expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: invalid 'options.formats' type string value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: invalid 'options.formats' type string value", function () {
        expect(2);

        var options = {
            "formats": [""]
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: invalid 'options.formats' type value
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: invalid 'options.formats' type", function () {
        expect(2);

        var options = {
            "formats": "string, should be array"
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });


    /* _playground.os.clipboard: read() negative: omitted 'options.formats'
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: omitted 'options.formats'", function () {
        expect(2);

        var options = {
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: invalid 'options.formats' type: undefined
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: invalid 'options.formats' type: undefined", function () {
        expect(2);

        var options = {
            "formats": undefined,
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.CONVERSION_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: invalid 'options.formats' type: null
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: invalid 'options.formats' type: null", function () {
        expect(2);

        var options = {
            "formats": null,
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });

    /* _playground.os.clipboard: read() negative: invalid 'options.formats' type: object
     * Expect the callback notification but with an error
     * Do not expect a native error/exception to be thrown
     */
    asyncTest("_playground.os.clipboard: read() negative: invalid 'options.formats' type: object", function () {
        expect(2);

        var options = {
            "formats": {},
        };

        try {
            _playground.os.clipboard.read(options, function (err, info) {
                _validateNotifierResultError(err, _playground.errorCodes.ARGUMENT_ERROR);
                start();
            });
            ok(true, "Runtime error not expected to be thrown");
        }
        catch (err) {
            ok(false, "Runtime error not expected to be thrown");
        }
    });


    // END OF TESTS
    console.log("Adapter version",
                _playground.version.major + "." +
                _playground.version.minor + "." +
                _playground.version.patch,
                ": low level API tests completed");
});
