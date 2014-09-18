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

define(function (require, exports) {
    "use strict";

    var Promise = require("bluebird");

    /**
     * In this file we keep track of all currently active event policies
     * and their propagation rules
     *
     * Playground requires us to submit all policies at the same time 
     * so currently an external manager is required
     */

    
    /**
     * Promisified version of blanket set function
     */
    var _PSInstallPointerPolicyList = Promise.promisify(_playground.ps.ui.setPointerEventPropagationPolicy);
    var _PSInstallKeyboardPolicyList = Promise.promisify(_playground.ps.ui.setKeyboardEventPropagationPolicy);
    
    /** 
     * Mapping from  eventKind and modifiers and area to policy
     * Later on we should filter with areas as well
     */
    var _pointerPolicyList = {};
    
    /** 
     * Mapping from  eventKind, keyCode and modifiers to policy
     * Later on we should filter with areas as well
     */
    var _keyboardPolicyList = {};
    
    /** 
     * Possible pointer policy actions
     *
     * Alpha is the default, and means events will be handled dependent on where it is clicked
     * Always implies that all events will go to Photoshop, so Playground will not get any events.
     * Never implies all pointer events go directly to Playground, so for custom tools, this is desired
     */
    var pointerPolicyAction = {
        // Right now PlaygroundExtension.js expects policyAction instead of pointerPropagationMode
        // even though they are same values
        "ALPHA": _playground.ps.ui.policyAction.ALPHA_PROPAGATE,
        "ALWAYS": _playground.ps.ui.policyAction.ALWAYS_PROPAGATE,
        "NEVER": _playground.ps.ui.policyAction.NEVER_PROPAGATE
    };

    /** 
     * Possible keyboard policy actions
     *
     * Focus is default, and means that keyboard events will be handled by control in focus
     * Always implies that all events will go to Photoshop, so Playground will not get any events.
     * Never implies all pointer events go directly to Playground, so for custom tools, this is desired
     */
    var keyboardPolicyAction = {
        "ALPHA": _playground.ps.ui.keyboardPropagationMode.FOCUS_PROPAGATE,
        "ALWAYS": _playground.ps.ui.keyboardPropagationMode.ALWAYS_PROPAGATE,
        "NEVER": _playground.ps.ui.keyboardPropagationMode.NEVER_PROPAGATE
    };

    /**
     * Installs the given policy into Photoshop
     *
     * @param {_playground.os.eventKind} event Type of action policy listens to
     * @param {Array.<string>} modifiers Modifier keys for this policy to be hit
     * @param {[number, number, number, number]} area Optional area relative to top left corner this policy covers
     * @param {pointerPolicyAction} action Resultant policy when above conditions are met 
     *
     * @returns {Promise.<number>} Resolves to 0 if successful
     */
    var addPointerPolicy = function (event, modifiers, area, action) {
        var keyArea = area || [];

        // Key to store the policy
        var policyKey = event + ",[" + modifiers.join("+") + "],[" + keyArea.join(",") + "]";

        // TODO: Later on we should consider command on Mac / control on Win implications here
        
        // Modifiers being passed make up the bits of a number, 0 being NONE
        var psModifier = 0;
        modifiers.forEach(function (modifier) {
            psModifier += _playground.os.eventModifiers[modifier];
        });

        _pointerPolicyList[policyKey] = {
            eventKind: event,
            modifiers: psModifier,
            action: action
        };

        if (area) {
            _pointerPolicyList[policyKey].area = area;
        }

        var pointerPolicyArray = [];
        Object.keys(_pointerPolicyList).forEach(function (key) {
            pointerPolicyArray.push(_pointerPolicyList[key]);
        });

        return _PSInstallPointerPolicyList({policyList: pointerPolicyArray});

    };

    /**
     * Installs the given keyboard policy into Photoshop
     *
     * @param {_playground.os.eventKind} event Type of action policy listens to
     * @param {_playground.os.eventModifiers} modifiers Modifier keys for this policy to be hit
     * @param {_playground.os.keyCode} keyCode key this policy listens to
     * @param {keyboardPolicyAction} action Resultant policy when above conditions are met 
     *
     * @returns {Promise.<number>} Resolves to 0 if successfull
     */
    var addKeyboardPolicy = function (event, modifiers, keyCode, action) {
        // Key to store the policy
        var policyKey = event + ",[" + modifiers.join("+") + "]," + keyCode;

        // TODO: Later on we should consider command on Mac / control on Win implications here
        
        // Modifiers being passed make up the bits of a number, 0 being NONE
        var psModifier = 0;
        modifiers.forEach(function (modifier) {
            psModifier += _playground.os.eventModifiers[modifier];
        });

        _keyboardPolicyList[policyKey] = {
            eventKind: event,
            modifiers: psModifier,
            keyCode: keyCode,
            action: action
        };

        var keyboardPolicyArray = [];
        Object.keys(_keyboardPolicyList).forEach(function (key) {
            keyboardPolicyArray.push(_keyboardPolicyList[key]);
        });

        return _PSInstallKeyboardPolicyList({policyList: keyboardPolicyArray});
    };

    /**
     * Removes the given pointer policy from Photoshop
     *
     * @param {_playground.os.eventKind} event Type of action policy listens to
     * @param {Array.<string>} modifiers Modifier keys for this policy to be hit
     * @param {[number, number, number, number]} area Optional area relative to top left corner this policy covers
     *
     * @returns {Promise.<number>} Resolves to 0 if successfull
     */
    var removePointerPolicy = function (event, modifiers, area) {
        var keyArea = area || [];

        // Key to store the policy
        var policyKey = event + ",[" + modifiers.join("+") + "],[" + keyArea.join(",") + "]";

        delete _pointerPolicyList[policyKey];

        var pointerPolicyArray = [];
        Object.keys(_pointerPolicyList).forEach(function (key) {
            pointerPolicyArray.push(_pointerPolicyList[key]);
        });

        return _PSInstallPointerPolicyList({policyList: pointerPolicyArray});
    };

    /**
     * Removes the given keyboard policy from Photoshop
     *
     * @param {_playground.os.eventKind} event Type of action policy listens to
     * @param {_playground.os.eventModifiers} modifiers Modifier keys for this policy to be hit
     * @param {_playground.os.keyCode} keyCode key this policy listens to
     *
     * @returns {Promise.<number>} Resolves to 0 if successfull
     */
    var removeKeyboardPolicy = function (event, modifiers, keyCode) {
        // Key to store the policy
        var policyKey = event + ",[" + modifiers.join("+") + "]," + keyCode;

        
        delete _keyboardPolicyList[policyKey];

        var keyboardPolicyArray = [];
        Object.keys(_keyboardPolicyList).forEach(function (key) {
            keyboardPolicyArray.push(_keyboardPolicyList[key]);
        });

        return _PSInstallKeyboardPolicyList({policyList: keyboardPolicyArray});
    };

    exports.addPointerPolicy = addPointerPolicy;
    exports.addKeyboardPolicy = addKeyboardPolicy;

    exports.removePointerPolicy = removePointerPolicy;
    exports.removeKeyboardPolicy = removeKeyboardPolicy;

    exports.pointerPolicyAction = pointerPolicyAction;
    exports.keyboardPolicyAction = keyboardPolicyAction;

});
