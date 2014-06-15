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


/*jslint node: true*/

"use strict";

/**
 * The name of the generator bridge domain
 * 
 * @const
 * @type {string}
 */
var DOMAIN = "generator-bridge";

/**
 * The Generator object for which a bridge is created
 * 
 * @private
 * @type {Generator}
 */
var _generator = null;

/**
 * @private
 * @type {DomainManager}
 */
var _domainManager = null;

/**
 * Bridge command for Generator.prototype.getOpenDocumentIDs
 * 
 * @private
 * @param {function(?string, Array.<number>)} callback Applied to an optional
 *      error message or an array of document IDs.
 */
var _getOpenDocumentIDsCmd = function (callback) {
    _generator.getOpenDocumentIDs()
        .then(function (ids) {
            callback(null, ids);
        })
        .catch(function (err) {
            callback(err || new Error("Unknown Generator error"));
        });
};

/**
 * Bridge command for Generator.prototype.getDocumentInfo
 * 
 * @private
 * @param {number=} id Document ID
 * @param {object=} flags Optional settings
 * @param {!function(?string, object)} callback Applied to an optional
 *      error message or a raw document info object.
 */
var _getDocumentInfoCmd = function (id, flags, callback) {
    if (typeof id === "function") {
        callback = id;
        id = undefined;
        flags = undefined;
    } else if (typeof flags === "function") {
        callback = flags;
        flags = undefined;
    }

    _generator.getDocumentInfo(id, flags)
        .then(function (info) {
            callback(null, info);
        })
        .catch(function (err) {
            callback(err || new Error("Unknown Generator error"));
        });
};

/**
 * Map of event handlers for enabled Photoshop events.
 * 
 * @private
 * @type {{object: function()}}
 */
var _eventHandlers = {};

/**
 * Command to stop forwarding the given event type from Generator to the bridge.
 * 
 * @private
 * @param {string} event Type of event to stop forwarding
 */
var _removePhotoshopEventCmd = function (event) {
    if (_eventHandlers.hasOwnProperty(event)) {
        var eventHandler = _eventHandlers[event];

        _generator.removePhotoshopEventListener(event, eventHandler);
    }
};

/**
 * Command to start forwarding the given event type from Generator to the bridge.
 * 
 * @private
 * @param {string} event Type of event to start forwarding
 * @param {boolean=} once Whether to stop forwarding the event after the first 
 *      event is forwarded.
 */
var _addPhotoshopEventCmd = function (event, once) {
    if (_eventHandlers.hasOwnProperty(event)) {
        return;
    }

    var eventHandler = function (value) {
        _domainManager.emitEvent(DOMAIN, event, [value]);

        if (once) {
            _removePhotoshopEventCmd(event);
        }
    };

    _eventHandlers[event] = eventHandler;
    _domainManager.registerEvent(DOMAIN, event);

    if (once) {
        _generator.oncePhotoshopEvent(event, eventHandler);
    } else {
        _generator.onPhotoshopEvent(event, eventHandler);
    }
};

/**
 * Initialize the "generator-bridge" domain. The bridge domain provides a bridge
 * to the given Generator object.
 * 
 * @param {DomainManager} domainManager
 * @param {Generator} generator
 */
var init = function (domainManager, generator) {
    _domainManager = domainManager;
    _generator = generator;

    if (!domainManager.hasDomain(DOMAIN)) {
        domainManager.registerDomain(DOMAIN, {major: 0, minor: 1});
    }

    domainManager.registerCommand(
        DOMAIN,
        "getOpenDocumentIDs",
        _getOpenDocumentIDsCmd,
        true
    );

    domainManager.registerCommand(
        DOMAIN,
        "getDocumentInfo",
        _getDocumentInfoCmd,
        true
    );

    domainManager.registerCommand(
        DOMAIN,
        "addPhotoshopEvent",
        _addPhotoshopEventCmd,
        false
    );

    domainManager.registerCommand(
        DOMAIN,
        "removePhotoshopEvent",
        _removePhotoshopEventCmd,
        false
    );
};

exports.init = init;
