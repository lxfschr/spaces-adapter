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


/*jslint vars: true, plusplus: true, devel: true, node: true, nomen: true,
indent: 4, maxerr: 50 */

"use strict";

var DOMAIN = "generator-test";

/**
 * Initialize the "testing" domain.
 * The testing domain provides utilities for tests.
 */
function init(domainManager) {

    if (!domainManager.hasDomain(DOMAIN)) {
        domainManager.registerDomain(DOMAIN, {major: 0, minor: 1});
    }

    domainManager.registerCommand(
        DOMAIN,
        "increment",
        function (value) {
            return ++value;
        },
        false,
        "Synchronously increment a number",
        [
            {
                name: "value",
                type: "number",
                description: "Value to increment"
            }
        ],
        [
            {
                type: "number",
                description: "Incremented value"
            }
        ]
    );

    domainManager.registerCommand(
        DOMAIN,
        "incrementAsync",
        function (value, callback) {
            process.nextTick(function () {
                callback(null, ++value);
            });
        },
        true,
        "Asynchronously increment a number",
        [
            {
                name: "value",
                type: "number",
                description: "Value to increment"
            }
        ],
        [
            {
                type: "number",
                description: "Incremented value"
            }
        ]
    );

    domainManager.registerCommand(
        DOMAIN,
        "emitTestEvent",
        function (value) {
            process.nextTick(function () {
                domainManager.emitEvent(DOMAIN, "testEvent", [value]);
            });
        },
        false,
        "Emit a test event with the given value as a parameter",
        [
            {
                name: "value",
                type: "number",
                description: "number to increment"
            }
        ]
    );

    domainManager.registerEvent(
        DOMAIN,
        "testEvent",
        [
            {name: "parameter", type: "?"}
        ]
    );

}

exports.init = init;
