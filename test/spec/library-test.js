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

/* global module, test, ok, expect */

define(function (require) {
    "use strict";

    var reference = require("adapter/lib/reference");

    // This module contains tests for files in src/lib
    module("library");

    test("reference.js binders build correct reference", function () {
        expect(10);
        var testRef = reference.wrapper("test");
        var referenceOf = reference.refersTo;

        ok(referenceOf(testRef.index(3)) === "test");
        ok(referenceOf(testRef.id(3)) === "test");
        ok(referenceOf(testRef.offset(3)) === "test");
        ok(referenceOf(testRef.name(3)) === "test");
        ok(referenceOf(testRef.target) === "test");
        ok(referenceOf(testRef.current) === "test");
        ok(referenceOf(testRef.front) === "test");
        ok(referenceOf(testRef.back) === "test");
        ok(referenceOf(testRef.all) === "test");
        ok(referenceOf(testRef.none) === "test");
    });
});
