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

/* global _spaces */

define(function (require, exports) {
    "use strict";

    var Promise = require("bluebird");

    /**
     * @private
     * Promisified version of _spaces.ps functions.
     */
    var _ps = Promise.promisifyAll(_spaces.ps);

    
    /**
     * Commit or cancel the current modal tool edit state.
     *
     * @param {boolean=} commit Commits if true; cancels otherwise
     * @param {options=} options
     * @return {Promise} Resolves once the modal state has ended
     */
    var endModalToolState = function (commit, options) {
        commit = commit || false;
        options = options || {
            invalidateMenus: true
        };
        
        return _ps.endModalToolStateAsync(commit)
            .then(function () {
                return _ps.processQueuedCommandsAsync(options);
            });
    };

    /**
     * Execute a Photoshop menu command.
     * Should only be used for items that are not yet implemented via ActionDescriptors
     *
     * @param {number} commandID Photoshop menu command ID
     * @return {Promise.<*>} Promise representing execution state of the menu command
     */
    var performMenuCommand = function (commandID) {
        return _ps.performMenuCommandAsync(commandID);
    };

    exports.endModalToolState = endModalToolState;
    exports.performMenuCommand = performMenuCommand;
});
