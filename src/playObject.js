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

define(function (require, exports, module) {
    "use strict";

    var Descriptor = require("./ps/descriptor");

    /**
     * In Playground-adapter, all library functions return PlayObjects. 
     * These PlayObjects can be called in Photoshop by passing them into 
     * ps/descriptor's playObject function.
     * 
     * @constructor
     * @param {!string} command Command name to be played
     * @param {!Object} descriptor Arguments for the command
     * @param {Object} options Options for Photoshop while playing this command
     */
    var PlayObject = function (command, descriptor, options) {
        this.command = command;
        this.descriptor = descriptor;
        this.options = {
            interactionMode: Descriptor.interactionMode.SILENT
        };

        if (options !== undefined) {
            Object.keys(options).forEach(function (property) {
                this.options[property] = options[property];
            }, this);
        }
    };

    /**
     * @type {string}
     */
    PlayObject.prototype.command = null;

    /**
     * @type {Object}
     */
    PlayObject.prototype.descriptor = null;

    /**
     * @type {Object}
     */
    PlayObject.prototype.options = null;

    
    module.exports = PlayObject;
});
