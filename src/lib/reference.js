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
 
 // This is a wrapper to create reference action descriptors
 // It accepts the class name and will return functions that create
 // descriptors for references by different proparties

define(function (require, exports, module) {
    "use strict";

    /**
     * Given a reference object created by one of the wrapper functions
     * this function will return the object name out
     *
     * @param {Array.<ActionDescriptor>|ActionDescriptor} reference Reference to an object
     * or an array of references, where last one is the object
     * @returns {string} Object type
     */
    var refersTo = function (reference) {
        if (Array.isArray(reference)) {
            return refersTo(reference[reference.length - 1]);
        } else {
            var refValue = reference._ref;
            if (Array.isArray(refValue)) {
                return refValue[0]._ref;
            } else {
                return reference._ref;
            }
        }
    };

    var wrapper = function (className) {
        /**
         * This function is boiler plate for creating reference objects
         * for given values using the given key.
         *
         * @param {string} key - Type of the reference
         * @param {int|string|Array.<int>|Array.<string>} values - 
         *  Values to be referenced with the given key
         * @returns {ActionDescriptor} Reference to the values by key
         */
        var referenceBy = function (key, values) {
            if (Array.isArray(values)) {
                return { _ref: values.map(referenceBy.bind(null, key)) };
            } else {
                var rval = { _ref: className };
                rval[key] = values;
                return rval;
            }
        };
        
        /**
         * Creates a reference object to the given enumtype/value for the class
         *
         * @param {string} type - Enumeration type
         * @param {string} value - Enumeration value
         * @returns {ActionDescriptor} Enumeration of the value with type
         */
        var enumBy = function (type, value) {
            return { _ref: className, _enum: type, _value: value };
        };
        
        return {
            /**
             * @param {int|Array.<int>} index or index array
             * @returns {ActionDescriptor} Reference to the given indices
             */
            index: referenceBy.bind(null, "_index"),
            
            /**
             * @param {int|Array.<int>} ID or ID array
             * @returns {ActionDescriptor} Reference to the given IDs
             */
            id: referenceBy.bind(null, "_id"),
            
            
            /**
             * @param {int} Offset amount
             * @returns {ActionDescriptor} Reference to the given IDs
             */
            offset: referenceBy.bind(null, "_offset"),
            
            /**
             * @param {string|Array.<string>} Name(s)
             * @returns {ActionDescriptor} Reference to the given names
             */
            name: referenceBy.bind(null, "_name"),
            
            /**
             * @returns {ActionDescriptor} Reference to the current target
             */
            target: enumBy("ordinal", "targetEnum"),
            
            /**
             * @returns {ActionDescriptor} Reference to the current target
             */
            current: enumBy("ordinal", "targetEnum"),
        
            /**
             * @returns {ActionDescriptor} Reference to the front most object
             */
            front: enumBy("ordinal", "front"),
            
            /**
             * @returns {ActionDescriptor} Reference to the object behind everything
             */
            back: enumBy("ordinal", "back"),
            
            /**
             * @returns {ActionDescriptor} Reference to all the objects
             */
            all: enumBy("ordinal", "all"),
            
            /**
             * @returns {ActionDescriptor} Reference to none of the objects
             */
            none: enumBy("ordinal", "none")
        };
    };

    module.exports.wrapper = wrapper;
    module.exports.refersTo = refersTo;
});
