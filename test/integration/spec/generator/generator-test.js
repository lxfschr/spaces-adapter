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

/* global module, test, asyncTest, expect, ok, equal, start */

define(function (require) {
    "use strict";

    var generator = require("playground/generator"),
        testDomain = null;

    module("Generator");

    test("createDomain creates the generator-test domain", function () {
        expect(1);

        var href = window.location.href,
            playgroundHref = href.substring(0, href.lastIndexOf("/test")).substring(),
            playgroundPath = playgroundHref.substring("file://".length),
            domainSpecPath = playgroundPath + "/test/integration/spec/generator/generator-test-domain.js";

        testDomain = generator.createDomain("generator-test", domainSpecPath);

        ok(testDomain, "Test domain created");
    });

    asyncTest("generator-test domain becomes ready", function () {
        expect(1);

        testDomain.promise()
            .then(function () {
                equal(testDomain.ready(), true, "Test domain is ready");
            })
            .catch(function () {
                ok(false);
            })
            .finally(function () {
                start();
            });
    });

    asyncTest("Synchronous commands work", function () {
        expect(1);

        testDomain.exec("increment", 99)
            .then(function (value) {
                equal(value, 100, "++99 === 100");
            })
            .catch(function () {
                ok(false);
            })
            .finally(function () {
                start();
            });
    });

    asyncTest("Asynchronous commands work", function () {
        expect(1);

        testDomain.exec("incrementAsync", 99)
            .then(function (value) {
                equal(value, 100, "++99 === 100");
            })
            .catch(function () {
                ok(false);
            })
            .finally(function () {
                start();
            });
    });

    asyncTest("Events work", function () {
        expect(2);

        testDomain.exec("emitTestEvent", "hello world")
            .then(function () {
                ok(true, "emitTestEvent command completed");
            })
            .catch(function () {
                ok(false);
                start();
            });

        testDomain.once("testEvent", function (value) {
            equal(value, "hello world", "testEvent is fired with correct parameter");
            start();
        });
    });

    asyncTest("Non-existent commands fail gracefully", function () {
        expect(1);

        testDomain.exec("nonexistentCommand", "lol", "bbq")
            .then(function () {
                ok(false);
            })
            .catch(function () {
                ok(true, "Exec of nonexistent command failed gracefully");
            })
            .finally(function () {
                start();
            });
    });

    asyncTest("Progress works", function () {
        var notifications = 3;
        expect(notifications + 1);

        testDomain.exec("progressTest", notifications)
            .progressed(function (value) {
                ok(value <= notifications, "Received progress");
            })
            .then(function (value) {
                ok(value === notifications, "Progress command finished");
            })
            .catch(function () {
                ok(false);
            })
            .finally(function () {
                start();
            });
    });
});
