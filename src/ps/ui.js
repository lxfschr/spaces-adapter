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

/* global _playground */

define(function (require, exports, module) {
    "use strict";

    var EventEmitter = require("eventEmitter"),
        util = require("../util"),
        Promise = require("bluebird");

    /**
     * Promisified version of low-level keyboard focus functions
     */
    var _ui = Promise.promisifyAll(_playground.ps.ui);

    /* jshint bitwise: false */
    /**
     * Bitmask of all of the classic UI widgets we want to hide in DesignShop mode
     *
     * @const
     * @type {number}
     */
    var ALL_NONWINDOW_WIDGETS_BITMASK =
        _ui.widgetTypes.CONTROLBAR |
        _ui.widgetTypes.DOCUMENT_TABS |
        _ui.widgetTypes.PALETTE |
        _ui.widgetTypes.TOOLBAR;
    /* jshint bitwise: true */

    /**
     * The UI object provides helper methods for dealing with the
     * low-level native binding to Photoshop. This object will typically
     * not be used by user-level code.
     *
     * Emits low-level Photoshop events such as "select" with
     * the following parameters:
     *    1. @param {?} info about the event, dependent on event type (Note:
     *           this should become more specific as the native interface is
     *           further defined.)
     *
     * @extends EventEmitter
     * @constructor
     * @private
     */
    var UI = function () {
        EventEmitter.call(this);
    };
    util.inherits(UI, EventEmitter);

    /**
     * Overscroll modes
     * 
     * @const
     * @type{object.<number>}
     */
    UI.prototype.overscrollMode = _playground.ps.ui.overscrollMode;

    /**
     * Get the current Photoshop overscroll mode.
     * 
     * @see UI.prototype.overscrollMode
     * @return {Promise.<number>} Resolves with the overscroll mode
     */
    UI.prototype.getOverscrollMode = function () {
        return _ui.getOverscrollModeAsync();
    };

    /**
     * Set the current Photoshop overscroll mode.
     * 
     * @see UI.prototype.overscrollMode
     * @param {number} mode The desired overscroll model
     * @return {Promise.<number>} Resolves once the overscroll mode is set
     */
    UI.prototype.setOverscrollMode = function (mode) {
        var options = {
            mode: mode
        };

        return _ui.setOverscrollModeAsync(options);
    };

    /**
     * Determines whether the scrollbars are currently suppressed.
     * 
     * @return {Promise.<boolean>}
     */
    UI.prototype.getSuppressScrollbars = function () {
        return _ui.getSuppressScrollbarsAsync();
    };

    /**
     * Sets whether or not the scrollbars should be suppressed.
     * 
     * @param {boolean} suppress Whether or not the scrollbars should be suppressed
     * @return {Promise}
     */
    UI.prototype.setSuppressScrollbars = function (suppress) {
        return _ui.setSuppressScrollbarsAsync(suppress);
    };

    /**
     * Sets whether or not the Photoshop classic chrome is visible
     *
     * @param {boolean} visible Whether or not the chrome should be visible
     * @return {Promise}
     */
    UI.prototype.setClassicChromeVisibility = function (visible) {
        return this.setSuppressScrollbars(!visible).then(function () {
            _ui.setWidgetTypeVisibilityAsync(ALL_NONWINDOW_WIDGETS_BITMASK, visible);
        });

    };

    /** @type {UI} The UI singleton */
    var theUI = new UI();

    module.exports = theUI;
});
