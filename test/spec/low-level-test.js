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

/* global module, test, asyncTest, ok, _playground, expect, start */

define(function () {
    "use strict";

    module("low-level");

    var validateNotifierResult = function (result) {
        ok(result === undefined || result.valueOf() === 0,
            "notifier invoked with error: " + (result === undefined ? "n.a." : result.toString()));
    };

    test("_playground object exists", function () {
        expect(1);
        ok(!!_playground, "_playground object exists");
    });

    test("_playground.ps property exists", function () {
        expect(1);
        ok(!!_playground.ps, "_playground.ps property exists");
    });

    asyncTest("_playground.ui.getScaleFactor property", function () {
        expect(2);
        
        _playground.ui.getScaleFactor(function (result, scaleFactor) {
            validateNotifierResult(result);
            ok(scaleFactor === 1 || scaleFactor === 2,
                "scale factor not the expected value. returned value is: " + scaleFactor);

            start();
        });
    });
});
